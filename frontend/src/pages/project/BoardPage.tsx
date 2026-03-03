import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useIssues,
  useUpdateIssueStatus,
  useCreateIssue,
  useUpdateIssue,
} from '@/queries/issue.queries';
import { IssueCard } from '@/features/issues/components/IssueCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { STATUS_LABELS } from '@/lib/constants';
import { ROUTES } from '@/routes/routeConstants';
import type { IssueStatus, Issue, IssuePriority } from '@/types/issue';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useUsers } from '@/queries/user.queries';
import { BoardControlBar, type BoardViewSettings, type QuickFiltersState } from '@/pages/project/components/BoardControlBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/store/ui.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

const COLUMNS: IssueStatus[] = ['todo', 'in-progress', 'review', 'done'];
const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: issues, isLoading } = useIssues(projectId);
  const updateStatus = useUpdateIssueStatus();
  const createIssue = useCreateIssue();
  const updateIssue = useUpdateIssue();
  const { data: users = [] } = useUsers();

  const [dragOverColumn, setDragOverColumn] = useState<IssueStatus | null>(null);
  const [draggingIssueId, setDraggingIssueId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [quickFilters, setQuickFilters] = useState<QuickFiltersState>({
    myIssues: false,
    recentlyUpdated: false,
    highPriority: false,
  });
  const [groupBy, setGroupBy] = useState<'none' | 'assignee' | 'priority'>('none');
  const [viewSettings, setViewSettings] = useState<BoardViewSettings>({
    compactCards: false,
    showAssignee: true,
    showPriority: true,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inlineCreate, setInlineCreate] = useState<{ status: IssueStatus | null; title: string }>({
    status: null,
    title: '',
  });

  const { collapsedBoardColumns, toggleBoardColumnCollapsed } = useUIStore();

  const derivedIssues = useMemo(() => {
    const currentUserId = users[0]?.id ?? 'user-1';
    const now = Date.now();
    const query = debouncedSearch.trim().toLowerCase();

    return (issues ?? []).filter((issue) => {
      if (query && !issue.title.toLowerCase().includes(query) && !issue.key.toLowerCase().includes(query)) {
        return false;
      }
      if (quickFilters.myIssues && issue.assignee?.id !== currentUserId) {
        return false;
      }
      if (
        quickFilters.recentlyUpdated &&
        now - new Date(issue.updatedAt).getTime() > RECENT_WINDOW_MS
      ) {
        return false;
      }
      if (quickFilters.highPriority && !['highest', 'high'].includes(issue.priority)) {
        return false;
      }
      return true;
    });
  }, [debouncedSearch, issues, quickFilters, users]);

  const handleDragStart = useCallback((e: React.DragEvent, issue: Issue) => {
    e.dataTransfer.setData('issueId', issue.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingIssueId(issue.id);
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
      setDraggingIssueId(null);
    },
    [updateStatus]
  );

  const handleInlineCreate = (status: IssueStatus) => {
    const title = inlineCreate.title.trim();
    if (!title || !projectId) return;
    createIssue.mutate(
      {
        title,
        status,
        projectId,
        priority: 'medium',
        assignee: null,
      },
      {
        onSuccess: () => {
          toast({ title: 'Issue created', description: `Added "${title}"` });
          setInlineCreate({ status: null, title: '' });
        },
      }
    );
  };

  const updateIssueField = (issue: Issue, data: Partial<Issue>) => {
    updateIssue.mutate({ id: issue.id, data });
  };

  if (isLoading) {
    return (
      <PageContainer title="Board">
        <div className="mb-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="flex-1 min-w-[250px]">
              <Skeleton className="h-8 w-full mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
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
      <BoardControlBar
        search={search}
        onSearchChange={setSearch}
        quickFilters={quickFilters}
        onQuickFiltersChange={setQuickFilters}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        viewSettings={viewSettings}
        onViewSettingsChange={setViewSettings}
      />
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ minHeight: 'calc(100vh - 260px)' }}
      >
        {COLUMNS.map((status) => {
          const columnIssues = derivedIssues.filter((i) => i.status === status);
          const collapsed = Boolean(collapsedBoardColumns[status]);

          return (
            <div
              key={status}
              className={cn(
                'flex flex-col rounded-md border bg-secondary/30 transition-[width,border-color,background-color] duration-200',
                collapsed ? 'w-12 min-w-[48px]' : 'flex-1 min-w-[250px] max-w-[360px]',
                dragOverColumn === status && !collapsed && 'border-primary/50 bg-primary/5'
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b">
                {collapsed ? (
                  <button
                    onClick={() => toggleBoardColumnCollapsed(status)}
                    className="mx-auto text-[11px] tracking-wide text-muted-foreground rotate-180 [writing-mode:vertical-rl]"
                    aria-label={`Expand ${STATUS_LABELS[status]} column`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="text-xs text-muted-foreground">{columnIssues.length}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-6 w-6 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleBoardColumnCollapsed(status)}>
                          Collapse column
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast({
                              title: 'Move all issues',
                              description: `${columnIssues.length} issues selected for move (mock).`,
                            });
                          }}
                        >
                          Move all issues
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>Configure column</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {dragOverColumn === status && (
                    <div className="h-10 rounded-md border border-dashed border-primary/60 bg-primary/5 transition-colors duration-150" />
                  )}
                  {columnIssues.map((issue) => (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue)}
                      onDragEnd={() => setDraggingIssueId(null)}
                      className="cursor-grab active:cursor-grabbing transition-transform duration-200"
                    >
                      <IssueCard
                        issue={issue}
                        compact={viewSettings.compactCards}
                        showAssignee={viewSettings.showAssignee}
                        showPriority={viewSettings.showPriority}
                        highlight={debouncedSearch}
                        selected={selectedIds.has(issue.id)}
                        dragging={draggingIssueId === issue.id}
                        onSelectChange={(checked) =>
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(issue.id);
                            else next.delete(issue.id);
                            return next;
                          })
                        }
                        onClick={() => navigate(ROUTES.ISSUE.DETAIL(issue.id))}
                        onAssignToMe={() => updateIssueField(issue, { assignee: users[0] ?? null })}
                        onChangeStatus={(nextStatus) => updateStatus.mutate({ id: issue.id, status: nextStatus })}
                        onSetPriority={(priority: IssuePriority) => updateIssueField(issue, { priority })}
                        onCopyIssueLink={async () => {
                          const link = `${window.location.origin}${ROUTES.ISSUE.DETAIL(issue.id)}`;
                          await navigator.clipboard.writeText(link);
                          toast({ title: 'Link copied', description: issue.key });
                        }}
                      />
                    </div>
                  ))}
                  {columnIssues.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                      No issues
                    </div>
                  )}

                  {inlineCreate.status === status ? (
                    <div className="rounded-md border bg-card p-2">
                      <Input
                        autoFocus
                        value={inlineCreate.title}
                        onChange={(e) => setInlineCreate({ status, title: e.target.value })}
                        placeholder="Issue title"
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleInlineCreate(status);
                          }
                          if (e.key === 'Escape') {
                            setInlineCreate({ status: null, title: '' });
                          }
                        }}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleInlineCreate(status)}>
                          Create
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setInlineCreate({ status: null, title: '' })}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInlineCreate({ status, title: '' })}
                      className="w-full h-8 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-border/80 flex items-center justify-center gap-1 transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                      + Create
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

