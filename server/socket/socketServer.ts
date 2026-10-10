import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware } from './socketAuth';
import { registerRoomHandlers, formatRoomState, formatParticipantState } from './roomSocketHandlers';
import { registerVoiceHandlers } from './voiceSocketHandlers';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  if (io) {
    return io;
  }

  const clientUrl = process.env.CLIENT_URL;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // In local/development or when origin is undefined (e.g. mobile/same-origin/curl)
        if (!origin) return callback(null, true);
        if (clientUrl && origin === clientUrl) return callback(null, true);
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.includes('run.app') ||
          origin.includes('web.app') ||
          origin.includes('firebaseapp.com')
        ) {
          return callback(null, true);
        }
        // Fallback: allow request in dev/staging preview environment
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Authentication middleware using Firebase Admin / verified ID token
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.data.user?.username} (${socket.data.user?.id}), socket ID: ${socket.id}`);

    registerRoomHandlers(io!, socket);
    registerVoiceHandlers(io!, socket);

    socket.on('error', (err) => {
      console.warn(`[Socket.IO] Error on socket ${socket.id}:`, err?.message || err);
    });
  });

  console.log('[Socket.IO] Server successfully initialized and mounted to HTTP server');
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast room updates initiated via REST endpoints
 */
export function broadcastRoomUpdated(roomId: string, room: any) {
  if (!io) return;
  io.to(`room:${roomId}`).emit('room:updated', {
    room: formatRoomState(room),
  });
}

/**
 * Broadcast room closure
 */
export function broadcastRoomClosed(roomId: string) {
  if (!io) return;
  io.to(`room:${roomId}`).emit('room:closed', {
    roomId,
  });
}

/**
 * Broadcast participant joined (e.g. via REST endpoint)
 */
export function broadcastParticipantJoined(roomId: string, participant: any, isHost = false) {
  if (!io) return;
  io.to(`room:${roomId}`).emit('room:participant-joined', {
    participant: formatParticipantState(participant, isHost, true),
  });
}

/**
 * Broadcast participant left (e.g. via REST endpoint)
 */
export function broadcastParticipantLeft(roomId: string, userId: string) {
  if (!io) return;
  io.to(`room:${roomId}`).emit('room:participant-left', {
    userId,
  });
}

/**
 * Broadcast host transfer
 */
export function broadcastHostChanged(roomId: string, hostId: string, hostName: string) {
  if (!io) return;
  io.to(`room:${roomId}`).emit('room:host-changed', {
    hostId,
    hostName,
  });
}
