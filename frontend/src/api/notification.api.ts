import { apiClient } from './client';
import type { AppNotification } from '@/types/notification';

export const notificationApi = {
  getAll: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get<AppNotification[]>('/notifications');
    return data;
  },
};
