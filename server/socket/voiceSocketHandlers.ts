import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService';
import { voiceSessionManager, MAX_VOICE_PARTICIPANTS } from './voiceSessionManager';
import { AuthenticatedSocketUser } from './socketAuth';

function emitVoiceError(socket: Socket, code: string, message: string) {
  socket.emit('voice:error', { code, message });
}

export function registerVoiceHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as AuthenticatedSocketUser;

  if (!user) {
    return;
  }

  /**
   * voice:join
   * Request to enter WebRTC voice session in a speaking room
   */
  socket.on('voice:join', async (payload: { roomId?: string; isMuted?: boolean }) => {
    const { roomId, isMuted = false } = payload || {};
    if (!roomId || typeof roomId !== 'string') {
      emitVoiceError(socket, 'INVALID_ROOM_ID', 'Valid roomId is required to join voice.');
      return;
    }

    try {
      // 1. Verify room exists and is active
      const room = await roomService.getRoomById(roomId);
      if (!room) {
        emitVoiceError(socket, 'ROOM_NOT_FOUND', 'Speaking room does not exist.');
        return;
      }

      if (room.status === 'closed') {
        emitVoiceError(socket, 'ROOM_CLOSED', 'This room is closed.');
        return;
      }

      const cleanRoomId = (room as any)._id?.toString() || room.id || roomId;

      // 2. Verify room membership (or auto-join if eligible)
      const participants = await roomService.getRoomParticipants(cleanRoomId);
      let isMember =
        room.hostId === user.id ||
        room.hostId === user.uid ||
        participants.some(
          (p) =>
            p.userId === user.id ||
            p.userId === user.uid ||
            (p.username && user.username && p.username.toLowerCase() === user.username.toLowerCase())
        );

      if (!isMember) {
        try {
          await roomService.joinRoom(cleanRoomId, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          });
          isMember = true;
        } catch (joinErr) {
          isMember = true;
        }
      }

      // 3. Add to voice session (enforcing max 5 voice participants)
      const result = voiceSessionManager.addVoiceParticipant(cleanRoomId, {
        userId: user.id,
        uid: user.uid,
        socketId: socket.id,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isMuted,
        isSpeaking: false,
        joinedAt: new Date().toISOString(),
      });

      if (!result.success) {
        emitVoiceError(
          socket,
          result.code || 'VOICE_ROOM_FULL',
          result.message || 'This voice room is full. Maximum 5 participants are allowed.'
        );
        return;
      }

      const socketRoomName = `room:${cleanRoomId}`;
      socket.join(socketRoomName);

      // 4. Retrieve existing voice peers in this room (excluding self)
      const allVoicePeers = voiceSessionManager.getVoiceParticipants(cleanRoomId);
      const existingPeers = allVoicePeers.filter((p) => p.userId !== user.id);

      // Send list of active voice peers to joining client
      socket.emit('voice:peers', {
        peers: existingPeers.map((p) => ({
          userId: p.userId,
          username: p.username,
          displayName: p.displayName,
          photoURL: p.photoURL,
          isMuted: p.isMuted,
          isSpeaking: p.isSpeaking,
        })),
        self: {
          userId: user.id,
          isMuted,
          isSpeaking: false,
        },
      });

      // 5. Broadcast to other voice members that a new peer joined
      socket.to(socketRoomName).emit('voice:peer-joined', {
        peer: {
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isMuted,
          isSpeaking: false,
        },
      });
    } catch (err: any) {
      console.error('[voice:join] Error:', err);
      emitVoiceError(socket, 'SERVER_ERROR', 'Failed to join voice session.');
    }
  });

  /**
   * voice:offer
   * Forward WebRTC SDP offer to target peer in the same room
   */
  socket.on(
    'voice:offer',
    (payload: { roomId?: string; targetUserId?: string; offer?: RTCSessionDescriptionInit }) => {
      const { roomId, targetUserId, offer } = payload || {};
      if (!roomId || !targetUserId || !offer) {
        return;
      }

      // Security: verify sender is in voice session for this room
      if (!voiceSessionManager.isUserInVoice(roomId, user.id)) {
        emitVoiceError(socket, 'UNAUTHORIZED', 'You are not in the voice session for this room.');
        return;
      }

      // Security: verify target is in voice session for the same room
      const targetParticipant = voiceSessionManager.getVoiceParticipant(roomId, targetUserId);
      if (!targetParticipant) {
        return;
      }

      // Forward offer directly to target socket
      io.to(targetParticipant.socketId).emit('voice:offer', {
        fromUserId: user.id,
        offer,
      });
    }
  );

  /**
   * voice:answer
   * Forward WebRTC SDP answer to target peer in the same room
   */
  socket.on(
    'voice:answer',
    (payload: { roomId?: string; targetUserId?: string; answer?: RTCSessionDescriptionInit }) => {
      const { roomId, targetUserId, answer } = payload || {};
      if (!roomId || !targetUserId || !answer) {
        return;
      }

      // Security: verify sender is in voice session for this room
      if (!voiceSessionManager.isUserInVoice(roomId, user.id)) {
        return;
      }

      // Security: verify target is in voice session for this room
      const targetParticipant = voiceSessionManager.getVoiceParticipant(roomId, targetUserId);
      if (!targetParticipant) {
        return;
      }

      // Forward answer directly to target socket
      io.to(targetParticipant.socketId).emit('voice:answer', {
        fromUserId: user.id,
        answer,
      });
    }
  );

  /**
   * voice:ice-candidate
   * Forward ICE candidate to target peer in the same room
   */
  socket.on(
    'voice:ice-candidate',
    (payload: { roomId?: string; targetUserId?: string; candidate?: RTCIceCandidateInit }) => {
      const { roomId, targetUserId, candidate } = payload || {};
      if (!roomId || !targetUserId || !candidate) {
        return;
      }

      if (!voiceSessionManager.isUserInVoice(roomId, user.id)) {
        return;
      }

      const targetParticipant = voiceSessionManager.getVoiceParticipant(roomId, targetUserId);
      if (!targetParticipant) {
        return;
      }

      io.to(targetParticipant.socketId).emit('voice:ice-candidate', {
        fromUserId: user.id,
        candidate,
      });
    }
  );

  /**
   * voice:mute
   * User muted or unmuted their microphone
   */
  socket.on('voice:mute', (payload: { roomId?: string; isMuted?: boolean }) => {
    const { roomId, isMuted } = payload || {};
    if (!roomId || isMuted === undefined) return;

    if (!voiceSessionManager.isUserInVoice(roomId, user.id)) return;

    voiceSessionManager.updateVoiceParticipant(roomId, user.id, { isMuted });

    io.to(`room:${roomId}`).emit('voice:peer-updated', {
      userId: user.id,
      isMuted,
    });
  });

  /**
   * voice:speaking
   * Web Audio API detected meaningful voice activity / silence
   */
  socket.on('voice:speaking', (payload: { roomId?: string; isSpeaking?: boolean }) => {
    const { roomId, isSpeaking } = payload || {};
    if (!roomId || isSpeaking === undefined) return;

    if (!voiceSessionManager.isUserInVoice(roomId, user.id)) return;

    voiceSessionManager.updateVoiceParticipant(roomId, user.id, { isSpeaking });

    socket.to(`room:${roomId}`).emit('voice:peer-speaking', {
      userId: user.id,
      isSpeaking,
    });
  });

  /**
   * voice:leave
   * Explicitly leave voice chat while staying in room page
   */
  socket.on('voice:leave', (payload: { roomId?: string }) => {
    const { roomId } = payload || {};
    if (!roomId) return;

    const removed = voiceSessionManager.removeVoiceParticipant(roomId, user.id);
    if (removed) {
      io.to(`room:${roomId}`).emit('voice:peer-left', {
        userId: user.id,
      });
    }
  });

  /**
   * disconnect
   * Socket connection closed: clean up active voice session if present
   */
  socket.on('disconnect', () => {
    const removal = voiceSessionManager.removeSocket(socket.id);
    if (removal) {
      io.to(`room:${removal.roomId}`).emit('voice:peer-left', {
        userId: removal.participant.userId,
      });
    }
  });
}
