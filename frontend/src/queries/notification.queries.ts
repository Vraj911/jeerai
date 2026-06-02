import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useSessionStore } from '@/store/session.store';
const PAGE_SIZE = 20;
export function useNotificationPages() {
  const token = useSessionStore((s) => s.token);
  return useInfiniteQuery({
    queryKey: ['notifications'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => notificationApi.getPage(pageParam as number, PAGE_SIZE),
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
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