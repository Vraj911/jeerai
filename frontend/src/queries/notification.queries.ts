import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useSessionStore } from '@/store/session.store';

export function useNotifications() {
  const token = useSessionStore((s) => s.token);
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    enabled: Boolean(token),
  });
}
