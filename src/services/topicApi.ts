import { apiClient } from './apiClient';
import { TopicItem } from '../types';

export interface GetTopicsParams {
  search?: string;
  category?: string;
  difficulty?: string;
}

export const topicApi = {
  /**
   * Get list of topics with optional filters
   */
  async getTopics(params?: GetTopicsParams): Promise<TopicItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/topics', {
      params,
    });
    return (res.data.data || []).map((t) => ({
      id: t._id?.toString() || t.id || t.slug,
      _id: t._id?.toString(),
      slug: t.slug,
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      questions: t.questions || [],
      popularCount: t.popularCount || Math.floor(Math.random() * 800) + 120,
      createdAt: t.createdAt,
    }));
  },

  /**
   * Get topic by slug
   */
  async getTopicBySlug(slug: string): Promise<TopicItem> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/topics/${encodeURIComponent(slug)}`);
    const t = res.data.data;
    return {
      id: t._id?.toString() || t.id || t.slug,
      _id: t._id?.toString(),
      slug: t.slug,
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      questions: t.questions || [],
      popularCount: t.popularCount || 250,
      createdAt: t.createdAt,
    };
  },

  /**
   * Get topics by category
   */
  async getTopicsByCategory(category: string): Promise<TopicItem[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      `/topics/category/${encodeURIComponent(category)}`
    );
    return (res.data.data || []).map((t) => ({
      id: t._id?.toString() || t.id || t.slug,
      _id: t._id?.toString(),
      slug: t.slug,
      title: t.title,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      questions: t.questions || [],
      popularCount: t.popularCount || 100,
      createdAt: t.createdAt,
    }));
  },
};
