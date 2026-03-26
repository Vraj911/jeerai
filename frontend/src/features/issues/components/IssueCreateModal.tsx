import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateIssue } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { useUsers } from '@/queries/user.queries';
import { useToast } from '@/hooks/use-toast';
import type { IssueStatus, IssuePriority } from '@/types/issue';

interface IssueCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
  fixedProjectId?: string;
  defaultStatus?: IssueStatus;
  fixedStatus?: IssueStatus;
  title?: string;
}

export function IssueCreateModal({
  open,
  onOpenChange,
  defaultProjectId,
  fixedProjectId,
  defaultStatus = 'todo',
  fixedStatus,
  title: modalTitle = 'Create Issue',
}: IssueCreateModalProps) {
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const [title, setTitle] = useState('');
  const resolvedProjectId = fixedProjectId ?? defaultProjectId ?? projects[0]?.id ?? 'proj-1';
  const resolvedStatus = fixedStatus ?? defaultStatus;
  const [projectId, setProjectId] = useState(resolvedProjectId);
  const [status, setStatus] = useState<IssueStatus>(resolvedStatus);
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [assigneeId, setAssigneeId] = useState('unassigned');
  const [labelsInput, setLabelsInput] = useState('');
  const createIssue = useCreateIssue();
  const { toast } = useToast();

  const labels = labelsInput
    .split(',')
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setProjectId(resolvedProjectId);
    setStatus(resolvedStatus);
    setPriority('medium');
    setAssigneeId('unassigned');
    setLabelsInput('');
    setTitle('');
  }, [open, resolvedProjectId, resolvedStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const assignee =
      assigneeId === 'unassigned'
        ? null
        : users.find((u) => u.id === assigneeId) ?? null;
    createIssue.mutate(
      { title, projectId, status, priority, assignee, labels },
      {
        onSuccess: () => {
          toast({ title: 'Issue created', description: title });
          setTitle('');
          setStatus(resolvedStatus);
          setPriority('medium');
          setAssigneeId('unassigned');
          setLabelsInput('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fixedProjectId ? (
              <div className="space-y-2">
                <Label>Project</Label>
                <Input value={selectedProject?.key ?? fixedProjectId} disabled className="h-8 font-mono" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {fixedStatus ? (
              <div className="space-y-2">
                <Label>Status</Label>
                <Input
                  value={
                    fixedStatus === 'todo'
                      ? 'To Do'
                      : fixedStatus === 'in-progress'
                        ? 'In Progress'
                        : fixedStatus === 'review'
                          ? 'Review'
                          : 'Done'
                  }
                  disabled
                  className="h-8"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highest">Highest</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="lowest">Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Labels</Label>
            <Input
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="frontend, bug, feature (comma-separated)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
