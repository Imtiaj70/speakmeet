import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserService } from '../services/userService';
import { roomService } from '../services/roomService';
import { getDatabase, getMemoryStore } from '../config/db';
import { broadcastRoomClosed, getIO } from '../socket/socketServer';
import { ObjectId } from 'mongodb';

export interface SystemAnnouncement {
  id: string;
  active: boolean;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  updatedAt: string;
  updatedBy?: string;
}

// In-memory fallback for announcements
let currentAnnouncement: SystemAnnouncement = {
  id: 'ann-1',
  active: true,
  message: 'Welcome to SpeakMate! All control systems are active and operating normally.',
  type: 'info',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin',
};

// In-memory reports store
const reportsStore = [
  {
    id: 'rep-1',
    reporter: 'Sophie Mercier',
    reportedUser: 'troll_user_99',
    reportedUid: 'usr_troll_99',
    reason: 'Disruptive background noise and offensive remarks in voice stage',
    room: 'World Travel Stories',
    status: 'pending',
    date: '10 mins ago',
  },
  {
    id: 'rep-2',
    reporter: 'Kenji Sato',
    reportedUser: 'spammer_crypto',
    reportedUid: 'usr_spammer_01',
    reason: 'Advertising external commercial telegram links in voice chat',
    room: 'Tech Careers',
    status: 'pending',
    date: '35 mins ago',
  },
];

export class AdminController {
  /**
   * GET /api/admin/overview
   * Platform metrics & stats
   */
  static async getOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await UserService.getPlatformStats();
      res.status(200).json({
        success: true,
        stats: {
          ...stats,
          pendingReports: reportsStore.filter((r) => r.status === 'pending').length,
          announcement: currentAnnouncement,
        },
      });
    } catch (err: any) {
      console.error('[AdminController.getOverview] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch overview stats' });
    }
  }

  /**
   * GET /api/admin/users
   * Complete registered user list
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await UserService.listUsersForAdmin(100);
      res.status(200).json({ success: true, users });
    } catch (err: any) {
      console.error('[AdminController.getUsers] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve users' });
    }
  }

  /**
   * PATCH /api/admin/users/:uid/role
   * Promote / Demote user role
   */
  static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { uid } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      res.status(400).json({ error: 'BadRequest', message: 'Invalid role specified' });
      return;
    }

    try {
      const updated = await UserService.updateRoleByAdmin(uid, role);
      if (!updated) {
        res.status(404).json({ error: 'NotFound', message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, user: updated });
    } catch (err: any) {
      console.error('[AdminController.updateUserRole] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to update user role' });
    }
  }

  /**
   * PATCH /api/admin/users/:uid/ban
   * Ban or Unban user
   */
  static async toggleUserBan(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { uid } = req.params;
    const { isBanned } = req.body;

    try {
      const updated = await UserService.toggleBanByAdmin(uid, Boolean(isBanned));
      if (!updated) {
        res.status(404).json({ error: 'NotFound', message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, user: updated });
    } catch (err: any) {
      console.error('[AdminController.toggleUserBan] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to toggle ban status' });
    }
  }

  /**
   * DELETE /api/admin/users/:uid
   * Delete user permanently
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { uid } = req.params;

    try {
      const deleted = await UserService.deleteUserByAdmin(uid);
      if (!deleted) {
        res.status(404).json({ error: 'NotFound', message: 'User not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
      console.error('[AdminController.deleteUser] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete user' });
    }
  }

  /**
   * GET /api/admin/rooms
   * Fetch all rooms including active and closed
   */
  static async getAllRooms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDatabase();
      if (db) {
        const rooms = await db
          .collection('rooms')
          .find({})
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray();

        res.status(200).json({
          success: true,
          rooms: rooms.map((r) => ({ ...r, id: r._id.toString() })),
        });
        return;
      }

      const memStore = getMemoryStore();
      const rooms = memStore.get('rooms') || [];
      res.status(200).json({ success: true, rooms });
    } catch (err: any) {
      console.error('[AdminController.getAllRooms] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to fetch rooms' });
    }
  }

  /**
   * DELETE /api/admin/rooms/:id
   * Super Admin force termination & removal of any room
   */
  static async forceDeleteRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    try {
      const db = getDatabase();
      if (db) {
        let cleanId: any = id;
        try {
          cleanId = new ObjectId(id);
        } catch {}

        await db.collection('rooms').deleteOne({ $or: [{ _id: cleanId }, { id }] });
        await db.collection('roomParticipants').deleteMany({ $or: [{ roomId: id }, { roomId: id.toString() }] });
      } else {
        const memStore = getMemoryStore();
        let rooms = memStore.get('rooms') || [];
        rooms = rooms.filter((r: any) => r.id !== id && (r as any)._id?.toString() !== id);
        memStore.set('rooms', rooms);

        let participants = memStore.get('roomParticipants') || [];
        participants = participants.filter((p: any) => p.roomId !== id);
        memStore.set('roomParticipants', participants);
      }

      // Notify all users in the room via WebSocket
      broadcastRoomClosed(id);

      res.status(200).json({ success: true, message: 'Room has been forcibly closed and purged by Admin' });
    } catch (err: any) {
      console.error('[AdminController.forceDeleteRoom] Error:', err);
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to terminate room' });
    }
  }

  /**
   * GET /api/admin/announcement (Public or Admin)
   */
  static async getAnnouncement(req: any, res: Response): Promise<void> {
    res.status(200).json({ success: true, announcement: currentAnnouncement });
  }

  /**
   * POST /api/admin/announcement
   * Update global notice broadcast
   */
  static async updateAnnouncement(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { message, active, type } = req.body;
    currentAnnouncement = {
      id: `ann-${Date.now()}`,
      active: active !== undefined ? Boolean(active) : currentAnnouncement.active,
      message: message !== undefined ? String(message).trim() : currentAnnouncement.message,
      type: type || currentAnnouncement.type || 'info',
      updatedAt: new Date().toISOString(),
      updatedBy: req.user?.name || req.user?.email || 'Administrator',
    };

    const io = getIO();
    if (io) {
      io.emit('system:announcement', currentAnnouncement);
    }

    res.status(200).json({ success: true, announcement: currentAnnouncement });
  }

  /**
   * GET /api/admin/reports
   */
  static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({ success: true, reports: reportsStore });
  }

  /**
   * POST /api/admin/reports/:id/action
   */
  static async actionReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { action } = req.body; // 'dismiss' | 'ban'

    const reportIndex = reportsStore.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      res.status(404).json({ error: 'NotFound', message: 'Report not found' });
      return;
    }

    const report = reportsStore[reportIndex];
    if (action === 'ban' && report.reportedUid) {
      await UserService.toggleBanByAdmin(report.reportedUid, true);
      report.status = 'banned';
    } else {
      report.status = 'resolved';
    }

    res.status(200).json({ success: true, report });
  }
}
