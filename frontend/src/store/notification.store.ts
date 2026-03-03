import { create } from 'zustand';
import type { AppNotification } from '@/types/notification';

interface NotificationState {
  notifications: AppNotification[];
  setNotifications: (notifications: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (notification: AppNotification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  pushNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
    })),
}));
