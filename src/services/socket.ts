import { io, Socket } from 'socket.io-client';
import { auth } from '../config/firebase';

let socket: Socket | null = null;
let isConnecting = false;

/**
 * Retrieve the active Firebase ID token or demo token
 */
export async function getAuthToken(): Promise<string | null> {
  // 1. Try Firebase user
  if (auth?.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (err) {
      console.warn('[SocketService] Error fetching Firebase token:', err);
    }
  }

  // 2. Try localStorage session token
  const localToken = localStorage.getItem('speakmate_auth_token');
  if (localToken) {
    return localToken;
  }

  // 3. Fallback from saved profile
  const savedProfile = localStorage.getItem('speakmate_profile');
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile);
      const tokenPayload = {
        uid: parsed.firebaseUid || parsed.id || 'usr_local',
        email: parsed.email || 'speaker@speakmate.com',
        name: parsed.name || 'Speaker',
        username: parsed.username || 'speaker',
      };
      const fallbackToken = `demo-token-${btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))))}`;
      localStorage.setItem('speakmate_auth_token', fallbackToken);
      return fallbackToken;
    } catch {}
  }

  return null;
}

/**
 * Get or initialize the singleton Socket.IO connection
 */
export async function getSocket(): Promise<Socket | null> {
  if (socket && socket.connected) {
    return socket;
  }

  if (isConnecting && socket) {
    return socket;
  }

  const token = await getAuthToken();
  if (!token) {
    console.warn('[SocketService] Cannot connect without authentication token.');
    return null;
  }

  isConnecting = true;

  // Derive Socket.IO URL
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

  if (!socket) {
    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: false,
    });

    socket.on('connect', () => {
      isConnecting = false;
      console.log('[SocketService] Connected to real-time server. ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      isConnecting = false;
      console.log('[SocketService] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      isConnecting = false;
      console.warn('[SocketService] Connection error:', err.message);
    });

    // Re-authenticate with a fresh token before reconnection attempts
    socket.io.on('reconnect_attempt', async () => {
      const freshToken = await getAuthToken();
      if (freshToken && socket) {
        socket.auth = { token: freshToken };
      }
    });
  } else {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Disconnect and release socket connection
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnecting = false;
  }
}
