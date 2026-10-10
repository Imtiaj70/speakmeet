import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Publicly readable announcement
router.get('/announcement', AdminController.getAnnouncement);

// Protected Admin Routes
router.get('/overview', requireAdmin, AdminController.getOverview);
router.get('/users', requireAdmin, AdminController.getUsers);
router.patch('/users/:uid/role', requireAdmin, AdminController.updateUserRole);
router.patch('/users/:uid/ban', requireAdmin, AdminController.toggleUserBan);
router.delete('/users/:uid', requireAdmin, AdminController.deleteUser);

router.get('/rooms', requireAdmin, AdminController.getAllRooms);
router.delete('/rooms/:id', requireAdmin, AdminController.forceDeleteRoom);

router.post('/announcement', requireAdmin, AdminController.updateAnnouncement);

router.get('/reports', requireAdmin, AdminController.getReports);
router.post('/reports/:id/action', requireAdmin, AdminController.actionReport);

export default router;
