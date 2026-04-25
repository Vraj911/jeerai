import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '@/types/notification';
interface NotificationState {
  notifications: AppNotification[];
  readNotificationIds: string[];
  setNotifications: (notifications: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (notification: AppNotification) => void;
}
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      readNotificationIds: [],
      setNotifications: (notifications) =>
        set((state) => ({
          notifications: notifications.map((notification) => ({
            ...notification,
            read: notification.read || state.readNotificationIds.includes(notification.id),
          })),
        })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
          readNotificationIds: state.readNotificationIds.includes(id)
            ? state.readNotificationIds
            : [...state.readNotificationIds, id],
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
          readNotificationIds: Array.from(new Set([...state.readNotificationIds, ...state.notifications.map((notification) => notification.id)])),
        })),
      pushNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              read: notification.read || state.readNotificationIds.includes(notification.id),
            },
            ...state.notifications,
          ],
        })),
    }),
    {
      name: 'jeerai-notifications',
      partialize: (state) => ({
        readNotificationIds: state.readNotificationIds,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<NotificationState>),
      }),
    }
  )
);
