import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';
import { WebRTCService } from '../services/webrtcService';
import { SpeakingDetector } from '../services/speakingDetector';
import { useAuth } from '../context/AuthContext';

export interface VoiceParticipantState {
  userId: string;
  username: string;
  displayName: string;
  photoURL?: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

export interface UseVoiceRoomReturn {
  isVoiceJoined: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  voiceParticipants: VoiceParticipantState[];
  connectionStates: Record<string, RTCPeerConnectionState>;
  error: { code: string; message: string } | null;
  joinVoice: () => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  clearError: () => void;
}

export function useVoiceRoom(roomId: string | undefined): UseVoiceRoomReturn {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id || user?.firebaseUid || '';

  const [isVoiceJoined, setIsVoiceJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipantState[]>([]);
  const [connectionStates, setConnectionStates] = useState<Record<string, RTCPeerConnectionState>>({});
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);
  const speakingDetectorRef = useRef<SpeakingDetector | null>(null);
  const isJoinedRef = useRef(false);
  const roomIdRef = useRef(roomId);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    isJoinedRef.current = isVoiceJoined;
  }, [isVoiceJoined]);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize WebRTC Service with callbacks
  useEffect(() => {
    const webrtc = new WebRTCService({
      onIceCandidate: (targetUserId, candidate) => {
        if (socketRef.current?.connected && roomIdRef.current) {
          socketRef.current.emit('voice:ice-candidate', {
            roomId: roomIdRef.current,
            targetUserId,
            candidate,
          });
        }
      },
      onRemoteStream: (targetUserId, stream) => {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.set(targetUserId, stream);
          return updated;
        });
      },
      onRemoteStreamRemoved: (targetUserId) => {
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(targetUserId);
          return updated;
        });
      },
      onConnectionStateChange: (targetUserId, state) => {
        setConnectionStates((prev) => ({
          ...prev,
          [targetUserId]: state,
        }));
      },
      onScreenShareEnded: () => {
        setIsScreenSharing(false);
        setScreenStream(null);
        if (socketRef.current?.connected && roomIdRef.current) {
          socketRef.current.emit('room:screen_share', {
            roomId: roomIdRef.current,
            isSharing: false,
          });
        }
      },
    });

    webrtcServiceRef.current = webrtc;

    return () => {
      webrtc.cleanup();
    };
  }, []);

  // Initialize Speaking Detector
  useEffect(() => {
    const detector = new SpeakingDetector({
      threshold: 0.012,
      debounceTimeMs: 150,
      onSpeakingChange: (speaking) => {
        setIsSpeaking(speaking);
        if (socketRef.current?.connected && roomIdRef.current && isJoinedRef.current) {
          socketRef.current.emit('voice:speaking', {
            roomId: roomIdRef.current,
            isSpeaking: speaking,
          });
        }
      },
    });

    speakingDetectorRef.current = detector;

    return () => {
      detector.destroy();
    };
  }, []);

  // Socket event listener setup
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    async function setupSocket() {
      const socket = await getSocket();
      if (!isMounted || !socket) return;
      socketRef.current = socket;

      // 1. Existing voice peers list received from server
      const handleVoicePeers = async (data: { peers: VoiceParticipantState[] }) => {
        if (!isMounted) return;
        const peers = data.peers || [];
        setVoiceParticipants(peers);
        setIsVoiceJoined(true);
        setIsConnecting(false);
        setError(null);

        // Deterministic Initiator Strategy:
        // Peer with lexicographically smaller UID creates the offer.
        for (const peer of peers) {
          if (currentUserId && currentUserId < peer.userId) {
            try {
              const offer = await webrtcServiceRef.current?.createOffer(peer.userId);
              if (offer && socket.connected) {
                socket.emit('voice:offer', {
                  roomId,
                  targetUserId: peer.userId,
                  offer,
                });
              }
            } catch (offerErr) {
              console.warn('[useVoiceRoom] createOffer error:', offerErr);
            }
          }
        }
      };

      // 2. Another peer joined the voice session
      const handlePeerJoined = async (data: { peer: VoiceParticipantState }) => {
        if (!isMounted || !data.peer) return;
        const newPeer = data.peer;

        setVoiceParticipants((prev) => {
          if (prev.some((p) => p.userId === newPeer.userId)) {
            return prev.map((p) => (p.userId === newPeer.userId ? { ...p, ...newPeer } : p));
          }
          return [...prev, newPeer];
        });

        // Deterministic Initiator: if myUserId < newPeer.userId, create offer
        if (currentUserId && currentUserId < newPeer.userId) {
          try {
            const offer = await webrtcServiceRef.current?.createOffer(newPeer.userId);
            if (offer && socket.connected) {
              socket.emit('voice:offer', {
                roomId,
                targetUserId: newPeer.userId,
                offer,
              });
            }
          } catch (offerErr) {
            console.warn('[useVoiceRoom] createOffer to new peer error:', offerErr);
          }
        }
      };

      // 3. Incoming SDP offer
      const handleVoiceOffer = async (data: {
        fromUserId: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        if (!isMounted || !webrtcServiceRef.current) return;
        try {
          const answer = await webrtcServiceRef.current.handleOffer(
            data.fromUserId,
            data.offer
          );
          if (socket.connected) {
            socket.emit('voice:answer', {
              roomId,
              targetUserId: data.fromUserId,
              answer,
            });
          }
        } catch (err) {
          console.warn('[useVoiceRoom] handleOffer error:', err);
        }
      };

      // 4. Incoming SDP answer
      const handleVoiceAnswer = async (data: {
        fromUserId: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        if (!isMounted || !webrtcServiceRef.current) return;
        try {
          await webrtcServiceRef.current.handleAnswer(data.fromUserId, data.answer);
        } catch (err) {
          console.warn('[useVoiceRoom] handleAnswer error:', err);
        }
      };

      // 5. Incoming ICE candidate
      const handleVoiceIceCandidate = async (data: {
        fromUserId: string;
        candidate: RTCIceCandidateInit;
      }) => {
        if (!isMounted || !webrtcServiceRef.current) return;
        try {
          await webrtcServiceRef.current.handleIceCandidate(
            data.fromUserId,
            data.candidate
          );
        } catch (err) {
          console.warn('[useVoiceRoom] handleIceCandidate error:', err);
        }
      };

      // 6. Remote peer mute status changed
      const handlePeerUpdated = (data: { userId: string; isMuted?: boolean }) => {
        if (!isMounted) return;
        setVoiceParticipants((prev) =>
          prev.map((p) =>
            p.userId === data.userId ? { ...p, isMuted: !!data.isMuted } : p
          )
        );
      };

      // 7. Remote peer speaking status changed
      const handlePeerSpeaking = (data: { userId: string; isSpeaking?: boolean }) => {
        if (!isMounted) return;
        setVoiceParticipants((prev) =>
          prev.map((p) =>
            p.userId === data.userId ? { ...p, isSpeaking: !!data.isSpeaking } : p
          )
        );
      };

      // 8. Remote peer left voice
      const handlePeerLeft = (data: { userId: string }) => {
        if (!isMounted) return;
        webrtcServiceRef.current?.closePeerConnection(data.userId);
        setVoiceParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
        setRemoteStreams((prev) => {
          const updated = new Map(prev);
          updated.delete(data.userId);
          return updated;
        });
        setConnectionStates((prev) => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
      };

      // 9. Structured voice error (e.g. VOICE_ROOM_FULL)
      const handleVoiceError = (errData: { code: string; message: string }) => {
        if (!isMounted) return;
        setError(errData);
        setIsConnecting(false);
      };

      // 10. Socket Reconnect: Rejoin voice session if active
      const handleReconnect = () => {
        if (!isMounted) return;
        if (isJoinedRef.current && socket.connected) {
          socket.emit('voice:join', { roomId, isMuted });
        }
      };

      socket.on('voice:peers', handleVoicePeers);
      socket.on('voice:peer-joined', handlePeerJoined);
      socket.on('voice:offer', handleVoiceOffer);
      socket.on('voice:answer', handleVoiceAnswer);
      socket.on('voice:ice-candidate', handleVoiceIceCandidate);
      socket.on('voice:peer-updated', handlePeerUpdated);
      socket.on('voice:peer-speaking', handlePeerSpeaking);
      socket.on('voice:peer-left', handlePeerLeft);
      socket.on('voice:error', handleVoiceError);
      socket.on('reconnect', handleReconnect);

      return () => {
        socket.off('voice:peers', handleVoicePeers);
        socket.off('voice:peer-joined', handlePeerJoined);
        socket.off('voice:offer', handleVoiceOffer);
        socket.off('voice:answer', handleVoiceAnswer);
        socket.off('voice:ice-candidate', handleVoiceIceCandidate);
        socket.off('voice:peer-updated', handlePeerUpdated);
        socket.off('voice:peer-speaking', handlePeerSpeaking);
        socket.off('voice:peer-left', handlePeerLeft);
        socket.off('voice:error', handleVoiceError);
        socket.off('reconnect', handleReconnect);
      };
    }

    const cleanupPromise = setupSocket();

    return () => {
      isMounted = false;
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, [roomId, currentUserId, isMuted]);

  // Join Voice action
  const joinVoice = useCallback(async () => {
    if (!roomId) return;
    if (isConnecting || isVoiceJoined) return;

    setError(null);
    setIsConnecting(true);

    try {
      // 1. Request microphone access
      const stream = await webrtcServiceRef.current!.requestMicrophone();
      setLocalStream(stream);

      // 2. Start speaking detection
      speakingDetectorRef.current?.start(stream);

      // 3. Emit voice:join to Socket.IO signaling server
      const socket = await getSocket();
      if (!socket || !socket.connected) {
        throw new Error('Real-time room socket is not connected. Please try again.');
      }

      socket.emit('voice:join', { roomId, isMuted: false });
      setIsMuted(false);
    } catch (err: any) {
      console.warn('[useVoiceRoom] Join voice error:', err);
      setError({
        code: 'MICROPHONE_ERROR',
        message: err.message || 'Could not connect to microphone.',
      });
      setIsConnecting(false);
      webrtcServiceRef.current?.stopMicrophone();
      setLocalStream(null);
    }
  }, [roomId, isConnecting, isVoiceJoined]);

  // Leave Voice action
  const leaveVoice = useCallback(() => {
    if (!roomId) return;

    // 1. Notify signaling server
    if (socketRef.current?.connected) {
      socketRef.current.emit('voice:leave', { roomId });
    }

    // 2. Stop microphone and cleanup WebRTC mesh
    speakingDetectorRef.current?.stop();
    webrtcServiceRef.current?.cleanup();

    // 3. Reset local state
    setLocalStream(null);
    setRemoteStreams(new Map());
    setVoiceParticipants([]);
    setConnectionStates({});
    setIsVoiceJoined(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsMuted(false);
    setError(null);
  }, [roomId]);

  // Toggle Mute action
  const toggleMute = useCallback(() => {
    if (!isVoiceJoined) return;

    const newMuted = !isMuted;
    const success = webrtcServiceRef.current?.setMuted(newMuted);

    if (success) {
      setIsMuted(newMuted);
      if (socketRef.current?.connected && roomId) {
        socketRef.current.emit('voice:mute', {
          roomId,
          isMuted: newMuted,
        });
      }
    }
  }, [isVoiceJoined, isMuted, roomId]);

  // Start Screen Share action
  const startScreenShare = useCallback(async () => {
    if (!webrtcServiceRef.current) return;
    try {
      const stream = await webrtcServiceRef.current.startScreenShare();
      if (!stream) {
        // User voluntarily cancelled the screen picker
        return;
      }
      setScreenStream(stream);
      setIsScreenSharing(true);
      if (socketRef.current?.connected && roomIdRef.current) {
        socketRef.current.emit('room:screen_share', {
          roomId: roomIdRef.current,
          isSharing: true,
        });
      }
    } catch (err: any) {
      console.warn('[useVoiceRoom] startScreenShare note:', err);
    }
  }, []);

  // Stop Screen Share action
  const stopScreenShare = useCallback(() => {
    if (!webrtcServiceRef.current) return;
    webrtcServiceRef.current.stopScreenShare();
    setScreenStream(null);
    setIsScreenSharing(false);
    if (socketRef.current?.connected && roomIdRef.current) {
      socketRef.current.emit('room:screen_share', {
        roomId: roomIdRef.current,
        isSharing: false,
      });
    }
  }, []);

  // Cleanup on unmount or roomId change
  useEffect(() => {
    return () => {
      if (isJoinedRef.current && socketRef.current?.connected && roomIdRef.current) {
        socketRef.current.emit('voice:leave', { roomId: roomIdRef.current });
      }
      speakingDetectorRef.current?.destroy();
      webrtcServiceRef.current?.cleanup();
    };
  }, []);

  return {
    isVoiceJoined,
    isConnecting,
    isMuted,
    isSpeaking,
    localStream,
    remoteStreams,
    isScreenSharing,
    screenStream,
    voiceParticipants,
    connectionStates,
    error,
    joinVoice,
    leaveVoice,
    toggleMute,
    startScreenShare,
    stopScreenShare,
    clearError,
  };
}
