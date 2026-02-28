import { PageContainer } from '@/components/layout/PageContainer';
import { mockActivities } from '@/lib/mockAdapter';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';
import { format } from 'date-fns';

export default function ActivityPage() {
  const navigate = useNavigate();

  return (
    <PageContainer title="Activity">
      <div className="max-w-2xl space-y-1">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 py-3 border-b last:border-0 hover:bg-accent/30 px-2 rounded-md cursor-pointer transition-colors"
            onClick={() => navigate(ROUTES.ISSUE.DETAIL(activity.targetId))}
          >
            <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
              {activity.actor.name.charAt(0)}
            </div>
            <div className="flex-1 text-sm">
              <span className="font-medium">{activity.actor.name}</span>{' '}
              <span className="text-muted-foreground">{activity.detail}</span>{' '}
              <span className="font-mono text-xs text-primary">{activity.targetKey}</span>
              <div className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(activity.createdAt), 'MMM d, yyyy · HH:mm')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
