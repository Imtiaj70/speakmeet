import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { seedTopics } from '../seeds/topicsSeed';
import { seedRooms } from '../seeds/roomsSeed';

dotenv.config();

function cleanEnvString(val?: string | null): string {
  if (!val) return '';
  let s = val.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const MONGODB_URI = cleanEnvString(process.env.MONGODB_URI);
const DB_NAME =
  cleanEnvString(process.env.MONGODB_DB_NAME) ||
  cleanEnvString(process.env.DB_NAME) ||
  'speakmeet';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

// Fallback in-memory store for local sandboxes or offline development
const memoryStore = new Map<string, any>();

export async function connectToDatabase(): Promise<Db | null> {
  if (isConnected && db) {
    return db;
  }

  if (!MONGODB_URI) {
    console.warn('[MongoDB] MONGODB_URI not provided. Operating with in-memory persistence fallback.');
    return null;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    db = client.db(DB_NAME);
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to database: ${DB_NAME}`);

    // Create required collections if they do not exist
    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
    const requiredCollections = [
      'users',
      'rooms',
      'roomParticipants',
      'topics',
      'sessions',
      'invitations',
      'notifications',
      'reports',
      'achievements',
      'userAchievements',
    ];

    for (const colName of requiredCollections) {
      if (!existingCollections.includes(colName)) {
        await db.createCollection(colName);
      }
    }

    // 1. Users Indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ firebaseUid: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 });
    await usersCollection.createIndex({ country: 1 });
    await usersCollection.createIndex({ englishLevel: 1 });

    // 2. Rooms Indexes
    const roomsCollection = db.collection('rooms');
    await roomsCollection.createIndex({ hostId: 1 });
    await roomsCollection.createIndex({ topicId: 1 });
    await roomsCollection.createIndex({ language: 1 });
    await roomsCollection.createIndex({ englishLevel: 1 });
    await roomsCollection.createIndex({ status: 1 });
    await roomsCollection.createIndex({ createdAt: -1 });

    // 3. Room Participants Indexes
    const participantsCollection = db.collection('roomParticipants');
    await participantsCollection.createIndex({ roomId: 1 });
    await participantsCollection.createIndex({ userId: 1 });
    await participantsCollection.createIndex({ roomId: 1, userId: 1 }, { unique: true });

    // 4. Topics Indexes
    const topicsCollection = db.collection('topics');
    await topicsCollection.createIndex({ slug: 1 }, { unique: true });
    await topicsCollection.createIndex({ category: 1 });
    await topicsCollection.createIndex({ difficulty: 1 });

    console.log('[MongoDB] Verified indexes on users, rooms, roomParticipants, and topics collections');

    // Auto-seed topics and rooms
    await seedTopics(db);
    await seedRooms(db);

    return db;
  } catch (err) {
    console.error('[MongoDB] Connection failure:', err);
    isConnected = false;
    return null;
  }
}

export function getDatabase(): Db | null {
  return db;
}

export function getMemoryStore(): Map<string, any> {
  return memoryStore;
}
