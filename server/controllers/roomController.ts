import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { roomService } from '../services/roomService';
import { validateCreateRoom } from '../validators/roomValidator';
import {
  broadcastRoomUpdated,
  broadcastRoomClosed,
  broadcastParticipantJoined,
  broadcastParticipantLeft,
  broadcastHostChanged,
} from '../socket/socketServer';

export class RoomController {
  /**
   * POST /api/rooms
   * Create a speaking room (Requires Auth)
   */
  async createRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required to host a room' });
        return;
      }

      const validation = validateCreateRoom(req.body);
      if (!validation.valid || !validation.data) {
        res.status(400).json({
          success: false,
          message: validation.errors.join('. '),
          errors: validation.errors,
        });
        return;
      }

      const room = await roomService.createRoom(
        {
          uid: req.user.uid,
          email: req.user.email,
          name: req.user.name,
        },
        validation.data
      );

      res.status(201).json({
        success: true,
        data: room,
      });
    } catch (err: any) {
      console.error('[RoomController.createRoom] Error:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to create speaking room',
      });
    }
  }

  /**
   * GET /api/rooms
   * Discover active public speaking rooms with pagination and filters
   */
  async getRooms(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        search,
        topic,
        englishLevel,
        language,
        country,
        status,
        page,
        limit,
      } = req.query;

      const result = await roomService.getPublicRooms({
        search: typeof search === 'string' ? search : undefined,
        topic: typeof topic === 'string' ? topic : undefined,
        englishLevel: typeof englishLevel === 'string' ? englishLevel : undefined,
        language: typeof language === 'string' ? language : undefined,
        country: typeof country === 'string' ? country : undefined,
        status: typeof status === 'string' ? status : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 24,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err: any) {
      console.error('[RoomController.getRooms] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve speaking rooms',
      });
    }
  }

  /**
   * GET /api/rooms/:id
   * Room details by ID or slug
   */
  async getRoomById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);

      if (!room) {
        res.status(404).json({
          success: false,
          message: 'Speaking room not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (err: any) {
      console.error('[RoomController.getRoomById] Error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve room details',
      });
    }
  }

  /**
   * POST /api/rooms/:id/join
   * Join speaking room (Requires Auth)
   */
  async joinRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required to join room' });
        return;
      }

      const { id } = req.params;
      const result = await roomService.joinRoom(id, {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
      });

      const cleanRoomId = (result.room as any)._id?.toString() || (result.room as any).id || id;
      broadcastParticipantJoined(cleanRoomId, result.participant);
      broadcastRoomUpdated(cleanRoomId, result.room);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[RoomController.joinRoom] Error:', err);
      const isClientError =
        err.message.includes('not found') ||
        err.message.includes('capacity') ||
        err.message.includes('closed') ||
        err.message.includes('already joined');

      res.status(isClientError ? 400 : 500).json({
        success: false,
        message: err.message || 'Failed to join room',
      });
    }
  }

  /**
   * POST /api/rooms/:id/leave
   * Leave speaking room (Requires Auth)
   */
  async leaveRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const result = await roomService.leaveRoom(id, { uid: req.user.uid });

      // Find user id to broadcast departure
      const room = await roomService.getRoomById(id);
      const cleanRoomId = (room as any)?._id?.toString() || (room as any)?.id || id;

      broadcastParticipantLeft(cleanRoomId, req.user.uid);

      if (result.roomClosed) {
        broadcastRoomClosed(cleanRoomId);
      } else if (result.newHost && room) {
        broadcastHostChanged(cleanRoomId, room.hostId, room.hostName);
        broadcastRoomUpdated(cleanRoomId, room);
      } else if (room) {
        broadcastRoomUpdated(cleanRoomId, room);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.warn('[RoomController.leaveRoom] Departure notice:', err.message);
      res.status(200).json({
        success: true,
        data: {
          message: err.message || 'Departed room',
          roomClosed: false,
        },
      });
    }
  }

  /**
   * GET /api/rooms/:id/participants
   * Participant list for a room
   */
  async getParticipants(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const participants = await roomService.getRoomParticipants(id);

      res.status(200).json({
        success: true,
        data: participants,
      });
    } catch (err: any) {
      console.error('[RoomController.getParticipants] Error:', err);
      res.status(404).json({
        success: false,
        message: err.message || 'Failed to retrieve participants',
      });
    }
  }

  /**
   * PATCH /api/rooms/:id
   * Update speaking room (Host only)
   */
  async updateRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const updated = await roomService.updateRoom(id, req.user.uid, req.body);
      const cleanRoomId = (updated as any)._id?.toString() || (updated as any).id || id;

      broadcastRoomUpdated(cleanRoomId, updated);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      console.error('[RoomController.updateRoom] Error:', err);
      const isForbidden = err.message.includes('authorized');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to update room',
      });
    }
  }

  /**
   * DELETE /api/rooms/:id
   * Close speaking room (Host only)
   */
  async closeRoom(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const result = await roomService.closeRoom(id, req.user.uid);

      broadcastRoomClosed(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[RoomController.closeRoom] Error:', err);
      const isForbidden = err.message.includes('authorized');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to close room',
      });
    }
  }

  /**
   * POST /api/rooms/:id/lock
   * Toggle room lock state (Host only)
   */
  async toggleLock(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { isLocked } = req.body || {};
      const updated = await roomService.toggleRoomLock(id, { uid: req.user.uid }, isLocked);

      broadcastRoomUpdated(id, updated);

      res.status(200).json({
        success: true,
        isLocked: updated.isLocked,
        data: updated,
      });
    } catch (err: any) {
      console.error('[RoomController.toggleLock] Error:', err);
      const isForbidden = err.message.includes('authorized') || err.message.includes('Only the room host');
      res.status(isForbidden ? 403 : 400).json({
        success: false,
        message: err.message || 'Failed to toggle room lock',
      });
    }
  }
}

export const roomController = new RoomController();
