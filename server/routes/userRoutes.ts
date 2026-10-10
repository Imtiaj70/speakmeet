import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Current user routes (Protected)
router.get('/me', authMiddleware, UserController.getMe);
router.patch('/me', authMiddleware, UserController.updateMe);
router.post('/', authMiddleware, UserController.createUser);

// Public check route
router.get('/check-username/:username', UserController.checkUsername);

// Public user discovery routes
router.get('/', UserController.listUsers);
router.get('/:username', UserController.getPublicProfile);

export default router;
