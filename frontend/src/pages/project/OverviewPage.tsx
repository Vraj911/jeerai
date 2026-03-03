import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { STATUS_LABELS } from '@/lib/constants';
import type { IssueStatus } from '@/types/issue';
import { format } from 'date-fns';
import { useProject } from '@/queries/project.queries';
import { useIssues } from '@/queries/issue.queries';
import { useProjectActivities } from '@/queries/activity.queries';

export default function OverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId ?? '');
  const { data: projectIssues = [] } = useIssues(projectId);
  const { data: activityList = [] } = useProjectActivities(projectId ?? '');
  const activities = activityList.slice(0, 5);

  if (!project) {
    return <PageContainer title="Project not found"><p className="text-sm text-muted-foreground">This project does not exist.</p></PageContainer>;
  }

  const statusCounts = (['todo', 'in-progress', 'review', 'done'] as IssueStatus[]).map(
    (status) => ({
      status,
      count: projectIssues.filter((i) => i.status === status).length,
    })
  );

  return (
    <PageContainer>
      <p className="text-sm text-muted-foreground mb-6">{project.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusCounts.map(({ status, count }) => (
          <div key={status} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground mb-1">{STATUS_LABELS[status]}</div>
            <div className="text-2xl font-semibold">{count}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-base font-medium mb-3">Recent Activity</h2>
        <div className="space-y-1">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 py-2 border-b last:border-0">
              <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium shrink-0 mt-0.5">
                {a.actor.name.charAt(0)}
              </div>
              <div className="text-sm">
                <span className="font-medium">{a.actor.name}</span>{' '}
                <span className="text-muted-foreground">{a.detail}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(a.createdAt), 'MMM d, HH:mm')}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
