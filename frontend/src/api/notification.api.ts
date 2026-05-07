import { apiClient } from './client';
import type { AppNotification, NotificationPageResponse } from '@/types/notification';

export const notificationApi = {
  getPage: async (page: number, size: number): Promise<NotificationPageResponse> => {
    const { data } = await apiClient.get<NotificationPageResponse>('/notifications', {
      params: { page, size },
    });
    return data;
  },

  markRead: async (id: string): Promise<AppNotification> => {
    const { data } = await apiClient.patch<AppNotification>(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.patch<AppNotification[]>('/notifications/read-all');
    return data;
  },
};
