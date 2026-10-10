import { useQuery } from '@tanstack/react-query';
import { topicApi, GetTopicsParams } from '../services/topicApi';
import { TopicItem } from '../types';

export function useTopics(params?: GetTopicsParams) {
  return useQuery<TopicItem[]>({
    queryKey: ['topics', params],
    queryFn: () => topicApi.getTopics(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTopic(slug?: string) {
  return useQuery<TopicItem | null>({
    queryKey: ['topic', slug],
    queryFn: () => (slug ? topicApi.getTopicBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopicsByCategory(category?: string) {
  return useQuery<TopicItem[]>({
    queryKey: ['topics', 'category', category],
    queryFn: () => (category ? topicApi.getTopicsByCategory(category) : Promise.resolve([])),
    enabled: !!category && category !== 'All',
    staleTime: 1000 * 60 * 5,
  });
}
