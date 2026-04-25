import { useState } from 'react';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreateInvitation, useInvitations } from '@/queries/invitation.queries';
import { useWorkspaceMembers } from '@/queries/workspace.queries';
import { useSessionStore } from '@/store/session.store';
import type { WorkspaceRole } from '@/types/workspace';
export default function MembersPage() {
  const currentUser = useSessionStore((state) => state.currentUser);
  const currentWorkspace = useSessionStore((state) => state.currentWorkspace);
  const currentRole = useSessionStore((state) => state.currentRole);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const { data: members = [] } = useWorkspaceMembers(currentWorkspace?.id);
  const { data: invitations = [] } = useInvitations(currentWorkspace?.id);
  const createInvitation = useCreateInvitation();
  const canInvite = currentRole === 'OWNER' || currentRole === 'ADMIN';
  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentWorkspace || !currentUser) return;
    await createInvitation.mutateAsync({
      workspaceId: currentWorkspace.id,
      actorUserId: currentUser.id,
      email,
      role,
    });
    setEmail('');
    setRole('MEMBER');
  };
  return (
    <PageContainer title="Members">
      {canInvite && currentWorkspace && currentUser && (
        <div className="mb-6 rounded-md border p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Invite members</h2>
            <p className="text-sm text-muted-foreground">Owners and admins can invite teammates into this workspace.</p>
          </div>
          <form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-[1.5fr_0.8fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as WorkspaceRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createInvitation.isPending || !email.trim()}>
                Send Invite
              </Button>
            </div>
          </form>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-medium">
                      {member.user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{member.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{member.user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {canInvite && invitations.length > 0 && (
        <div className="mt-6 rounded-md border p-4">
          <h2 className="mb-3 text-sm font-semibold">Pending invitations</h2>
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {invitation.role} {'\u00b7'} {invitation.status}
                  </p>
                </div>
                <Badge variant="outline">{format(new Date(invitation.createdAt), 'MMM d, yyyy')}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
