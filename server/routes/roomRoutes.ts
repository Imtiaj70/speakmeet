import { Router } from 'express';
import { roomController } from '../controllers/roomController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public: Discover public rooms with pagination and search
router.get('/', roomController.getRooms.bind(roomController));

// Protected: Create a new room
router.post('/', requireAuth, roomController.createRoom.bind(roomController));

// Public: Get room details by id or slug
router.get('/:id', roomController.getRoomById.bind(roomController));

// Public: Get room participants
router.get('/:id/participants', roomController.getParticipants.bind(roomController));

// Protected: Update room details (host only)
router.patch('/:id', requireAuth, roomController.updateRoom.bind(roomController));

// Protected: Close room (host only)
router.delete('/:id', requireAuth, roomController.closeRoom.bind(roomController));

// Protected: Toggle room lock (host only)
router.post('/:id/lock', requireAuth, roomController.toggleLock.bind(roomController));

// Protected: Join room
router.post('/:id/join', requireAuth, roomController.joinRoom.bind(roomController));

// Protected: Leave room
router.post('/:id/leave', requireAuth, roomController.leaveRoom.bind(roomController));

export default router;
