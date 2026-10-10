import { ObjectId } from 'mongodb';
import { getDatabase, getMemoryStore } from '../config/db';
import { topicService } from './topicService';
import { CreateRoomInput, UpdateRoomInput } from '../validators/roomValidator';

export interface RoomDocument {
  _id?: ObjectId | string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hostCountry?: string;
  topicId: string;
  topicTitle: string;
  englishLevel: string;
  language: string;
  maxParticipants: number;
  participantCount: number;
  visibility: 'public' | 'private';
  status: 'waiting' | 'active' | 'closed';
  isLocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomParticipantDocument {
  _id?: ObjectId | string;
  roomId: string;
  userId: string;
  username: string;
  avatar?: string;
  country?: string;
  englishLevel: string;
  role: 'host' | 'participant' | 'moderator';
  joinedAt: Date;
  isMuted: boolean;
}

export interface RoomQueryFilters {
  search?: string;
  topic?: string;
  englishLevel?: string;
  language?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export class RoomService {
  /**
   * Create a speaking room and automatically assign the authenticated user as host.
   */
  async createRoom(
    user: { uid: string; email?: string; name?: string },
    input: CreateRoomInput
  ): Promise<RoomDocument> {
    const db = getDatabase();

    // 1. Resolve Topic (match existing or fallback gracefully for custom/AI topics)
    let topic: any = null;
    if (input.topicId) {
      try {
        topic = await topicService.getTopicById(input.topicId);
      } catch {}
    }

    if (!topic) {
      try {
        const allTopics = await topicService.getTopics({});
        if (allTopics && allTopics.length > 0) {
          topic = allTopics[0];
        }
      } catch {}

      if (!topic) {
        topic = {
          _id: 'custom-topic',
          title: input.name || 'Open Discussion',
          slug: 'custom-topic',
          category: 'General',
        };
      }
    }

    // 2. Fetch User from MongoDB by firebaseUid, _id, or email
    let hostUser: any = null;
    if (db) {
      hostUser =
        (await db.collection('users').findOne({ firebaseUid: user.uid })) ||
        (ObjectId.isValid(user.uid) ? await db.collection('users').findOne({ _id: new ObjectId(user.uid) }) : null) ||
        (user.email ? await db.collection('users').findOne({ email: user.email }) : null);
    } else {
      const memStore = getMemoryStore();
      const users: any[] = memStore.get('users') || [];
      hostUser = users.find((u) => u.firebaseUid === user.uid || u.email === user.email || u.id === user.uid);
    }

    const hostId = hostUser?._id?.toString() || hostUser?.id || user.uid;
    const hostName = input.hostName || hostUser?.name || user.name || 'Speaker';
    const hostUsername = input.hostUsername || hostUser?.username || 'speaker';
    const hostCountry = input.hostCountry || hostUser?.country || 'Global';
    const hostAvatar =
      input.hostAvatar ||
      hostUser?.avatar ||
      hostUser?.avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${hostUsername}`;
    const hostLevel = hostUser?.englishLevel || input.englishLevel;

    const baseSlug = slugify(input.name);
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const now = new Date();
    const newRoom: RoomDocument = {
      name: input.name,
      slug,
      description: input.description || '',
      hostId,
      hostName,
      hostAvatar,
      hostCountry,
      topicId: topic._id ? topic._id.toString() : topic.slug,
      topicTitle: topic.title,
      englishLevel: input.englishLevel,
      language: input.language || 'English',
      maxParticipants: input.maxParticipants,
      participantCount: 1,
      visibility: input.visibility,
      status: 'waiting',
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      const result = await db.collection<RoomDocument>('rooms').insertOne(newRoom as any);
      const roomId = result.insertedId.toString();
      newRoom._id = result.insertedId;

      // Automatically add host to roomParticipants
      const hostParticipant: RoomParticipantDocument = {
        roomId,
        userId: hostId,
        username: hostUsername,
        avatar: hostAvatar,
        country: hostCountry,
        englishLevel: hostLevel,
        role: 'host',
        joinedAt: now,
        isMuted: false,
      };

      await db.collection<RoomParticipantDocument>('roomParticipants').insertOne(hostParticipant as any);
      return newRoom;
    }

    // In-memory fallback
    const memStore = getMemoryStore();
    const rooms: RoomDocument[] = memStore.get('rooms') || [];
    const participants: RoomParticipantDocument[] = memStore.get('roomParticipants') || [];

    newRoom._id = `mem-room-${Date.now()}`;
    rooms.unshift(newRoom);
    memStore.set('rooms', rooms);

    participants.push({
      _id: `mem-part-${Date.now()}`,
      roomId: newRoom._id.toString(),
      userId: hostId,
      username: hostUsername,
      avatar: hostAvatar,
      country: hostCountry,
      englishLevel: hostLevel,
      role: 'host',
      joinedAt: now,
      isMuted: false,
    });
    memStore.set('roomParticipants', participants);

    return newRoom;
  }

  /**
   * Discover public, open rooms with pagination and filtering
   */
  async getPublicRooms(filters: RoomQueryFilters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 12));
    const skip = (page - 1) * limit;

    const db = getDatabase();
    if (db) {
      const query: any = {
        visibility: 'public',
        status: { $ne: 'closed' },
      };

      if (filters.status && (filters.status === 'waiting' || filters.status === 'active')) {
        query.status = filters.status;
      }

      if (filters.language && filters.language !== 'All' && filters.language !== 'All Languages' && filters.language !== 'Any Language') {
        query.language = { $regex: new RegExp(`^${filters.language.trim()}$`, 'i') };
      }

      if (filters.englishLevel && filters.englishLevel !== 'All' && filters.englishLevel !== 'All Levels' && filters.englishLevel !== 'Any Level') {
        query.englishLevel = filters.englishLevel;
      }

      if (filters.topic && filters.topic !== 'All') {
        query.$or = [
          { topicTitle: { $regex: new RegExp(filters.topic, 'i') } },
          { topicId: filters.topic },
        ];
      }

      if (filters.country && filters.country !== 'All') {
        query.hostCountry = { $regex: new RegExp(filters.country, 'i') };
      }

      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { name: { $regex: regex } },
            { description: { $regex: regex } },
            { hostName: { $regex: regex } },
            { hostCountry: { $regex: regex } },
            { topicTitle: { $regex: regex } },
          ],
        });
      }

      const total = await db.collection('rooms').countDocuments(query);
      const totalPages = Math.ceil(total / limit) || 1;

      const rooms = await db
        .collection<RoomDocument>('rooms')
        .find(query)
        .sort({ status: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return {
        data: rooms.map((r) => ({ ...r, id: r._id.toString() })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // In-memory fallback
    const memStore = getMemoryStore();
    let rooms: RoomDocument[] = memStore.get('rooms') || [];
    rooms = rooms.filter((r) => r.visibility === 'public' && r.status !== 'closed');

    if (filters.status && (filters.status === 'waiting' || filters.status === 'active')) {
      rooms = rooms.filter((r) => r.status === filters.status);
    }
    if (filters.language && filters.language !== 'All' && filters.language !== 'All Languages' && filters.language !== 'Any Language') {
      rooms = rooms.filter((r) => r.language && r.language.toLowerCase() === filters.language!.toLowerCase());
    }
    if (filters.englishLevel && filters.englishLevel !== 'All' && filters.englishLevel !== 'All Levels' && filters.englishLevel !== 'Any Level') {
      rooms = rooms.filter((r) => r.englishLevel === filters.englishLevel);
    }
    if (filters.topic && filters.topic !== 'All') {
      rooms = rooms.filter((r) => r.topicTitle.toLowerCase().includes(filters.topic!.toLowerCase()));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      rooms = rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.hostName.toLowerCase().includes(q) ||
          (r.hostCountry && r.hostCountry.toLowerCase().includes(q)) ||
          r.topicTitle.toLowerCase().includes(q)
      );
    }

    const total = rooms.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = rooms.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single room details by ID or Slug
   */
  async getRoomById(id: string): Promise<RoomDocument | null> {
    const db = getDatabase();
    if (db) {
      let room: RoomDocument | null = null;
      try {
        if (ObjectId.isValid(id)) {
          room = await db.collection<RoomDocument>('rooms').findOne({ _id: new ObjectId(id) });
        }
      } catch {
        // Proceed to query by slug or string id
      }

      if (!room) {
        room = await db.collection<RoomDocument>('rooms').findOne({ slug: id });
      }

      if (room) {
        return {
          ...room,
          id: (room as any)._id ? (room as any)._id.toString() : (room as any).id,
        };
      }

      return null;
    }

    const memStore = getMemoryStore();
    const rooms: RoomDocument[] = memStore.get('rooms') || [];
    return rooms.find((r) => (r as any)._id?.toString() === id || r.slug === id) || null;
  }

  /**
   * Join a room.
   * 1. Verify room exists
   * 2. Verify room not closed
   * 3. Verify room not full
   * 4. Verify user not already inside
   * 5. Create roomParticipants document
   * 6. Safely increment participantCount
   */
  async joinRoom(roomId: string, user: { uid: string; email?: string; name?: string }) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status === 'closed') {
      throw new Error('This speaking room has ended and is closed');
    }

    if (room.participantCount >= room.maxParticipants) {
      throw new Error('This room has reached its maximum participant capacity');
    }

    if (room.isLocked && room.hostId !== user.uid) {
      throw new Error('This room is currently locked by the host for an uninterrupted session.');
    }

    const db = getDatabase();
    let userDoc: any = null;
    if (db) {
      userDoc = await db.collection('users').findOne({ firebaseUid: user.uid });
    } else {
      const memStore = getMemoryStore();
      const users: any[] = memStore.get('users') || [];
      userDoc = users.find((u) => u.firebaseUid === user.uid);
    }

    const userId = userDoc?._id?.toString() || user.uid;
    const username = userDoc?.username || 'speaker';
    const avatar =
      userDoc?.avatar ||
      userDoc?.avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const country = userDoc?.country || 'Global';
    const englishLevel = userDoc?.englishLevel || 'Intermediate';

    const cleanRoomId = (room as any)._id?.toString() || roomId;

    if (db) {
      // Check if user is already inside
      const existing = await db
        .collection<RoomParticipantDocument>('roomParticipants')
        .findOne({ roomId: cleanRoomId, userId });

      if (existing) {
        return {
          room,
          participant: existing,
        };
      }

      // Insert participant document
      const newParticipant: RoomParticipantDocument = {
        roomId: cleanRoomId,
        userId,
        username,
        avatar,
        country,
        englishLevel,
        role: 'participant',
        joinedAt: new Date(),
        isMuted: false,
      };

      await db.collection<RoomParticipantDocument>('roomParticipants').insertOne(newParticipant as any);

      // Atomically increment participantCount and set status to active if > 1
      const updateResult = await db.collection<RoomDocument>('rooms').findOneAndUpdate(
        { _id: new ObjectId(cleanRoomId), participantCount: { $lt: room.maxParticipants } },
        {
          $inc: { participantCount: 1 },
          $set: { status: 'active', updatedAt: new Date() },
        },
        { returnDocument: 'after' }
      );

      return {
        room: updateResult || room,
        participant: newParticipant,
      };
    }

    // In-memory fallback
    const memStore = getMemoryStore();
    const participants: RoomParticipantDocument[] = memStore.get('roomParticipants') || [];
    const existing = participants.find((p) => p.roomId === cleanRoomId && p.userId === userId);
    if (existing) {
      return {
        room,
        participant: existing,
      };
    }

    const newParticipant: RoomParticipantDocument = {
      _id: `mem-part-${Date.now()}`,
      roomId: cleanRoomId,
      userId,
      username,
      avatar,
      country,
      englishLevel,
      role: 'participant',
      joinedAt: new Date(),
      isMuted: false,
    };

    participants.push(newParticipant);
    memStore.set('roomParticipants', participants);

    room.participantCount += 1;
    room.status = 'active';
    room.updatedAt = new Date();

    return {
      room,
      participant: newParticipant,
    };
  }

  /**
   * Leave a room.
   * If the host leaves:
   * - If other participants remain, transfer the host role to the earliest joined participant.
   * - If no participants remain, close the room.
   */
  async leaveRoom(roomId: string, user: { uid: string }) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const db = getDatabase();
    let userDoc: any = null;
    if (db) {
      userDoc = await db.collection('users').findOne({ firebaseUid: user.uid });
    } else {
      const memStore = getMemoryStore();
      const users: any[] = memStore.get('users') || [];
      userDoc = users.find((u) => u.firebaseUid === user.uid);
    }

    const userId = userDoc?._id?.toString() || user.uid;
    const cleanRoomId = (room as any)._id?.toString() || roomId;

    if (db) {
      // Find participant
      const participant = await db
        .collection<RoomParticipantDocument>('roomParticipants')
        .findOne({
          roomId: cleanRoomId,
          $or: [{ userId }, { userId: user.uid }],
        });

      if (!participant) {
        return {
          message: 'You have left the room.',
          roomClosed: false,
          wasAlreadyDeparted: true,
        };
      }

      const wasHost = participant.role === 'host' || room.hostId === userId;

      // Remove participant
      await db.collection('roomParticipants').deleteOne({ _id: new ObjectId(participant._id.toString()) });

      // Safe decrement participantCount
      await db.collection('rooms').updateOne(
        { _id: new ObjectId(cleanRoomId), participantCount: { $gt: 0 } },
        { $inc: { participantCount: -1 }, $set: { updatedAt: new Date() } }
      );

      // Check remaining participants
      const remainingParticipants = await db
        .collection<RoomParticipantDocument>('roomParticipants')
        .find({ roomId: cleanRoomId })
        .sort({ joinedAt: 1 })
        .toArray();

      if (remainingParticipants.length === 0) {
        // Close room if empty
        await db.collection('rooms').updateOne(
          { _id: new ObjectId(cleanRoomId) },
          { $set: { status: 'closed', participantCount: 0, updatedAt: new Date() } }
        );
        return { message: 'Left room. Room is now closed as all participants departed.', roomClosed: true };
      }

      if (wasHost && remainingParticipants.length > 0) {
        // Transfer host role to earliest joined participant
        const newHost = remainingParticipants[0];
        await db
          .collection('roomParticipants')
          .updateOne({ _id: new ObjectId(newHost._id.toString()) }, { $set: { role: 'host' } });

        await db.collection('rooms').updateOne(
          { _id: new ObjectId(cleanRoomId) },
          {
            $set: {
              hostId: newHost.userId,
              hostName: newHost.username,
              hostAvatar: newHost.avatar,
              hostCountry: newHost.country || 'Global',
              updatedAt: new Date(),
            },
          }
        );

        return {
          message: `Left room. Host role was transferred to ${newHost.username}.`,
          newHost: newHost.username,
          roomClosed: false,
        };
      }

      return { message: 'Successfully left the room', roomClosed: false };
    }

    // In-memory fallback
    const memStore = getMemoryStore();
    let participants: RoomParticipantDocument[] = memStore.get('roomParticipants') || [];
    const index = participants.findIndex(
      (p) => p.roomId === cleanRoomId && (p.userId === userId || p.userId === user.uid)
    );
    if (index === -1) {
      return {
        message: 'You have left the room.',
        roomClosed: false,
        wasAlreadyDeparted: true,
      };
    }

    const [removed] = participants.splice(index, 1);
    memStore.set('roomParticipants', participants);

    room.participantCount = Math.max(0, room.participantCount - 1);

    const remaining = participants.filter((p) => p.roomId === cleanRoomId);
    if (remaining.length === 0) {
      room.status = 'closed';
      room.participantCount = 0;
      return { message: 'Left room. Room closed.', roomClosed: true };
    }

    if (removed.role === 'host' && remaining.length > 0) {
      remaining[0].role = 'host';
      room.hostId = remaining[0].userId;
      room.hostName = remaining[0].username;
      room.hostAvatar = remaining[0].avatar;
      return { message: `Host transferred to ${remaining[0].username}`, roomClosed: false };
    }

    return { message: 'Left room', roomClosed: false };
  }

  /**
   * Get participant list with safe fields only (no emails or auth tokens)
   */
  async getRoomParticipants(roomId: string) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const cleanRoomId = (room as any)._id?.toString() || roomId;
    const db = getDatabase();

    if (db) {
      const participants = await db
        .collection<RoomParticipantDocument>('roomParticipants')
        .find({ roomId: cleanRoomId })
        .sort({ role: -1, joinedAt: 1 })
        .project({
          username: 1,
          avatar: 1,
          country: 1,
          englishLevel: 1,
          role: 1,
          joinedAt: 1,
          isMuted: 1,
          userId: 1,
        })
        .toArray();

      return participants;
    }

    const memStore = getMemoryStore();
    const participants: RoomParticipantDocument[] = memStore.get('roomParticipants') || [];
    return participants
      .filter((p) => p.roomId === cleanRoomId)
      .map(({ username, avatar, country, englishLevel, role, joinedAt, isMuted, userId }) => ({
        username,
        avatar,
        country,
        englishLevel,
        role,
        joinedAt,
        isMuted,
        userId,
      }));
  }

  /**
   * Update room details (Host only)
   */
  async updateRoom(
    roomId: string,
    userUid: string,
    input: UpdateRoomInput
  ): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const db = getDatabase();
    let callerUser: any = null;
    if (db) {
      callerUser = await db.collection('users').findOne({ firebaseUid: userUid });
    }

    const callerId = callerUser?._id?.toString() || userUid;
    if (room.hostId !== callerId && callerUser?.role !== 'admin') {
      throw new Error('Only the room host is authorized to edit this room');
    }

    const cleanRoomId = (room as any)._id?.toString() || roomId;
    const updateFields: any = { updatedAt: new Date() };

    if (input.name) updateFields.name = input.name.trim();
    if (input.description !== undefined) updateFields.description = input.description.trim();
    if (input.englishLevel) updateFields.englishLevel = input.englishLevel;
    if (input.maxParticipants) updateFields.maxParticipants = input.maxParticipants;
    if (input.visibility) updateFields.visibility = input.visibility;
    if (input.language) updateFields.language = input.language;
    if (input.status) updateFields.status = input.status;

    if (input.topicId) {
      const topic = await topicService.getTopicById(input.topicId);
      if (topic) {
        updateFields.topicId = topic._id ? topic._id.toString() : topic.slug;
        updateFields.topicTitle = topic.title;
      }
    }

    if (db) {
      await db
        .collection('rooms')
        .updateOne({ _id: new ObjectId(cleanRoomId) }, { $set: updateFields });
      const updated = await this.getRoomById(cleanRoomId);
      return updated!;
    }

    Object.assign(room, updateFields);
    return room;
  }

  /**
   * Close a room (Host only)
   */
  async closeRoom(roomId: string, userUid: string) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const db = getDatabase();
    let callerUser: any = null;
    if (db) {
      callerUser = await db.collection('users').findOne({ firebaseUid: userUid });
    }

    const callerId = callerUser?._id?.toString() || userUid;
    if (room.hostId !== callerId && callerUser?.role !== 'admin') {
      throw new Error('Only the room host is authorized to close this room');
    }

    const cleanRoomId = (room as any)._id?.toString() || roomId;

    if (db) {
      await db.collection('rooms').updateOne(
        { _id: new ObjectId(cleanRoomId) },
        {
          $set: {
            status: 'closed',
            updatedAt: new Date(),
          },
        }
      );
      // Remove all participants
      await db.collection('roomParticipants').deleteMany({ roomId: cleanRoomId });
      return { success: true, message: 'Room successfully closed' };
    }

    room.status = 'closed';
    room.updatedAt = new Date();
    return { success: true, message: 'Room successfully closed' };
  }

  /**
   * Toggle or set room locked state (Host only)
   */
  async toggleRoomLock(
    roomId: string,
    user: { uid: string },
    explicitLockState?: boolean
  ): Promise<RoomDocument> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const db = getDatabase();
    let callerUser: any = null;
    if (db) {
      callerUser =
        (await db.collection('users').findOne({ firebaseUid: user.uid })) ||
        (ObjectId.isValid(user.uid) ? await db.collection('users').findOne({ _id: new ObjectId(user.uid) }) : null);
    } else {
      const memStore = getMemoryStore();
      const users: any[] = memStore.get('users') || [];
      callerUser = users.find((u) => u.firebaseUid === user.uid || u.id === user.uid);
    }

    const callerId = callerUser?._id?.toString() || user.uid;
    if (room.hostId !== callerId && room.hostId !== user.uid && callerUser?.role !== 'admin') {
      throw new Error('Only the room host is authorized to lock or unlock this room');
    }

    const nextLockState = explicitLockState !== undefined ? explicitLockState : !room.isLocked;
    const cleanRoomId = (room as any)._id?.toString() || roomId;

    if (db && ObjectId.isValid(cleanRoomId)) {
      await db.collection<RoomDocument>('rooms').updateOne(
        { _id: new ObjectId(cleanRoomId) },
        {
          $set: {
            isLocked: nextLockState,
            updatedAt: new Date(),
          },
        }
      );
    } else {
      const memStore = getMemoryStore();
      const rooms: RoomDocument[] = memStore.get('rooms') || [];
      const r = rooms.find(
        (rm) => (rm as any)._id?.toString() === cleanRoomId || rm.id === cleanRoomId || rm.slug === cleanRoomId
      );
      if (r) {
        r.isLocked = nextLockState;
        r.updatedAt = new Date();
      }
    }

    room.isLocked = nextLockState;
    return room;
  }
}

export const roomService = new RoomService();
