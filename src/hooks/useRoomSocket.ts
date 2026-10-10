import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';
import { SpeakingRoom, RoomParticipant } from '../types';
import { playJoinSound, playLeaveSound, playLockSound } from '../utils/roomSounds';

export interface StructuredRoomError {
  code: string;
  message: string;
}

export interface ScreenShareState {
  userId: string;
  username: string;
  isSharing: boolean;
}

export interface UseRoomSocketReturn {
  room: SpeakingRoom | null;
  participants: RoomParticipant[];
  isConnected: boolean;
  isReconnecting: boolean;
  isClosed: boolean;
  error: StructuredRoomError | null;
  activeScreenShare: ScreenShareState | null;
  joinRoom: () => void;
  leaveRoom: () => Promise<void>;
  syncRoom: () => void;
  toggleLock: (isLocked?: boolean) => void;
}

export function useRoomSocket(roomId: string | undefined): UseRoomSocketReturn {
  const queryClient = useQueryClient();

  const [room, setRoom] = useState<SpeakingRoom | null>(() => {
    if (!roomId) return null;
    return queryClient.getQueryData<SpeakingRoom>(['room', roomId]) || null;
  });

  const [participants, setParticipants] = useState<RoomParticipant[]>(() => {
    if (!roomId) return [];
    return queryClient.getQueryData<RoomParticipant[]>(['roomParticipants', roomId]) || [];
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [error, setError] = useState<StructuredRoomError | null>(null);
  const [activeScreenShare, setActiveScreenShare] = useState<ScreenShareState | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeRoomIdRef = useRef<string | undefined>(roomId);

  useEffect(() => {
    activeRoomIdRef.current = roomId;
  }, [roomId]);

  // Request authoritative state sync
  const syncRoom = useCallback(() => {
    if (socketRef.current && socketRef.current.connected && activeRoomIdRef.current) {
      socketRef.current.emit('room:sync', { roomId: activeRoomIdRef.current });
    }
  }, []);

  // Request room join
  const joinRoom = useCallback(() => {
    if (socketRef.current && socketRef.current.connected && activeRoomIdRef.current) {
      socketRef.current.emit('room:join', { roomId: activeRoomIdRef.current });
    }
  }, []);

  // Request room lock toggle (host only)
  const toggleLock = useCallback((isLocked?: boolean) => {
    if (socketRef.current && socketRef.current.connected && activeRoomIdRef.current) {
      socketRef.current.emit('room:toggle_lock', {
        roomId: activeRoomIdRef.current,
        isLocked,
      });
    }
  }, []);

  // Request room leave
  const leaveRoom = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      if (socketRef.current && socketRef.current.connected && activeRoomIdRef.current) {
        socketRef.current.emit('room:leave', { roomId: activeRoomIdRef.current });
      }
      resolve();
    });
  }, []);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setParticipants([]);
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    async function init() {
      const socket = await getSocket();
      if (!isMounted || !socket) return;
      socketRef.current = socket;

      if (socket.connected) {
        setIsConnected(true);
        setIsReconnecting(false);
        // Join room channel
        socket.emit('room:join', { roomId });
      }

      // Connection event listeners
      const handleConnect = () => {
        if (!isMounted) return;
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        socket.emit('room:join', { roomId });
      };

      const handleDisconnect = () => {
        if (!isMounted) return;
        setIsConnected(false);
      };

      const handleReconnectAttempt = () => {
        if (!isMounted) return;
        setIsReconnecting(true);
      };

      const handleReconnect = () => {
        if (!isMounted) return;
        setIsConnected(true);
        setIsReconnecting(false);
        // Request sync on reconnect
        socket.emit('room:sync', { roomId });
      };

      const handleConnectError = (err: any) => {
        if (!isMounted) return;
        setIsConnected(false);
        setIsReconnecting(false);
        setError({
          code: 'CONNECTION_ERROR',
          message: err?.message || 'Failed to connect to real-time room server.',
        });
      };

      // Room-specific event listeners
      const handleRoomState = (data: { room: SpeakingRoom; participants: RoomParticipant[] }) => {
        if (!isMounted || !data) return;
        const normalizedRoom = {
          ...data.room,
          currentParticipants: data.participants.length,
          participantCount: data.participants.length,
        };

        setRoom(normalizedRoom);
        setParticipants(data.participants);
        setIsClosed(data.room.status === 'closed');
        setError(null);

        // Update TanStack Query cache for seamless SPA integration
        queryClient.setQueryData(['room', roomId], normalizedRoom);
        queryClient.setQueryData(['roomParticipants', roomId], data.participants);
      };

      const handleParticipantJoined = (data: { participant: RoomParticipant }) => {
        if (!isMounted || !data?.participant) return;
        const newPart = data.participant;

        playJoinSound();

        setParticipants((prev) => {
          // Idempotent insertion
          const exists = prev.some((p) => p.userId === newPart.userId);
          const updated = exists
            ? prev.map((p) => (p.userId === newPart.userId ? { ...p, ...newPart, isOnline: true } : p))
            : [...prev, { ...newPart, isOnline: true }];

          queryClient.setQueryData(['roomParticipants', roomId], updated);
          return updated;
        });

        setRoom((prev) => {
          if (!prev) return null;
          const updatedCount = prev.participantCount ? prev.participantCount + 1 : prev.currentParticipants + 1;
          const updatedRoom = {
            ...prev,
            participantCount: updatedCount,
            currentParticipants: updatedCount,
            status: 'active' as const,
          };
          queryClient.setQueryData(['room', roomId], updatedRoom);
          return updatedRoom;
        });
      };

      const handleParticipantLeft = (data: { userId: string }) => {
        if (!isMounted || !data?.userId) return;
        const departedUserId = data.userId;

        playLeaveSound();

        setParticipants((prev) => {
          const updated = prev.filter((p) => p.userId !== departedUserId);
          queryClient.setQueryData(['roomParticipants', roomId], updated);
          return updated;
        });

        setRoom((prev) => {
          if (!prev) return null;
          const updatedCount = Math.max(0, (prev.participantCount || 1) - 1);
          const updatedRoom = {
            ...prev,
            participantCount: updatedCount,
            currentParticipants: updatedCount,
          };
          queryClient.setQueryData(['room', roomId], updatedRoom);
          return updatedRoom;
        });
      };

      const handleParticipantUpdated = (data: {
        userId: string;
        isOnline?: boolean;
        participant?: Partial<RoomParticipant>;
      }) => {
        if (!isMounted || !data?.userId) return;

        setParticipants((prev) => {
          const updated = prev.map((p) => {
            if (p.userId === data.userId) {
              return {
                ...p,
                ...(data.participant || {}),
                isOnline: data.isOnline !== undefined ? data.isOnline : p.isOnline,
              };
            }
            return p;
          });
          queryClient.setQueryData(['roomParticipants', roomId], updated);
          return updated;
        });
      };

      const handleHostChanged = (data: { hostId: string; hostName: string }) => {
        if (!isMounted || !data) return;

        setRoom((prev) => {
          if (!prev) return null;
          const updated = {
            ...prev,
            hostId: data.hostId,
            hostName: data.hostName,
          };
          queryClient.setQueryData(['room', roomId], updated);
          return updated;
        });

        setParticipants((prev) => {
          const updated = prev.map((p) => ({
            ...p,
            isHost: p.userId === data.hostId,
            role: (p.userId === data.hostId ? 'host' : p.role === 'host' ? 'participant' : p.role) as any,
          }));
          queryClient.setQueryData(['roomParticipants', roomId], updated);
          return updated;
        });
      };

      const handleRoomUpdated = (data: { room: SpeakingRoom }) => {
        if (!isMounted || !data?.room) return;
        setRoom((prev) => {
          const updated = {
            ...(prev || {}),
            ...data.room,
          };
          queryClient.setQueryData(['room', roomId], updated);
          return updated;
        });
        if (data.room.status === 'closed') {
          setIsClosed(true);
        }
      };

      const handleRoomClosed = (data: { roomId: string }) => {
        if (!isMounted) return;
        setIsClosed(true);
        setRoom((prev) => {
          if (!prev) return null;
          const updated = { ...prev, status: 'closed' as const };
          queryClient.setQueryData(['room', roomId], updated);
          return updated;
        });
      };

      const handleRoomError = (errData: { code: string; message: string }) => {
        if (!isMounted) return;
        setError(errData);
      };

      const handleLockedChanged = (data: { roomId: string; isLocked: boolean }) => {
        if (!isMounted) return;
        playLockSound(data.isLocked);
        setRoom((prev) => {
          if (!prev) return null;
          const updated = { ...prev, isLocked: data.isLocked };
          queryClient.setQueryData(['room', roomId], updated);
          return updated;
        });
      };

      const handleScreenShareChanged = (data: ScreenShareState & { roomId: string }) => {
        if (!isMounted) return;
        if (data.isSharing) {
          setActiveScreenShare({
            userId: data.userId,
            username: data.username,
            isSharing: true,
          });
        } else {
          setActiveScreenShare((prev) => (prev?.userId === data.userId ? null : prev));
        }
      };

      // Register listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.io.on('reconnect_attempt', handleReconnectAttempt);
      socket.on('reconnect', handleReconnect);
      socket.on('connect_error', handleConnectError);

      socket.on('room:state', handleRoomState);
      socket.on('room:participant-joined', handleParticipantJoined);
      socket.on('room:participant-left', handleParticipantLeft);
      socket.on('room:participant-updated', handleParticipantUpdated);
      socket.on('room:host-changed', handleHostChanged);
      socket.on('room:updated', handleRoomUpdated);
      socket.on('room:closed', handleRoomClosed);
      socket.on('room:error', handleRoomError);
      socket.on('room:locked_changed', handleLockedChanged);
      socket.on('room:screen_share_changed', handleScreenShareChanged);

      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.io.off('reconnect_attempt', handleReconnectAttempt);
        socket.off('reconnect', handleReconnect);
        socket.off('connect_error', handleConnectError);

        socket.off('room:state', handleRoomState);
        socket.off('room:participant-joined', handleParticipantJoined);
        socket.off('room:participant-left', handleParticipantLeft);
        socket.off('room:participant-updated', handleParticipantUpdated);
        socket.off('room:host-changed', handleHostChanged);
        socket.off('room:updated', handleRoomUpdated);
        socket.off('room:closed', handleRoomClosed);
        socket.off('room:error', handleRoomError);
        socket.off('room:locked_changed', handleLockedChanged);
        socket.off('room:screen_share_changed', handleScreenShareChanged);
      };
    }

    const cleanupPromise = init();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [roomId, queryClient]);

  return {
    room,
    participants,
    isConnected,
    isReconnecting,
    isClosed,
    error,
    activeScreenShare,
    joinRoom,
    leaveRoom,
    syncRoom,
    toggleLock,
  };
}
