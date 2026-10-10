import { apiClient } from './apiClient';
import { UserProfile, SpeakingRoom } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeRooms: number;
  totalRooms: number;
  totalParticipants: number;
  pendingReports: number;
  announcement?: {
    id: string;
    active: boolean;
    message: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    updatedAt: string;
    updatedBy?: string;
  };
}

export interface AdminReport {
  id: string;
  reporter: string;
  reportedUser: string;
  reportedUid?: string;
  reason: string;
  room: string;
  status: 'pending' | 'resolved' | 'banned';
  date: string;
}

export const adminApi = {
  async getOverview(): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await apiClient.get('/admin/overview');
    return res.data;
  },

  async getUsers(): Promise<{ success: boolean; users: UserProfile[] }> {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  async updateUserRole(
    uid: string,
    role: 'user' | 'moderator' | 'admin'
  ): Promise<{ success: boolean; user: UserProfile }> {
    const res = await apiClient.patch(`/admin/users/${uid}/role`, { role });
    return res.data;
  },

  async toggleUserBan(
    uid: string,
    isBanned: boolean
  ): Promise<{ success: boolean; user: UserProfile }> {
    const res = await apiClient.patch(`/admin/users/${uid}/ban`, { isBanned });
    return res.data;
  },

  async deleteUser(uid: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/admin/users/${uid}`);
    return res.data;
  },

  async getAllRooms(): Promise<{ success: boolean; rooms: SpeakingRoom[] }> {
    const res = await apiClient.get('/admin/rooms');
    return res.data;
  },

  async forceDeleteRoom(roomId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/admin/rooms/${roomId}`);
    return res.data;
  },

  async getAnnouncement(): Promise<{ success: boolean; announcement: any }> {
    const res = await apiClient.get('/admin/announcement');
    return res.data;
  },

  async updateAnnouncement(data: {
    message: string;
    active: boolean;
    type?: 'info' | 'warning' | 'success' | 'alert';
  }): Promise<{ success: boolean; announcement: any }> {
    const res = await apiClient.post('/admin/announcement', data);
    return res.data;
  },

  async getReports(): Promise<{ success: boolean; reports: AdminReport[] }> {
    const res = await apiClient.get('/admin/reports');
    return res.data;
  },

  async actionReport(
    id: string,
    action: 'dismiss' | 'ban'
  ): Promise<{ success: boolean; report: AdminReport }> {
    const res = await apiClient.post(`/admin/reports/${id}/action`, { action });
    return res.data;
  },
};
