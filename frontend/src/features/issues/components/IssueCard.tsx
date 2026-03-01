import type { Issue, IssuePriority, IssueStatus } from '@/types/issue';
import { memo, useMemo, type ComponentType } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  ChevronsDown,
  MoreHorizontal,
  Bug,
  CheckSquare,
  BookOpenText,
  Copy,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
  compact?: boolean;
  showAssignee?: boolean;
  showPriority?: boolean;
  highlight?: string;
  selected?: boolean;
  dragging?: boolean;
  onSelectChange?: (selected: boolean) => void;
  onAssignToMe?: () => void;
  onChangeStatus?: (status: IssueStatus) => void;
  onSetPriority?: (priority: IssuePriority) => void;
  onCopyIssueLink?: () => void;
}

const priorityIcons: Record<string, ComponentType<{ className?: string }>> = {
  highest: ChevronsUp,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
  lowest: ChevronsDown,
};

const priorityColorClasses: Record<string, string> = {
  highest: 'text-priority-highest',
  high: 'text-priority-high',
  medium: 'text-priority-medium',
  low: 'text-priority-low',
  lowest: 'text-priority-lowest',
};

function getIssueTypeIcon(issue: Issue): ComponentType<{ className?: string }> {
  const labels = issue.labels.join(' ').toLowerCase();
  const title = issue.title.toLowerCase();
  if (labels.includes('bug') || labels.includes('critical') || title.includes('bug')) {
    return Bug;
  }
  if (labels.includes('feature') || labels.includes('story') || title.includes('add ')) {
    return BookOpenText;
  }
  return CheckSquare;
}

function renderHighlightedTitle(title: string, query?: string) {
  if (!query?.trim()) {
    return title;
  }
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerTitle.indexOf(lowerQuery);
  if (matchIndex < 0) {
    return title;
  }

  const before = title.slice(0, matchIndex);
  const match = title.slice(matchIndex, matchIndex + lowerQuery.length);
  const after = title.slice(matchIndex + lowerQuery.length);

  return (
    <>
      {before}
      <mark className="bg-primary/15 text-foreground rounded-sm px-0.5">{match}</mark>
      {after}
    </>
  );
}

export const IssueCard = memo(function IssueCard({
  issue,
  onClick,
  compact = false,
  showAssignee = true,
  showPriority = true,
  highlight,
  selected = false,
  dragging = false,
  onSelectChange,
  onAssignToMe,
  onChangeStatus,
  onSetPriority,
  onCopyIssueLink,
}: IssueCardProps) {
  const PriorityIcon = priorityIcons[issue.priority];
  const TypeIcon = useMemo(() => getIssueTypeIcon(issue), [issue]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            'group rounded-md border bg-card px-2.5 py-2 transition-[border-color,background-color,filter] duration-200 cursor-pointer hover:border-border/90 hover:bg-secondary/30 hover:brightness-[0.995] active:brightness-95',
            compact ? 'min-h-[54px]' : 'min-h-[68px]',
            selected && 'border-primary/60 bg-primary/5',
            dragging && 'border-primary/70 bg-primary/5'
          )}
          role="button"
          tabIndex={0}
          aria-label={`Issue ${issue.key}`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onClick?.();
            }
          }}
        >
          <div className="flex items-start gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelectChange?.(Boolean(checked))}
              aria-label={`Select issue ${issue.key}`}
              onClick={(event) => event.stopPropagation()}
              className="mt-0.5"
            />
            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className={cn('text-sm text-foreground line-clamp-2 flex-1', compact && 'line-clamp-1')}>
              {renderHighlightedTitle(issue.title, highlight)}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-accent"
                  aria-label="Issue actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(event) => { event.stopPropagation(); onAssignToMe?.(); }}>
                  Assign to me
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(Object.keys(STATUS_LABELS) as IssueStatus[]).map((status) => (
                      <DropdownMenuItem key={status} onClick={() => onChangeStatus?.(status)}>
                        {STATUS_LABELS[status]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Set priority</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {(Object.keys(PRIORITY_LABELS) as IssuePriority[]).map((priority) => (
                      <DropdownMenuItem key={priority} onClick={() => onSetPriority?.(priority)}>
                        {PRIORITY_LABELS[priority]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => onCopyIssueLink?.()}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Copy issue link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
            <div className="flex items-center gap-2">
              {showPriority && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PriorityIcon className={cn('h-3.5 w-3.5', priorityColorClasses[issue.priority])} />
                  </TooltipTrigger>
                  <TooltipContent>{PRIORITY_LABELS[issue.priority]}</TooltipContent>
                </Tooltip>
              )}
              {showAssignee && issue.assignee && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-5 w-5 rounded-md">
                      <AvatarFallback className="text-[10px] rounded-md">
                        {issue.assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{issue.assignee.name}</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onAssignToMe}>Assign to me</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Change status</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {(Object.keys(STATUS_LABELS) as IssueStatus[]).map((status) => (
              <ContextMenuItem key={status} onClick={() => onChangeStatus?.(status)}>
                {STATUS_LABELS[status]}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Set priority</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {(Object.keys(PRIORITY_LABELS) as IssuePriority[]).map((priority) => (
              <ContextMenuItem key={priority} onClick={() => onSetPriority?.(priority)}>
                {PRIORITY_LABELS[priority]}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem onClick={onCopyIssueLink}>Copy issue link</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});
