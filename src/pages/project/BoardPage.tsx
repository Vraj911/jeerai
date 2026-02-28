import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssues, useUpdateIssueStatus } from '@/queries/issue.queries';
import { IssueCard } from '@/features/issues/components/IssueCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { STATUS_LABELS } from '@/lib/constants';
import { ROUTES } from '@/routes/routeConstants';
import type { IssueStatus, Issue } from '@/types/issue';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const COLUMNS: IssueStatus[] = ['todo', 'in-progress', 'review', 'done'];

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: issues, isLoading } = useIssues(projectId);
  const updateStatus = useUpdateIssueStatus();
  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, issue: Issue) => {
    e.dataTransfer.setData('issueId', issue.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, status: IssueStatus) => {
      e.preventDefault();
      const issueId = e.dataTransfer.getData('issueId');
      if (issueId) {
        updateStatus.mutate({ id: issueId, status });
      }
      setDragOverColumn(null);
    },
    [updateStatus]
  );

  if (isLoading) {
    return (
      <PageContainer title="Board">
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="flex-1 min-w-[250px]">
              <Skeleton className="h-8 w-full mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Board">
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ minHeight: 'calc(100vh - 220px)' }}
      >
        {COLUMNS.map((status) => {
          const columnIssues = (issues ?? []).filter((i) => i.status === status);
          return (
            <div
              key={status}
              className={cn(
                'flex-1 min-w-[250px] max-w-[350px] flex flex-col rounded-md border bg-secondary/30',
                dragOverColumn === status && 'border-primary/50 bg-primary/5'
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium text-foreground">
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground">{columnIssues.length}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <IssueCard
                      issue={issue}
                      onClick={() => navigate(ROUTES.ISSUE.DETAIL(issue.id))}
                    />
                  </div>
                ))}
                {columnIssues.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No issues
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
