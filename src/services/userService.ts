import { apiClient } from './apiClient';
import { UserProfile } from '../types';

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  avatar?: string;
  country?: string;
  countryCode?: string;
  nativeLanguage?: string;
  englishLevel?: string;
  learningGoals?: string[];
  interests?: string[];
  bio?: string;
}

export const userService = {
  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<{ success: boolean; user: UserProfile }>('/users/me');
    return response.data.user;
  },

  async updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.patch<{ success: boolean; user: UserProfile }>('/users/me', payload);
    return response.data.user;
  },

  async createUser(payload: UpdateProfilePayload & { email?: string; firebaseUid?: string }): Promise<UserProfile> {
    const response = await apiClient.post<{ success: boolean; user: UserProfile }>('/users', payload);
    return response.data.user;
  },

  async checkUsername(username: string): Promise<{ available: boolean; reason?: string }> {
    const response = await apiClient.get<{ available: boolean; reason?: string }>(
      `/users/check-username/${encodeURIComponent(username)}`
    );
    return response.data;
  },

  async getPublicProfile(username: string): Promise<Partial<UserProfile>> {
    const response = await apiClient.get<{ success: boolean; user: Partial<UserProfile> }>(
      `/users/${encodeURIComponent(username)}`
    );
    return response.data.user;
  },

  async listUsers(): Promise<Array<Partial<UserProfile>>> {
    const response = await apiClient.get<{ success: boolean; users: Array<Partial<UserProfile>> }>('/users');
    return response.data.users;
  },
};
