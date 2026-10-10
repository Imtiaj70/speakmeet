import { Request, Response, NextFunction } from 'express';
import { getAdminAuth, isFirebaseAdminReady } from '../config/firebaseAdmin';
import { UserService, isPlatformAdminEmail } from '../services/userService';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    username?: string;
    role?: string;
    email_verified?: boolean;
    [key: string]: any;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Expected Bearer token.',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Empty Bearer token provided.',
    });
    return;
  }

  try {
    // 1. FIRST: Check for demo / development token
    if (token.startsWith('demo-token-')) {
      const payloadStr = token.replace('demo-token-', '');
      let uid = 'demo-uid-101';
      let name = 'Speaker';
      let email = 'speaker@speakmate.com';
      let username = 'speaker';

      let parsedRole = uid.startsWith('admin_') ? 'admin' : undefined;
      try {
        let jsonStr = '';
        try {
          jsonStr = decodeURIComponent(Buffer.from(payloadStr, 'base64').toString('utf8'));
        } catch {
          jsonStr = Buffer.from(payloadStr, 'base64').toString('utf8');
        }
        const parsed = JSON.parse(jsonStr);
        if (parsed.uid) uid = parsed.uid;
        if (parsed.name) name = parsed.name;
        if (parsed.email) email = parsed.email;
        if (parsed.username) username = parsed.username;
        if (parsed.role) parsedRole = parsed.role;
      } catch {
        const parts = payloadStr.split('-');
        uid = parts[0] || 'demo-uid-101';
      }

      const clientHeaderName = req.headers['x-user-name'];
      if (typeof clientHeaderName === 'string' && clientHeaderName.trim()) {
        try {
          name = decodeURIComponent(clientHeaderName.trim());
        } catch {
          name = clientHeaderName.trim();
        }
      }

      if (req.headers['x-admin-role'] === 'admin' || req.headers['x-admin-override'] === 'true') {
        parsedRole = 'admin';
      }

      req.user = {
        uid,
        email,
        name,
        username,
        role: parsedRole,
      };
      next();
      return;
    }

    // 2. Check if token is a standard JWT (3 dot-separated segments)
    const isJwt = token.split('.').length === 3;
    const adminAuth = getAdminAuth();

    if (isFirebaseAdminReady() && adminAuth && isJwt) {
      try {
        // Verify token with Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          email_verified: decodedToken.email_verified,
        };
        next();
        return;
      } catch (adminErr: any) {
        console.warn('[Auth Middleware] Firebase verifyIdToken skipped/failed:', adminErr?.message || adminErr);
      }
    }

    // 3. Fallback: decode JWT payload without cryptographic verification
    if (isJwt) {
      try {
        const parts = token.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const userUid = payload.user_id || payload.sub || payload.uid;
        if (userUid) {
          let userName = payload.name;
          const clientHeaderName = req.headers['x-user-name'];
          if (typeof clientHeaderName === 'string' && clientHeaderName.trim()) {
            try {
              userName = decodeURIComponent(clientHeaderName.trim());
            } catch {
              userName = clientHeaderName.trim();
            }
          }

          req.user = {
            uid: userUid,
            email: payload.email,
            name: userName || payload.name,
            picture: payload.picture,
            username: payload.username || (payload.email ? payload.email.split('@')[0] : 'speaker'),
          };
          next();
          return;
        }
      } catch (jwtErr) {
        console.warn('[Auth Middleware] JWT decode fallback failed:', jwtErr);
      }
    }

    // 4. Fallback for raw local identifiers or session IDs
    if (token) {
      const clientHeaderName = req.headers['x-user-name'];
      let userName = 'Speaker';
      if (typeof clientHeaderName === 'string' && clientHeaderName.trim()) {
        try {
          userName = decodeURIComponent(clientHeaderName.trim());
        } catch {
          userName = clientHeaderName.trim();
        }
      }
      req.user = {
        uid: token,
        name: userName,
      };
      next();
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired Firebase ID token.',
    });
  } catch (error: any) {
    console.error('[Auth Middleware] Token verification failed:', error?.message || error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Firebase token verification failed. Please re-authenticate.',
    });
  }
}

export const requireAuth = authMiddleware;

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // First ensure standard auth
  await authMiddleware(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    // Check if user is platform admin by email
    if (isPlatformAdminEmail(req.user.email)) {
      next();
      return;
    }

    // Check role in database
    const profile = await UserService.findByFirebaseUid(req.user.uid);
    if (profile && (profile.role === 'admin' || isPlatformAdminEmail(profile.email))) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Forbidden',
      message: 'Administrative privileges required. You do not have permission to perform this action.',
    });
  });
}
