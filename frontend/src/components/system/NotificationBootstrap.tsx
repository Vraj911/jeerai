import { useEffect, useMemo } from 'react';
import { useNotificationPages } from '@/queries/notification.queries';
import { useNotificationStore } from '@/store/notification.store';
import { useSessionStore } from '@/store/session.store';

export function NotificationBootstrap() {
  const { data, isSuccess } = useNotificationPages();
  const flat = useMemo(
    () => (data?.pages ?? []).flatMap((p) => (Array.isArray(p.content) ? p.content : [])),
    [data?.pages]
  );
  const replaceInboxFromServer = useNotificationStore((s) => s.replaceInboxFromServer);
  const hasHydrated = useNotificationStore((s) => s.hasHydrated);
  const token = useSessionStore((s) => s.token);
  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      replaceInboxFromServer([]);
      return;
    }

    if (!isSuccess) return;

    replaceInboxFromServer(flat);
  }, [flat, hasHydrated, isSuccess, replaceInboxFromServer, token]);
  return null;
}
