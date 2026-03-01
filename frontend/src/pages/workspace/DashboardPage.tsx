import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { mockIssues, mockProjects, mockActivities } from '@/lib/mockAdapter';
import { ROUTES } from '@/routes/routeConstants';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { format } from 'date-fns';

export default function DashboardPage() {
  const navigate = useNavigate();
  const assignedIssues = mockIssues.filter(
    (i) => i.assignee?.id === 'user-1' && i.status !== 'done'
  );
  const recentActivities = mockActivities.slice(0, 5);

  return (
    <PageContainer title="Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-medium mb-3">Recent Projects</h2>
          <div className="space-y-2">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(ROUTES.PROJECT.OVERVIEW(project.id))}
                className="rounded-md border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
                  <span className="text-sm font-medium">{project.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-medium mb-3">Assigned to You</h2>
          <div className="space-y-2">
            {assignedIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(ROUTES.ISSUE.DETAIL(issue.id))}
                className="rounded-md border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
                  <StatusIndicator status={issue.status} />
                </div>
                <p className="text-sm">{issue.title}</p>
              </div>
            ))}
            {assignedIssues.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No issues assigned to you.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-base font-medium mb-3">Recent Activity</h2>
          <div className="space-y-1">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                  {activity.actor.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{activity.actor.name}</span>{' '}
                  <span className="text-muted-foreground">{activity.detail}</span>{' '}
                  <span className="font-mono text-xs text-primary">{activity.targetKey}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
