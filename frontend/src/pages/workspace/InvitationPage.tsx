import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/routes/routeConstants';
import { useAcceptInvitation, useInviteValidation } from '@/queries/invitation.queries';
import { workspaceApi } from '@/api/workspace.api';
import { useSessionStore } from '@/store/session.store';
import { getApiErrorMessage } from '@/api/apiError';
export default function InvitationPage() {
  const { token: tokenParam = '' } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? tokenParam;
  const navigate = useNavigate();
  const currentUser = useSessionStore((state) => state.currentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const [name, setName] = useState(currentUser?.name ?? '');
  const { data: invitation, isLoading, error } = useInviteValidation(token || undefined);
  const acceptInvitation = useAcceptInvitation();
  const requiresName = useMemo(() => !currentUser?.id, [currentUser?.id]);

  useEffect(() => {
    if (!token) return;
    if (!isLoading && invitation && !currentUser?.id && !invitation.userExists) {
      navigate(`${ROUTES.AUTH.SIGNUP}?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, [currentUser?.id, invitation, isLoading, navigate, token]);

  const handleAccept = async (event: FormEvent) => {
    event.preventDefault();
    const accepted = await acceptInvitation.mutateAsync({
      token,
      userId: currentUser?.id,
      name: currentUser?.name || name || invitation?.email,
    });
    const workspaces = currentUser?.id ? await workspaceApi.getAll(currentUser.id) : [];
    const joinedWorkspace = workspaces.find((workspace) => workspace.id === accepted.workspaceId) ?? workspaces[0] ?? null;
    setCurrentWorkspace(joinedWorkspace);
    navigate(`${ROUTES.APP.DASHBOARD}?workspaceId=${encodeURIComponent(accepted.workspaceId)}`);
  };
  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading invitation…</div>;
  }
  if (error) {
    return <div className="p-10 text-sm text-muted-foreground">{getApiErrorMessage(error, 'Unable to validate invitation')}</div>;
  }
  if (!invitation) {
    return <div className="p-10 text-sm text-muted-foreground">Invitation not found.</div>;
  }
  const isAcceptDisabled = invitation.status !== 'PENDING' || (requiresName && !name.trim());
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</p>
                <p className="mt-1 text-sm font-medium">{invitation.workspaceName}</p>
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-medium">{invitation.status}</p>
              </div>
            </div>
            <form onSubmit={handleAccept} className="space-y-4">
              {currentUser?.id ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  You are signed in as {currentUser.email}. Accept the invitation to join this workspace.
                </div>
              ) : invitation.userExists ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                  This email already has an account. Sign in first, then return here to accept the invitation.
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Your name</Label>
                  <Input
                    id="invite-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                {currentUser?.id ? (
                  <Button type="submit" disabled={acceptInvitation.isPending || isAcceptDisabled}>
                    Accept Invitation
                  </Button>
                ) : invitation.userExists ? (
                  <Button type="button" onClick={() => navigate(ROUTES.AUTH.LOGIN)}>
                    Sign in
                  </Button>
                ) : (
                  <Button type="button" onClick={() => navigate(`${ROUTES.AUTH.SIGNUP}?token=${encodeURIComponent(token)}`)}>
                    Continue to signup
                  </Button>
                )}
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
