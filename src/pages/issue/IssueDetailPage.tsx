import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssue, useIssueComments, useUpdateIssue, useAddComment } from '@/queries/issue.queries';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import { mockUsers } from '@/lib/mockAdapter';
import type { IssueStatus, IssuePriority } from '@/types/issue';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { data: issue, isLoading } = useIssue(issueId ?? '');
  const updateIssue = useUpdateIssue();
  const addComment = useAddComment();
  const { data: comments } = useIssueComments(issueId ?? '');
  const { toast } = useToast();
  const [commentText, setCommentText] = useState('');

  if (isLoading || !issue) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-sm text-muted-foreground">{issue.key}</span>
        <StatusIndicator status={issue.status} showLabel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-foreground">{issue.title}</h1>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
            <div className="rounded-md border p-3 text-sm text-foreground min-h-[100px]">
              {issue.description || 'No description provided.'}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Comments</h3>
            <form
              className="mb-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentText.trim() || !issueId) return;
                addComment.mutate(
                  { issueId, content: commentText.trim(), authorId: mockUsers[0].id },
                  {
                    onSuccess: () => {
                      toast({ title: 'Comment added', description: 'Your comment has been posted.' });
                      setCommentText('');
                    },
                  }
                );
              }}
            >
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="mb-2"
              />
              <Button size="sm" type="submit" disabled={!commentText.trim()}>
                Add comment
              </Button>
            </form>
            <div className="space-y-3">
              {(comments ?? []).map((comment) => (
                <div key={comment.id} className="rounded-md border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium">
                      {comment.author.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              ))}
              {(!comments || comments.length === 0) && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column - metadata */}
        <div className="space-y-4">
          <div className="rounded-md border p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select
                value={issue.status}
                onValueChange={(value) =>
                  updateIssue.mutate({ id: issue.id, data: { status: value as IssueStatus } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <Select
                value={issue.priority}
                onValueChange={(value) =>
                  updateIssue.mutate({ id: issue.id, data: { priority: value as IssuePriority } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Assignee</label>
              <Select
                value={issue.assignee?.id ?? 'unassigned'}
                onValueChange={(value) => {
                  const user =
                    value === 'unassigned' ? null : mockUsers.find((u) => u.id === value) ?? null;
                  updateIssue.mutate({ id: issue.id, data: { assignee: user } });
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Labels</label>
              <div className="flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
                {issue.labels.length === 0 && (
                  <span className="text-xs text-muted-foreground">No labels</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reporter</label>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium">
                  {issue.reporter.name.charAt(0)}
                </div>
                <span className="text-sm">{issue.reporter.name}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Created</label>
              <span className="text-sm">{format(new Date(issue.createdAt), 'MMM d, yyyy')}</span>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Updated</label>
              <span className="text-sm">{format(new Date(issue.updatedAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
