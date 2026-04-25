import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Link2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateWorkspace } from '@/queries/workspace.queries';
import { useSessionStore } from '@/store/session.store';
import { ROUTES } from '@/routes/routeConstants';
import { userApi } from '@/api/user.api';
function inferNameFromEmail(email?: string) {
  if (!email) return 'Workspace Owner';
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
export default function OnboardingPage() {
  const navigate = useNavigate();
  const currentUser = useSessionStore((state) => state.currentUser);
  const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const createWorkspace = useCreateWorkspace();
  const ownerName = useMemo(
    () => currentUser?.name || inferNameFromEmail(currentUser?.email),
    [currentUser?.email, currentUser?.name]
  );
  if (!currentUser?.email) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="mx-auto max-w-xl rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-semibold">Start with your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in first so the workspace can be associated with your email address.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate(ROUTES.AUTH.LOGIN)}>Go to login</Button>
          </div>
        </div>
      </div>
    );
  }
  const handleCreateWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    const workspace = await createWorkspace.mutateAsync({
      name: workspaceName,
      ownerUserId: currentUser?.id || undefined,
      ownerEmail: currentUser?.email,
      ownerName,
    });
    if (!currentUser?.id && currentUser?.email) {
      const users = await userApi.getAll();
      const resolvedUser = users.find((user) => user.email.toLowerCase() === currentUser.email?.toLowerCase()) ?? null;
      setCurrentUser(resolvedUser);
    }
    setCurrentWorkspace(workspace);
    navigate(ROUTES.APP.DASHBOARD);
  };
  const handleAcceptInvitation = () => {
    const trimmedToken = inviteToken.trim();
    if (!trimmedToken) return;
    navigate(ROUTES.INVITE(trimmedToken));
  };
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-2xl">Set up your workspace</CardTitle>
            <CardDescription>
              Create a workspace to start organizing projects, members, and issue workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  placeholder="Acme Engineering"
                />
              </div>
              <Button type="submit" disabled={createWorkspace.isPending || !workspaceName.trim()} className="gap-2">
                <Building2 className="h-4 w-4" />
                Create Workspace
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl">Have an invitation?</CardTitle>
            <CardDescription>
              Paste your invite token to review workspace details and join an existing team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-token">Invitation token</Label>
              <Input
                id="invite-token"
                value={inviteToken}
                onChange={(event) => setInviteToken(event.target.value)}
                placeholder="Paste token from invite link"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleAcceptInvitation} disabled={!inviteToken.trim()} className="gap-2">
              <Link2 className="h-4 w-4" />
              Review Invitation
            </Button>
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              Invitations are validated against the backend before you join a workspace.
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mx-auto mt-8 max-w-5xl rounded-xl border bg-card p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">No workspace yet</h2>
            <p className="text-sm text-muted-foreground">
              Users without a workspace stay in onboarding until they create one or accept an invite.
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate(ROUTES.AUTH.LOGIN)} className="gap-2">
            Back to login
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
