import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import type { AppNotification } from '@/types/notification';
import { ROUTES } from '@/routes/routeConstants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore } from '@/store/notification.store';
import { useMarkAllNotificationsRead, useMarkNotificationRead } from '@/queries/notification.queries';
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAllRead, markRead } = useNotificationStore();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.read).length;
  const handleMarkAllRead = async () => {
    markAllRead();
    await markAllNotificationsRead.mutateAsync();
  };
  const handleRead = async (id: string) => {
    markRead(id);
    await markNotificationRead.mutateAsync(id);
  };
  return (
    <PageContainer
      title="Notifications"
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={() => void handleMarkAllRead()}>
            Mark all as read
          </Button>
        ) : undefined
      }>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <NotificationList
            items={safeNotifications}
            onRead={handleRead}
            onNavigate={(id) => navigate(ROUTES.ISSUE.DETAIL(id))}
          />
        </TabsContent>
        <TabsContent value="unread" className="mt-4">
          <NotificationList
            items={safeNotifications.filter((n) => !n.read)}
            onRead={handleRead}
            onNavigate={(id) => navigate(ROUTES.ISSUE.DETAIL(id))}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
function NotificationList({
  items,
  onRead,
  onNavigate,
}: {
  items: AppNotification[];
  onRead: (id: string) => void;
  onNavigate: (targetId: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No notifications.</p>;
  }
  return (
    <div className="space-y-px">
      {items.map((n) => (
        <div
          key={n.id}
          onClick={() => {
            onRead(n.id);
            onNavigate(n.targetId);
          }}
          className={cn(
            'flex items-start gap-3 py-3 px-3 rounded-md cursor-pointer hover:bg-accent/50 transition-[background-color,border-color,filter] duration-200 border border-transparent hover:border-border/70 hover:brightness-[0.99] active:brightness-95',
            !n.read && 'bg-primary/5'
          )}>
          {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{n.title}</p>
            <p className="text-xs text-muted-foreground truncate">{n.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(n.createdAt), 'MMM d, HH:mm')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

