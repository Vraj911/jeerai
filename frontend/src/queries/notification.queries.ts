import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
