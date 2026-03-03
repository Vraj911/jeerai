import { useEffect } from 'react';
import { useNotifications } from '@/queries/notification.queries';
import { useNotificationStore } from '@/store/notification.store';

export function NotificationBootstrap() {
  const { data } = useNotifications();
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  useEffect(() => {
    if (data) {
      setNotifications(data);
    }
  }, [data, setNotifications]);

  return null;
}
