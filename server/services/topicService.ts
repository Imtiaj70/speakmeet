import { ObjectId } from 'mongodb';
import { getDatabase, getMemoryStore } from '../config/db';
import { SEED_TOPICS, TopicSeedItem } from '../seeds/topicsSeed';

export interface TopicModel {
  _id?: ObjectId | string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';
  questions: string[];
  createdAt: Date;
}

export interface TopicQueryFilters {
  search?: string;
  category?: string;
  difficulty?: string;
}

export class TopicService {
  /**
   * Get list of topics with optional filters for search, category, and difficulty
   */
  async getTopics(filters: TopicQueryFilters = {}): Promise<TopicModel[]> {
    const db = getDatabase();
    if (db) {
      const query: any = {};

      if (filters.category && filters.category !== 'All') {
        query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
      }

      if (filters.difficulty && filters.difficulty !== 'All') {
        query.difficulty = filters.difficulty;
      }

      if (filters.search) {
        const searchRegex = new RegExp(filters.search.trim(), 'i');
        query.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { questions: { $elemMatch: { $regex: searchRegex } } },
        ];
      }

      const topics = await db.collection<TopicModel>('topics').find(query).sort({ category: 1, title: 1 }).toArray();
      return topics;
    }

    // In-memory fallback
    const memStore = getMemoryStore();
    let topics: TopicModel[] = memStore.get('topics') || SEED_TOPICS;

    if (filters.category && filters.category !== 'All') {
      topics = topics.filter((t) => t.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.difficulty && filters.difficulty !== 'All') {
      topics = topics.filter((t) => t.difficulty === filters.difficulty);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      topics = topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.questions.some((item) => item.toLowerCase().includes(q))
      );
    }

    return topics;
  }

  /**
   * Get a single topic by slug
   */
  async getTopicBySlug(slug: string): Promise<TopicModel | null> {
    const db = getDatabase();
    if (db) {
      const topic = await db.collection<TopicModel>('topics').findOne({ slug: slug.trim() });
      return topic;
    }

    const memStore = getMemoryStore();
    const topics: TopicModel[] = memStore.get('topics') || SEED_TOPICS;
    return topics.find((t) => t.slug === slug.trim()) || null;
  }

  /**
   * Get a topic by ID (supports MongoDB ObjectId string or in-memory ID)
   */
  async getTopicById(id: string): Promise<TopicModel | null> {
    const db = getDatabase();
    if (db) {
      try {
        if (ObjectId.isValid(id)) {
          const topic = await db.collection<TopicModel>('topics').findOne({ _id: new ObjectId(id) });
          if (topic) return topic;
        }
      } catch {
        // Continue to search by slug or string id
      }
      const bySlug = await db.collection<TopicModel>('topics').findOne({ slug: id });
      if (bySlug) return bySlug;
      return null;
    }

    const memStore = getMemoryStore();
    const topics: TopicModel[] = memStore.get('topics') || SEED_TOPICS;
    return topics.find((t) => (t as any)._id?.toString() === id || t.slug === id) || null;
  }

  /**
   * Get all topics for a specific category
   */
  async getTopicsByCategory(category: string): Promise<TopicModel[]> {
    return this.getTopics({ category });
  }
}

export const topicService = new TopicService();
