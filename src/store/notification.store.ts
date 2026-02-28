import { create } from 'zustand';
import { mockNotifications, type AppNotification } from '@/lib/mockAdapter';

interface NotificationState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (notification: AppNotification) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [...mockNotifications],
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
