import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ROUTES } from '@/routes/routeConstants';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { format } from 'date-fns';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { useActivities } from '@/queries/activity.queries';
import { useSessionStore } from '@/store/session.store';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWorkspaceDashboardAccess } from '@/queries/workspace.queries';

export default function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = useSessionStore((state) => state.currentUser);
  const currentWorkspace = useSessionStore((state) => state.currentWorkspace);
  const { data: projects = [] } = useProjects();
  const { data: issues = [] } = useIssues();
  const { data: activities = [] } = useActivities();
  const { data: dashboardAccess } = useWorkspaceDashboardAccess(currentWorkspace?.id);

  const assignedIssues = issues.filter(
    (i) => i.assignee?.id === currentUser?.id && i.status !== 'done'
  );
  const recentActivities = activities.slice(0, 5);

  if (!currentWorkspace) {
    return (
      <PageContainer title="Dashboard">
        <EmptyState
          title="No workspace selected"
          description="Create a workspace or accept an invitation to access the dashboard."
          action={{ label: 'Go to onboarding', onClick: () => navigate(ROUTES.ONBOARDING) }}
        />
      </PageContainer>
    );
  }

  if (dashboardAccess && !dashboardAccess.accessible) {
    return (
      <PageContainer title="Dashboard">
        <EmptyState
          title="Workspace access required"
          description={dashboardAccess.reason}
          action={{ label: 'Go to onboarding', onClick: () => navigate(ROUTES.ONBOARDING) }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`${currentWorkspace.name} Dashboard`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-medium mb-3">Recent Projects</h2>
          <div className="space-y-2">
            {projects.map((project) => (
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
