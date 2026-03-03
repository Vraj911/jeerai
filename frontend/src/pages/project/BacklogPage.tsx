import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useIssues } from '@/queries/issue.queries';
import { useSprints } from '@/queries/sprint.queries';
import { ROUTES } from '@/routes/routeConstants';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types/issue';
import { Skeleton } from '@/components/ui/skeleton';

export default function BacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: issues = [], isLoading } = useIssues(projectId);
  const { data: sprints = [] } = useSprints(projectId);

  if (isLoading) {
    return (
      <PageContainer title="Backlog">
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  const groups = [
    ...sprints.map((s) => ({
      id: s.id,
      label: `${s.name}${s.isActive ? ' (Active)' : ''}`,
      issues: issues.filter((i) => i.sprintId === s.id),
    })),
    {
      id: 'no-sprint',
      label: 'Backlog',
      issues: issues.filter((i) => !i.sprintId),
    },
  ];

  return (
    <PageContainer title="Backlog">
      <div className="space-y-2">
        {groups.map((group) => (
          <BacklogGroup
            key={group.id}
            label={group.label}
            issues={group.issues}
            onIssueClick={(id) => navigate(ROUTES.ISSUE.DETAIL(id))}
          />
        ))}
      </div>
    </PageContainer>
  );
}

function BacklogGroup({
  label,
  issues,
  onIssueClick,
}: {
  label: string;
  issues: Issue[];
  onIssueClick: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 34;
  const viewportHeight = 280;
  const overscan = 6;

  const windowed = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
    const end = Math.min(issues.length, start + visibleCount);
    return {
      start,
      end,
      visible: issues.slice(start, end),
      topSpacer: start * rowHeight,
      bottomSpacer: Math.max(0, (issues.length - end) * rowHeight),
    };
  }, [issues, scrollTop]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 px-3 rounded-md hover:bg-accent/50 text-sm font-medium">
        <ChevronRight className={cn('h-4 w-4 transition-transform', open && 'rotate-90')} />
        {label}
        <span className="text-xs text-muted-foreground ml-auto">{issues.length} issues</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className="ml-6 space-y-px max-h-[280px] overflow-auto"
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div style={{ height: windowed.topSpacer }} />
          {windowed.visible.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onIssueClick(issue.id)}
              className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer text-sm"
            >
              <StatusIndicator status={issue.status} />
              <span className="font-mono text-xs text-muted-foreground w-20">{issue.key}</span>
              <span className="flex-1 truncate">{issue.title}</span>
              {issue.assignee && (
                <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium">
                  {issue.assignee.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
          <div style={{ height: windowed.bottomSpacer }} />
          {issues.length === 0 && (
            <p className="text-xs text-muted-foreground py-3 px-2">No issues in this group.</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
