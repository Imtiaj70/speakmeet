import { Socket } from 'socket.io';
import { getAdminAuth, isFirebaseAdminReady } from '../config/firebaseAdmin';
import { getDatabase, getMemoryStore } from '../config/db';

export interface AuthenticatedSocketUser {
  uid: string;
  id: string;
  username: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  country: string;
  englishLevel: string;
}

declare module 'socket.io' {
  interface SocketData {
    user?: AuthenticatedSocketUser;
    [key: string]: any;
  }
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization;

  if (!token) {
    const error = new Error('UNAUTHORIZED');
    (error as any).data = {
      code: 'UNAUTHORIZED',
      message: 'Authentication token is required for live room connection.',
    };
    return next(error);
  }

  // Strip possible 'Bearer ' prefix
  const cleanToken = typeof token === 'string' && token.startsWith('Bearer ')
    ? token.slice(7).trim()
    : String(token).trim();

  try {
    let uid = '';
    let email = '';
    let name = '';
    let picture = '';

    // 1. FIRST: Check for demo-token
    if (cleanToken.startsWith('demo-token-')) {
      const payloadStr = cleanToken.replace('demo-token-', '');
      try {
        let jsonStr = '';
        try {
          jsonStr = decodeURIComponent(Buffer.from(payloadStr, 'base64').toString('utf8'));
        } catch {
          jsonStr = Buffer.from(payloadStr, 'base64').toString('utf8');
        }
        const parsed = JSON.parse(jsonStr);
        uid = parsed.uid || parsed.id || 'demo-uid-101';
        email = parsed.email || 'speaker@speakmate.com';
        name = parsed.name || parsed.username || 'Speaker';
      } catch {
        const parts = payloadStr.split('-');
        uid = parts[0] || 'demo-uid-101';
        email = 'demo@speakmate.com';
        name = 'Speaker';
      }
    } else {
      // 2. Try Firebase Admin SDK if token is a standard JWT (3 parts)
      const isJwt = cleanToken.split('.').length === 3;
      const adminAuth = getAdminAuth();
      let verified = false;

      if (isFirebaseAdminReady() && adminAuth && isJwt) {
        try {
          const decoded = await adminAuth.verifyIdToken(cleanToken);
          uid = decoded.uid;
          email = decoded.email || '';
          name = decoded.name || '';
          picture = decoded.picture || '';
          verified = true;
        } catch (adminErr: any) {
          console.warn('[Socket Auth] Firebase Admin verifyIdToken skipped/failed:', adminErr?.message || adminErr);
        }
      }

      // 3. Fallback: decode JWT payload if not verified by admin SDK
      if (!verified && isJwt) {
        try {
          const parts = cleanToken.split('.');
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.user_id || payload.sub || payload.uid) {
            uid = payload.user_id || payload.sub || payload.uid;
            email = payload.email || '';
            name = payload.name || '';
            picture = payload.picture || '';
          }
        } catch (jwtErr) {
          console.warn('[Socket Auth] Fallback decode failed:', jwtErr);
        }
      }

      // 4. Fallback for raw local identifiers or session IDs
      if (!uid && cleanToken) {
        uid = cleanToken;
        name = 'Speaker';
      }
    }

    if (!uid) {
      const error = new Error('UNAUTHORIZED');
      (error as any).data = {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired Firebase authentication token.',
      };
      return next(error);
    }

    // Lookup user in MongoDB to retrieve authoritative profile details
    const db = getDatabase();
    let userDoc: any = null;
    if (db) {
      userDoc = await db.collection('users').findOne({
        $or: [{ firebaseUid: uid }, { _id: uid as any }, { email: email && email.length > 0 ? email : undefined }],
      });
    } else {
      const memStore = getMemoryStore();
      const users: any[] = memStore.get('users') || [];
      userDoc = users.find((u) => u.firebaseUid === uid || u.email === email);
    }

    const userId = userDoc?._id?.toString() || uid;
    const username = userDoc?.username || name || (email ? email.split('@')[0] : `speaker_${uid.substring(0, 5)}`);
    const displayName = userDoc?.name || name || 'Speaker';
    const photoURL =
      userDoc?.avatar ||
      userDoc?.avatarUrl ||
      picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const country = userDoc?.country || 'Global';
    const englishLevel = userDoc?.englishLevel || 'Intermediate';

    // Attach authoritative user data to socket
    socket.data.user = {
      uid,
      id: userId,
      username,
      displayName,
      email: email || userDoc?.email,
      photoURL,
      country,
      englishLevel,
    };

    next();
  } catch (err: any) {
    console.error('[Socket Auth] Authentication failure:', err?.message || err);
    const error = new Error('UNAUTHORIZED');
    (error as any).data = {
      code: 'UNAUTHORIZED',
      message: 'Token verification failed. Please re-authenticate.',
    };
    next(error);
  }
}
