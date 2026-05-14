import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useActivities } from '@/queries/activity.queries';
import { ROUTES } from '@/routes/routeConstants';
import { useUIStore } from '@/store/ui.store';

export default function ActivityPage() {
  const navigate = useNavigate();
  const { setActivityPulse } = useUIStore();
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const { data, isLoading, isFetching } = useActivities(page, pageSize);

  useEffect(() => {
    setActivityPulse(false);
  }, [setActivityPulse]);

  const activities = data?.content ?? [];

  if (isLoading) {
    return (
      <PageContainer title="Activity">
        <div className="max-w-2xl space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Activity">
      <div className="max-w-2xl space-y-4">
        {activities.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border-b px-2 py-3 transition-colors hover:bg-accent/30 last:border-0"
                onClick={() => navigate(ROUTES.ISSUE.DETAIL(activity.targetId))}>
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-medium">
                  {activity.actor.name.charAt(0)}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{activity.actor.name}</span>{' '}
                  <span className="text-muted-foreground">{activity.detail}</span>{' '}
                  <span className="font-mono text-xs text-primary">{activity.targetKey}</span>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {format(new Date(activity.createdAt), 'MMM d, yyyy - HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Page {data.page + 1} of {data.totalPages} - {data.totalElements} activities
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((current) => Math.max(0, current - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last || isFetching}
                onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
