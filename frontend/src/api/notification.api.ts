import { apiClient } from './client';
import type { AppNotification } from '@/types/notification';

function normalizeNotifications(payload: unknown): AppNotification[] {
  if (Array.isArray(payload)) {
    return payload as AppNotification[];
  }

  if (payload && typeof payload === 'object') {
    const asRecord = payload as Record<string, unknown>;
    if (Array.isArray(asRecord.notifications)) {
      return asRecord.notifications as AppNotification[];
    }
    if (Array.isArray(asRecord.data)) {
      return asRecord.data as AppNotification[];
    }
  }

  return [];
}

export const notificationApi = {
  getAll: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get<unknown>('/notifications');
    return normalizeNotifications(data);
  },
};
