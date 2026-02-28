import type { Issue } from '@/types/issue';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, ChevronsUp, ChevronsDown } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const priorityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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

export const IssueCard = memo(function IssueCard({ issue, onClick }: IssueCardProps) {
  const PriorityIcon = priorityIcons[issue.priority];

  return (
    <div
      onClick={onClick}
      className="rounded-md border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer"
    >
      <p className="text-sm text-foreground mb-2 line-clamp-2">{issue.title}</p>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{issue.key}</span>
        <div className="flex items-center gap-2">
          <PriorityIcon className={cn('h-3.5 w-3.5', priorityColorClasses[issue.priority])} />
          {issue.assignee && (
            <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              {issue.assignee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
