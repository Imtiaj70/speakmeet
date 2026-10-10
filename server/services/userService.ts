import { getDatabase, getMemoryStore } from '../config/db';

export const ADMIN_EMAILS = [
  'imtiajuddinsohag99@gmail.com',
];

export function isPlatformAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

export interface MongoUserDocument {
  firebaseUid: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  country: string;
  nativeLanguage: string;
  englishLevel: string;
  learningGoals: string[];
  interests: string[];
  bio: string;
  role: 'user' | 'moderator' | 'admin';
  isBanned?: boolean;
  speakingMinutes: number;
  speakingSessions: number;
  currentStreak: number;
  longestStreak: number;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private static async getCollection() {
    const db = getDatabase();
    if (db) {
      return db.collection<MongoUserDocument>('users');
    }
    return null;
  }

  static async findByFirebaseUid(firebaseUid: string): Promise<MongoUserDocument | null> {
    const col = await this.getCollection();
    if (col) {
      const user = await col.findOne({ firebaseUid });
      if (user && isPlatformAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        await col.updateOne({ firebaseUid }, { $set: { role: 'admin', updatedAt: new Date() } });
      }
      return user;
    }
    const mem = getMemoryStore();
    const user = mem.get(`user:uid:${firebaseUid}`) || null;
    if (user && isPlatformAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin';
      mem.set(`user:uid:${firebaseUid}`, user);
    }
    return user;
  }

  static async findByUsername(username: string): Promise<MongoUserDocument | null> {
    const cleanUsername = username.toLowerCase();
    const col = await this.getCollection();
    if (col) {
      const user = await col.findOne({ username: cleanUsername });
      if (user && isPlatformAdminEmail(user.email) && user.role !== 'admin') {
        user.role = 'admin';
        await col.updateOne({ username: cleanUsername }, { $set: { role: 'admin', updatedAt: new Date() } });
      }
      return user;
    }
    const mem = getMemoryStore();
    const user = mem.get(`user:uname:${cleanUsername}`) || null;
    if (user && isPlatformAdminEmail(user.email) && user.role !== 'admin') {
      user.role = 'admin';
      mem.set(`user:uname:${cleanUsername}`, user);
    }
    return user;
  }

  static async isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
    const cleanUsername = username.toLowerCase();
    const col = await this.getCollection();
    if (col) {
      const existing = await col.findOne({ username: cleanUsername });
      if (!existing) return true;
      if (excludeUid && existing.firebaseUid === excludeUid) return true;
      return false;
    }

    const mem = getMemoryStore();
    const existing = mem.get(`user:uname:${cleanUsername}`);
    if (!existing) return true;
    if (excludeUid && existing.firebaseUid === excludeUid) return true;
    return false;
  }

  static async createUser(data: {
    firebaseUid: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
    country?: string;
    nativeLanguage?: string;
    englishLevel?: string;
    learningGoals?: string[];
    interests?: string[];
    bio?: string;
  }): Promise<MongoUserDocument> {
    const now = new Date();
    const cleanUsername = (data.username || `user_${Date.now().toString(36)}`).toLowerCase();

    const userDoc: MongoUserDocument = {
      firebaseUid: data.firebaseUid,
      name: data.name || 'SpeakMate Learner',
      username: cleanUsername,
      email: data.email.toLowerCase(),
      avatar:
        data.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
      country: data.country || 'Global',
      nativeLanguage: data.nativeLanguage || 'English',
      englishLevel: data.englishLevel || 'Intermediate',
      learningGoals: data.learningGoals || ['Daily conversation'],
      interests: data.interests || ['General conversation', 'Culture'],
      bio: data.bio || 'Passionate English speaker practicing daily.',
      role: isPlatformAdminEmail(data.email) ? 'admin' : 'user',
      isBanned: false,
      speakingMinutes: 0,
      speakingSessions: 0,
      currentStreak: 1,
      longestStreak: 1,
      isProfileComplete: Boolean(data.name && data.username && data.country && data.englishLevel),
      createdAt: now,
      updatedAt: now,
    };

    const col = await this.getCollection();
    if (col) {
      await col.insertOne(userDoc);
    } else {
      const mem = getMemoryStore();
      mem.set(`user:uid:${userDoc.firebaseUid}`, userDoc);
      mem.set(`user:uname:${userDoc.username}`, userDoc);
    }

    return userDoc;
  }

  static async updateUser(
    firebaseUid: string,
    updates: Partial<MongoUserDocument>
  ): Promise<MongoUserDocument | null> {
    const now = new Date();
    const cleanUpdates = {
      ...updates,
      updatedAt: now,
    };

    if (cleanUpdates.username) {
      cleanUpdates.username = cleanUpdates.username.toLowerCase();
    }

    // Ensure role is never altered through normal user update
    delete cleanUpdates.role;
    delete cleanUpdates.firebaseUid;

    const col = await this.getCollection();
    if (col) {
      const res = await col.findOneAndUpdate(
        { firebaseUid },
        { $set: cleanUpdates },
        { returnDocument: 'after' }
      );
      return res as MongoUserDocument | null;
    }

    const mem = getMemoryStore();
    const existing = mem.get(`user:uid:${firebaseUid}`);
    if (!existing) return null;

    const oldUsername = existing.username;
    const updated = { ...existing, ...cleanUpdates };
    mem.set(`user:uid:${firebaseUid}`, updated);

    if (cleanUpdates.username && cleanUpdates.username !== oldUsername) {
      mem.delete(`user:uname:${oldUsername}`);
      mem.set(`user:uname:${cleanUpdates.username}`, updated);
    } else {
      mem.set(`user:uname:${updated.username}`, updated);
    }

    return updated;
  }

  static async listPublicUsers(limit = 20): Promise<Array<Partial<MongoUserDocument>>> {
    const col = await this.getCollection();
    if (col) {
      const users = await col
        .find(
          {},
          {
            projection: {
              firebaseUid: 0,
              email: 0,
              _id: 0,
            },
          }
        )
        .limit(limit)
        .toArray();
      return users;
    }

    const mem = getMemoryStore();
    const users: Array<Partial<MongoUserDocument>> = [];
    for (const [key, user] of mem.entries()) {
      if (key.startsWith('user:uid:')) {
        const { firebaseUid, email, ...publicData } = user;
        users.push(publicData);
        if (users.length >= limit) break;
      }
    }
    return users;
  }

  static async listUsersForAdmin(limit = 100): Promise<MongoUserDocument[]> {
    const col = await this.getCollection();
    if (col) {
      const users = await col
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return users;
    }

    const mem = getMemoryStore();
    const users: MongoUserDocument[] = [];
    for (const [key, user] of mem.entries()) {
      if (key.startsWith('user:uid:')) {
        users.push(user);
      }
    }
    return users.slice(0, limit);
  }

  static async updateRoleByAdmin(
    targetUid: string,
    role: 'user' | 'moderator' | 'admin'
  ): Promise<MongoUserDocument | null> {
    const col = await this.getCollection();
    if (col) {
      const res = await col.findOneAndUpdate(
        { firebaseUid: targetUid },
        { $set: { role, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return res as MongoUserDocument | null;
    }

    const mem = getMemoryStore();
    const user = mem.get(`user:uid:${targetUid}`);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();
    mem.set(`user:uid:${targetUid}`, user);
    mem.set(`user:uname:${user.username}`, user);
    return user;
  }

  static async toggleBanByAdmin(
    targetUid: string,
    isBanned: boolean
  ): Promise<MongoUserDocument | null> {
    const col = await this.getCollection();
    if (col) {
      const res = await col.findOneAndUpdate(
        { firebaseUid: targetUid },
        { $set: { isBanned, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return res as MongoUserDocument | null;
    }

    const mem = getMemoryStore();
    const user = mem.get(`user:uid:${targetUid}`);
    if (!user) return null;
    user.isBanned = isBanned;
    user.updatedAt = new Date();
    mem.set(`user:uid:${targetUid}`, user);
    mem.set(`user:uname:${user.username}`, user);
    return user;
  }

  static async deleteUserByAdmin(targetUid: string): Promise<boolean> {
    const col = await this.getCollection();
    if (col) {
      const user = await col.findOne({ firebaseUid: targetUid });
      if (!user) return false;
      await col.deleteOne({ firebaseUid: targetUid });
      return true;
    }

    const mem = getMemoryStore();
    const user = mem.get(`user:uid:${targetUid}`);
    if (!user) return false;
    mem.delete(`user:uid:${targetUid}`);
    mem.delete(`user:uname:${user.username}`);
    return true;
  }

  static async getPlatformStats(): Promise<{
    totalUsers: number;
    activeRooms: number;
    totalRooms: number;
    totalParticipants: number;
  }> {
    const db = getDatabase();
    if (db) {
      const totalUsers = await db.collection('users').countDocuments();
      const totalRooms = await db.collection('rooms').countDocuments({ status: { $ne: 'closed' } });
      const activeRooms = await db.collection('rooms').countDocuments({ status: 'active' });
      const totalParticipants = await db.collection('roomParticipants').countDocuments();
      return { totalUsers, activeRooms, totalRooms, totalParticipants };
    }

    const mem = getMemoryStore();
    let totalUsers = 0;
    for (const key of mem.keys()) {
      if (key.startsWith('user:uid:')) totalUsers++;
    }
    const rooms = mem.get('rooms') || [];
    const openRooms = rooms.filter((r: any) => r.status !== 'closed');
    const activeRooms = rooms.filter((r: any) => r.status === 'active').length;
    const participants = mem.get('roomParticipants') || [];
    return {
      totalUsers: Math.max(totalUsers, 1),
      activeRooms,
      totalRooms: openRooms.length,
      totalParticipants: participants.length,
    };
  }
}
