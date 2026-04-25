import { useEffect } from 'react';
import { useNotifications } from '@/queries/notification.queries';
import { useNotificationStore } from '@/store/notification.store';
import { useSessionStore } from '@/store/session.store';
export function NotificationBootstrap() {
  const { data } = useNotifications();
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const hasHydrated = useNotificationStore((s) => s.hasHydrated);
  const token = useSessionStore((s) => s.token);
  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      setNotifications([]);
      return;
    }

    if (Array.isArray(data)) {
      setNotifications(data);
    }
  }, [data, hasHydrated, setNotifications, token]);
  return null;
}
