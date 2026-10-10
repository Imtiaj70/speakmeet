import { Server, Socket } from 'socket.io';
import { roomService, RoomDocument } from '../services/roomService';
import { presenceManager } from './presenceManager';
import { AuthenticatedSocketUser } from './socketAuth';

// In-memory rate limiting map: socketId -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ACTIONS_PER_WINDOW = 15;
const WINDOW_MS = 2000;

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  let tracker = rateLimitMap.get(socketId);

  if (!tracker || now > tracker.resetTime) {
    tracker = { count: 1, resetTime: now + WINDOW_MS };
    rateLimitMap.set(socketId, tracker);
    return true;
  }

  tracker.count += 1;
  return tracker.count <= MAX_ACTIONS_PER_WINDOW;
}

function emitError(socket: Socket, code: string, message: string) {
  socket.emit('room:error', { code, message });
}

export function formatRoomState(room: RoomDocument) {
  const id = (room as any)._id ? (room as any)._id.toString() : room.id || room.slug;
  return {
    id,
    _id: id,
    name: room.name,
    slug: room.slug,
    description: room.description || '',
    hostId: room.hostId,
    hostName: room.hostName,
    hostAvatar: room.hostAvatar,
    hostCountry: room.hostCountry,
    topicId: room.topicId,
    topicTitle: room.topicTitle,
    englishLevel: room.englishLevel,
    language: room.language,
    maxParticipants: room.maxParticipants,
    participantCount: room.participantCount,
    visibility: room.visibility,
    status: room.status,
    isLocked: (room as any).isLocked || false,
    createdAt: room.createdAt ? new Date(room.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: room.updatedAt ? new Date(room.updatedAt).toISOString() : undefined,
  };
}

export function formatParticipantState(
  participant: any,
  isHost: boolean,
  isOnline: boolean
) {
  const userId = participant.userId || participant.id || participant._id?.toString();
  return {
    userId,
    username: participant.username || 'Speaker',
    displayName: participant.displayName || participant.username || 'Speaker',
    photoURL: participant.photoURL || participant.avatar,
    avatar: participant.avatar || participant.photoURL,
    country: participant.country || 'Global',
    englishLevel: participant.englishLevel || 'Intermediate',
    role: isHost ? 'host' : participant.role || 'participant',
    joinedAt: participant.joinedAt ? new Date(participant.joinedAt).toISOString() : new Date().toISOString(),
    isMuted: !!participant.isMuted,
    isHost,
    isOnline,
  };
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as AuthenticatedSocketUser;

  if (!user) {
    emitError(socket, 'UNAUTHORIZED', 'Session unauthenticated.');
    socket.disconnect(true);
    return;
  }

  /**
   * room:join
   * Client payload: { roomId: string }
   */
  socket.on('room:join', async (payload: { roomId?: string }) => {
    if (!checkRateLimit(socket.id)) {
      emitError(socket, 'RATE_LIMITED', 'Too many requests. Please slow down.');
      return;
    }

    const { roomId } = payload || {};
    if (!roomId || typeof roomId !== 'string') {
      emitError(socket, 'INVALID_ROOM_ID', 'A valid roomId is required.');
      return;
    }

    try {
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        emitError(socket, 'ROOM_NOT_FOUND', 'This speaking room could not be found.');
        return;
      }

      if (room.status === 'closed') {
        emitError(socket, 'ROOM_CLOSED', 'This room has ended and is closed.');
        return;
      }

      const cleanRoomId = (room as any)._id?.toString() || room.id || roomId;

      // Check existing participants in room
      const currentParticipants = await roomService.getRoomParticipants(cleanRoomId);
      const isAlreadyMember = currentParticipants.some(
        (p) => p.userId === user.id || p.userId === user.uid
      );

      // If not yet a persistent member in DB, add user using existing RoomService logic
      if (!isAlreadyMember) {
        if (room.participantCount >= room.maxParticipants) {
          emitError(socket, 'ROOM_FULL', 'This room has reached maximum capacity.');
          return;
        }

        try {
          await roomService.joinRoom(cleanRoomId, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          });
        } catch (joinErr: any) {
          // If concurrent request already added user, continue safely
          if (!joinErr.message?.includes('already joined')) {
            emitError(socket, 'SERVER_ERROR', joinErr.message || 'Could not join room.');
            return;
          }
        }
      }

      // Join Socket.IO room channel
      const socketRoomName = `room:${cleanRoomId}`;
      socket.join(socketRoomName);

      // Register presence
      const { isFirstSocketInRoom } = presenceManager.joinRoom(
        socket.id,
        user.id,
        cleanRoomId
      );

      // Fetch fresh authoritative state
      const updatedRoom = (await roomService.getRoomById(cleanRoomId)) || room;
      const updatedParticipants = await roomService.getRoomParticipants(cleanRoomId);

      const formattedParticipants = updatedParticipants.map((p) => {
        const isHost = p.role === 'host' || updatedRoom.hostId === p.userId;
        const isOnline = presenceManager.isUserLiveInRoom(p.userId, cleanRoomId);
        return formatParticipantState(p, isHost, isOnline);
      });

      // Send complete authoritative room state to the joining user
      socket.emit('room:state', {
        room: formatRoomState(updatedRoom),
        participants: formattedParticipants,
      });

      // Find joining participant record
      const joiningParticipant = formattedParticipants.find(
        (p) => p.userId === user.id || p.userId === user.uid
      );

      if (joiningParticipant && isFirstSocketInRoom) {
        // Broadcast new participant to other connected members
        socket.to(socketRoomName).emit('room:participant-joined', {
          participant: joiningParticipant,
        });

        // Also broadcast room update to ensure participant count is in sync
        socket.to(socketRoomName).emit('room:updated', {
          room: formatRoomState(updatedRoom),
        });
      } else if (joiningParticipant) {
        // Returning online
        socket.to(socketRoomName).emit('room:participant-updated', {
          participant: joiningParticipant,
          userId: user.id,
          isOnline: true,
        });
      }
    } catch (err: any) {
      console.error('[room:join] Error:', err);
      emitError(socket, 'SERVER_ERROR', 'Internal error while joining speaking room.');
    }
  });

  /**
   * room:leave
   * Client payload: { roomId: string }
   */
  socket.on('room:leave', async (payload: { roomId?: string }) => {
    if (!checkRateLimit(socket.id)) {
      emitError(socket, 'RATE_LIMITED', 'Too many requests. Please slow down.');
      return;
    }

    const { roomId } = payload || {};
    if (!roomId || typeof roomId !== 'string') {
      emitError(socket, 'INVALID_ROOM_ID', 'A valid roomId is required.');
      return;
    }

    try {
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        emitError(socket, 'ROOM_NOT_FOUND', 'Speaking room not found.');
        return;
      }

      const cleanRoomId = (room as any)._id?.toString() || room.id || roomId;
      const socketRoomName = `room:${cleanRoomId}`;

      // Call Phase 3 leave logic
      const result = await roomService.leaveRoom(cleanRoomId, { uid: user.uid });

      // Leave socket room channel & clear presence
      socket.leave(socketRoomName);
      presenceManager.leaveRoom(socket.id, cleanRoomId);

      // Broadcast participant left
      io.to(socketRoomName).emit('room:participant-left', {
        userId: user.id,
      });

      if (result.roomClosed) {
        io.to(socketRoomName).emit('room:closed', {
          roomId: cleanRoomId,
        });
      } else {
        // Fetch updated room
        const updatedRoom = await roomService.getRoomById(cleanRoomId);
        if (updatedRoom) {
          if (result.newHost) {
            io.to(socketRoomName).emit('room:host-changed', {
              hostId: updatedRoom.hostId,
              hostName: updatedRoom.hostName,
            });
          }
          io.to(socketRoomName).emit('room:updated', {
            room: formatRoomState(updatedRoom),
          });
        }
      }
    } catch (err: any) {
      console.error('[room:leave] Error:', err);
      emitError(socket, 'SERVER_ERROR', err.message || 'Error leaving room.');
    }
  });

  /**
   * room:toggle_lock
   * Host locks or unlocks the room
   */
  socket.on('room:toggle_lock', async (payload: { roomId?: string; isLocked?: boolean }) => {
    const { roomId, isLocked } = payload || {};
    if (!roomId) return;

    try {
      const updated = await roomService.toggleRoomLock(roomId, { uid: user.id }, isLocked);
      const cleanRoomId = (updated as any)._id?.toString() || updated.id || roomId;
      const socketRoomName = `room:${cleanRoomId}`;

      io.to(socketRoomName).emit('room:locked_changed', {
        roomId: cleanRoomId,
        isLocked: updated.isLocked,
        byUser: user.displayName || user.username,
      });

      io.to(socketRoomName).emit('room:updated', {
        room: formatRoomState(updated),
      });
    } catch (err: any) {
      console.error('[room:toggle_lock] Error:', err);
      emitError(socket, 'ROOM_LOCK_ERROR', err.message || 'Failed to toggle room lock');
    }
  });

  /**
   * room:screen_share
   * Participant starts or stops screen sharing
   */
  socket.on('room:screen_share', (payload: { roomId?: string; isSharing: boolean }) => {
    const { roomId, isSharing } = payload || {};
    if (!roomId) return;

    const socketRoomName = `room:${roomId}`;
    io.to(socketRoomName).emit('room:screen_share_changed', {
      roomId,
      userId: user.id,
      username: user.displayName || user.username || 'Speaker',
      isSharing: !!isSharing,
    });
  });

  /**
   * room:sync
   * Client requests full fresh room state (e.g., after reconnect)
   */
  socket.on('room:sync', async (payload: { roomId?: string }) => {
    if (!checkRateLimit(socket.id)) {
      emitError(socket, 'RATE_LIMITED', 'Too many requests. Please slow down.');
      return;
    }

    const { roomId } = payload || {};
    if (!roomId || typeof roomId !== 'string') {
      emitError(socket, 'INVALID_ROOM_ID', 'A valid roomId is required.');
      return;
    }

    try {
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        emitError(socket, 'ROOM_NOT_FOUND', 'Speaking room not found.');
        return;
      }

      const cleanRoomId = (room as any)._id?.toString() || room.id || roomId;
      const socketRoomName = `room:${cleanRoomId}`;

      // Ensure socket is joined to room channel
      socket.join(socketRoomName);
      presenceManager.joinRoom(socket.id, user.id, cleanRoomId);

      const participants = await roomService.getRoomParticipants(cleanRoomId);
      const formattedParticipants = participants.map((p) => {
        const isHost = p.role === 'host' || room.hostId === p.userId;
        const isOnline = presenceManager.isUserLiveInRoom(p.userId, cleanRoomId);
        return formatParticipantState(p, isHost, isOnline);
      });

      socket.emit('room:state', {
        room: formatRoomState(room),
        participants: formattedParticipants,
      });
    } catch (err: any) {
      console.error('[room:sync] Error:', err);
      emitError(socket, 'SERVER_ERROR', 'Failed to synchronize room state.');
    }
  });

  /**
   * disconnect
   * Socket connection closed (tab close, network drop, etc.)
   */
  socket.on('disconnect', () => {
    rateLimitMap.delete(socket.id);
    const disconnectEvents = presenceManager.handleDisconnect(socket.id);

    for (const evt of disconnectEvents) {
      if (evt.wasLastSocket) {
        // User no longer has any active tabs/sockets in this room
        io.to(`room:${evt.roomId}`).emit('room:participant-updated', {
          userId: evt.userId,
          isOnline: false,
        });
      }
    }
  });
}
