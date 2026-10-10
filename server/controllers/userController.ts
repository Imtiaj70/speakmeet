import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserService } from '../services/userService';
import { validateUsername, sanitizeUserProfileInput } from '../validators/userValidator';

export class UserController {
  /**
   * GET /api/users/me
   * Fetches the currently authenticated user's MongoDB profile.
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    try {
      let user = await UserService.findByFirebaseUid(uid);

      // Auto-provision basic profile if not exists yet
      if (!user) {
        user = await UserService.createUser({
          firebaseUid: uid,
          email: req.user?.email || 'speaker@speakmate.com',
          name: req.user?.name || 'New Learner',
          avatar: req.user?.picture,
        });
      }

      res.status(200).json({ success: true, user });
    } catch (err: any) {
      console.error('[UserController.getMe] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch user profile' });
    }
  }

  /**
   * PATCH /api/users/me
   * Updates authenticated user profile.
   */
  static async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    try {
      const sanitized = sanitizeUserProfileInput(req.body);

      // If username is changing, validate uniqueness & format
      if (sanitized.username) {
        const validation = validateUsername(sanitized.username);
        if (!validation.valid) {
          res.status(400).json({ error: 'ValidationError', message: validation.error });
          return;
        }

        const isAvailable = await UserService.isUsernameAvailable(sanitized.username, uid);
        if (!isAvailable) {
          res.status(409).json({ error: 'ConflictError', message: 'Username is already taken.' });
          return;
        }
      }

      const updated = await UserService.updateUser(uid, {
        ...sanitized,
        isProfileComplete: true,
      });

      if (!updated) {
        res.status(404).json({ error: 'NotFound', message: 'User profile not found' });
        return;
      }

      res.status(200).json({ success: true, user: updated });
    } catch (err: any) {
      console.error('[UserController.updateMe] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to update user profile' });
    }
  }

  /**
   * POST /api/users
   * Initializes user profile upon registration.
   */
  static async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    try {
      const existing = await UserService.findByFirebaseUid(uid);
      if (existing) {
        res.status(200).json({ success: true, user: existing });
        return;
      }

      const { name, username, email, avatar, country, nativeLanguage, englishLevel, learningGoals, interests, bio } = req.body;

      if (username) {
        const validation = validateUsername(username);
        if (!validation.valid) {
          res.status(400).json({ error: 'ValidationError', message: validation.error });
          return;
        }

        const isAvailable = await UserService.isUsernameAvailable(username);
        if (!isAvailable) {
          res.status(409).json({ error: 'ConflictError', message: 'Username is already taken.' });
          return;
        }
      }

      const newUser = await UserService.createUser({
        firebaseUid: uid,
        email: email || req.user?.email || 'user@speakmate.com',
        name,
        username,
        avatar,
        country,
        nativeLanguage,
        englishLevel,
        learningGoals,
        interests,
        bio,
      });

      res.status(201).json({ success: true, user: newUser });
    } catch (err: any) {
      console.error('[UserController.createUser] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to create user record' });
    }
  }

  /**
   * GET /api/users/check-username/:username
   * Checks if a username is available.
   */
  static async checkUsername(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { username } = req.params;
    const currentUid = req.user?.uid;

    const validation = validateUsername(username);
    if (!validation.valid) {
      res.status(200).json({ available: false, reason: validation.error });
      return;
    }

    try {
      const available = await UserService.isUsernameAvailable(username, currentUid);
      res.status(200).json({ available });
    } catch (err: any) {
      console.error('[UserController.checkUsername] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Error checking username' });
    }
  }

  /**
   * GET /api/users/:username
   * Public user profile retrieval (sensitive fields stripped).
   */
  static async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { username } = req.params;

    try {
      const user = await UserService.findByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'NotFound', message: 'User not found' });
        return;
      }

      // Strip sensitive backend data
      const { firebaseUid, email, ...publicData } = user;
      res.status(200).json({ success: true, user: publicData });
    } catch (err: any) {
      console.error('[UserController.getPublicProfile] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Error retrieving user profile' });
    }
  }

  /**
   * GET /api/users
   * Public list of users for partner matching (safe fields only).
   */
  static async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await UserService.listPublicUsers(50);
      res.status(200).json({ success: true, users });
    } catch (err: any) {
      console.error('[UserController.listUsers] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Error listing users' });
    }
  }
}
