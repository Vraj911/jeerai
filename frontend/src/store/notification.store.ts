import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '@/types/notification';
interface NotificationState {
  hasHydrated: boolean;
  notifications: AppNotification[];
  readNotificationIds: string[];
  setHasHydrated: (hasHydrated: boolean) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (notification: AppNotification) => void;
}
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      notifications: [],
      readNotificationIds: [],
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setNotifications: (notifications) =>
        set((state) => {
          const existing = Array.isArray(state.notifications) ? state.notifications : [];
          const incoming = Array.isArray(notifications) ? notifications : [];

          const mergedById = new Map<string, AppNotification>();

          for (const notification of existing) {
            mergedById.set(notification.id, notification);
          }

          for (const notification of incoming) {
            const prev = mergedById.get(notification.id);
            mergedById.set(notification.id, {
              ...prev,
              ...notification,
              read: notification.read || state.readNotificationIds.includes(notification.id) || Boolean(prev?.read),
            });
          }

          const merged = Array.from(mergedById.values()).sort((a, b) => {
            const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bt - at;
          });

          return { notifications: merged };
        }),
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
