import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/routes/routeConstants';
import { useAcceptInvitation, useInvitation } from '@/queries/invitation.queries';
import { workspaceApi } from '@/api/workspace.api';
import { userApi } from '@/api/user.api';
import { useSessionStore } from '@/store/session.store';
import type { User } from '@/types/user';
function inferNameFromEmail(email?: string) {
  if (!email) return '';
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
export default function InvitationPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const currentUser = useSessionStore((state) => state.currentUser);
  const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const [name, setName] = useState(currentUser?.name ?? '');
  const { data: invitation, isLoading } = useInvitation(token);
  const acceptInvitation = useAcceptInvitation();
  const requiresName = useMemo(() => !currentUser?.id, [currentUser?.id]);
  const handleAccept = async (event: FormEvent) => {
    event.preventDefault();
    const accepted = await acceptInvitation.mutateAsync({
      token,
      userId: currentUser?.id,
      name: currentUser?.name || name || inferNameFromEmail(invitation?.email),
    });
    let resolvedUser = currentUser;
    if (!resolvedUser?.id) {
      const users = await userApi.getAll();
      resolvedUser = users.find((user) => user.email.toLowerCase() === accepted.email.toLowerCase()) ?? null;
      setCurrentUser(resolvedUser as User | null);
    }
    const workspaces = resolvedUser?.id ? await workspaceApi.getAll(resolvedUser.id) : [];
    const joinedWorkspace =
      workspaces.find((workspace) => workspace.id === accepted.workspaceId) ?? workspaces[0] ?? null;
    setCurrentWorkspace(joinedWorkspace);
    navigate(ROUTES.APP.DASHBOARD);
  };
  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading invitation…</div>;
  }
  if (!invitation) {
    return <div className="p-10 text-sm text-muted-foreground">Invitation not found.</div>;
  }
  const isAcceptDisabled = invitation.status !== 'PENDING' || (requiresName && !(name || inferNameFromEmail(invitation.email)).trim());
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-2xl">Workspace Invitation</CardTitle>
            <CardDescription>Review the invitation details before joining the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="mt-1 text-sm font-medium">{invitation.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                <div className="mt-1">
                  <Badge variant="secondary">{invitation.role}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge variant={invitation.status === 'PENDING' ? 'default' : 'outline'}>{invitation.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Expires</p>
                <p className="mt-1 text-sm font-medium">{new Date(invitation.expiresAt).toLocaleString()}</p>
              </div>
            </div>
            <form onSubmit={handleAccept} className="space-y-4">
              {requiresName && (
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Your name</Label>
                  <Input
                    id="invite-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={inferNameFromEmail(invitation.email) || 'Jane Doe'}
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={acceptInvitation.isPending || isAcceptDisabled}>
                  Accept Invitation
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
                  Back to login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
