import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
  });
}
