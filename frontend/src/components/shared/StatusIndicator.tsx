import { cn } from '@/lib/utils';
import { STATUS_LABELS } from '@/lib/constants';
import type { IssueStatus } from '@/types/issue';

interface StatusIndicatorProps {
  status: IssueStatus;
  showLabel?: boolean;
}

const statusColorClasses: Record<IssueStatus, string> = {
  todo: 'bg-status-todo',
  'in-progress': 'bg-status-in-progress',
  review: 'bg-status-review',
  done: 'bg-status-done',
};

export function StatusIndicator({ status, showLabel }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-full', statusColorClasses[status])} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</span>
      )}
    </div>
  );
}
