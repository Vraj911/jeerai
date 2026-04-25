import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useIssues } from '@/queries/issue.queries';
import { ROUTES } from '@/routes/routeConstants';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import type { Issue } from '@/types/issue';
import { Skeleton } from '@/components/ui/skeleton';
export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: issues = [], isLoading } = useIssues(projectId);
  const backlogIssues = useMemo(
    () => issues.filter((issue) => issue.status !== 'done'),
    [issues]
  );
  const doneIssues = useMemo(
    () => issues.filter((issue) => issue.status === 'done'),
    [issues]
  );
  if (isLoading) {
    return (
      <PageContainer title="Backlog">
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }
  return (
    <PageContainer title="Backlog">
      <div className="grid gap-6 lg:grid-cols-2">
        <BacklogColumn
          title="Backlog"
          issues={backlogIssues}
          onIssueClick={(id) => navigate(ROUTES.ISSUE.DETAIL(id))}
        />
        <BacklogColumn
          title="Done"
          issues={doneIssues}
          onIssueClick={(id) => navigate(ROUTES.ISSUE.DETAIL(id))}
        />
      </div>
    </PageContainer>
  );
}
function BacklogColumn({
  title,
  issues,
  onIssueClick,
}: {
  title: string;
  issues: Issue[];
  onIssueClick: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border bg-secondary/20">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{issues.length} issues</span>
      </div>
      <div className="space-y-2 p-3">
        {issues.length === 0 && (
          <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No issues in {title.toLowerCase()}.
          </div>
        )}
        {issues.map((issue) => (
          <button
            key={issue.id}
            onClick={() => onIssueClick(issue.id)}
            className="flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left hover:bg-accent/40">
            <StatusIndicator status={issue.status} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{issue.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{issue.key}</div>
            </div>
            {issue.assignee && (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-[11px] font-medium">
                {issue.assignee.name.charAt(0)}
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
