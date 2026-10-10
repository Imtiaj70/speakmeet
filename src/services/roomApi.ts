import { apiClient } from './apiClient';
import { SpeakingRoom, RoomParticipant, EnglishLevel } from '../types';

export interface GetRoomsParams {
  search?: string;
  topic?: string;
  englishLevel?: string;
  language?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  topicId: string;
  englishLevel: EnglishLevel | string;
  language?: string;
  maxParticipants: number;
  visibility: 'public' | 'private';
  hostName?: string;
  hostUsername?: string;
  hostAvatar?: string;
  hostCountry?: string;
}

function normalizeRoom(r: any): SpeakingRoom {
  const currentParticipants =
    typeof r.participantCount === 'number'
      ? r.participantCount
      : typeof r.currentParticipants === 'number'
      ? r.currentParticipants
      : 1;

  return {
    id: r._id?.toString() || r.id || r.slug,
    _id: r._id?.toString(),
    slug: r.slug,
    name: r.name,
    topic: r.topicTitle || r.topic || 'General English',
    topicId: r.topicId,
    topicTitle: r.topicTitle || r.topic || 'General English',
    description: r.description || '',
    englishLevel: r.englishLevel || 'Intermediate',
    hostId: r.hostId,
    hostName: r.hostName || 'Host',
    hostCountry: r.hostCountry || 'Global',
    hostAvatar: r.hostAvatar,
    participantCount: currentParticipants,
    currentParticipants: currentParticipants,
    maxParticipants: r.maxParticipants || 6,
    isPrivate: r.visibility === 'private' || !!r.isPrivate,
    visibility: r.visibility || (r.isPrivate ? 'private' : 'public'),
    conversationLanguage: r.language || r.conversationLanguage || 'English',
    language: r.language || 'English',
    status: r.status || 'waiting',
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
    tags: r.tags || [r.topicTitle || 'Speaking', r.englishLevel || 'Practice'],
  };
}

export const roomApi = {
  /**
   * Fetch public speaking rooms with optional search & filters
   */
  async getRooms(params?: GetRoomsParams): Promise<{
    data: SpeakingRoom[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const res = await apiClient.get<{
      success: boolean;
      data: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>('/rooms', { params });

    return {
      data: (res.data.data || []).map(normalizeRoom),
      pagination: res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  },

  /**
   * Get single room details
   */
  async getRoomById(id: string): Promise<SpeakingRoom> {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/rooms/${encodeURIComponent(id)}`);
    return normalizeRoom(res.data.data);
  },

  /**
   * Create a new room (Requires authentication)
   */
  async createRoom(payload: CreateRoomPayload): Promise<SpeakingRoom> {
    const res = await apiClient.post<{ success: boolean; data: any }>('/rooms', payload);
    return normalizeRoom(res.data.data);
  },

  /**
   * Join an existing room
   */
  async joinRoom(roomId: string): Promise<{ room: SpeakingRoom; participant: RoomParticipant }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { room: any; participant: any };
    }>(`/rooms/${encodeURIComponent(roomId)}/join`);

    return {
      room: normalizeRoom(res.data.data.room),
      participant: res.data.data.participant,
    };
  },

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string): Promise<{ message: string; roomClosed?: boolean; newHost?: string }> {
    const res = await apiClient.post<{
      success: boolean;
      data: { message: string; roomClosed?: boolean; newHost?: string };
    }>(`/rooms/${encodeURIComponent(roomId)}/leave`);
    return res.data.data;
  },

  /**
   * Get participants in a room
   */
  async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
    const res = await apiClient.get<{ success: boolean; data: any[] }>(
      `/rooms/${encodeURIComponent(roomId)}/participants`
    );
    return res.data.data || [];
  },

  /**
   * Update room details (Host only)
   */
  async updateRoom(roomId: string, payload: Partial<CreateRoomPayload>): Promise<SpeakingRoom> {
    const res = await apiClient.patch<{ success: boolean; data: any }>(
      `/rooms/${encodeURIComponent(roomId)}`,
      payload
    );
    return normalizeRoom(res.data.data);
  },

  /**
   * Close a room (Host only)
   */
  async closeRoom(roomId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/rooms/${encodeURIComponent(roomId)}`
    );
    return res.data;
  },
};
