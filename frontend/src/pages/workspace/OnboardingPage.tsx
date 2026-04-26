import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateWorkspace, useWorkspaceOnboarding } from '@/queries/workspace.queries';
import { useSessionStore } from '@/store/session.store';
import { ROUTES } from '@/routes/routeConstants';
import { getApiErrorMessage } from '@/api/apiError';

function extractInviteToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://placeholder.local${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    const url = new URL(normalized);
    const tokenFromQuery = url.searchParams.get('token');
    if (tokenFromQuery) return tokenFromQuery;
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? trimmed;
  } catch {
    return trimmed;
  }
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const currentUser = useSessionStore((state) => state.currentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');
  const createWorkspace = useCreateWorkspace();
  const { data: onboardingStatus, isLoading: onboardingLoading } = useWorkspaceOnboarding();

  useEffect(() => {
    if (!currentUser?.email) {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [currentUser?.email, navigate]);

  useEffect(() => {
    if (onboardingLoading) return;
    if (onboardingStatus && !onboardingStatus.onboardingRequired) {
      navigate(ROUTES.APP.DASHBOARD, { replace: true });
    }
  }, [navigate, onboardingLoading, onboardingStatus]);

  if (!currentUser?.email) {
    return null;
  }

  const handleCreateWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const workspace = await createWorkspace.mutateAsync({
        name: workspaceName,
      });
      setCurrentWorkspace(workspace);
      navigate(`${ROUTES.APP.DASHBOARD}?workspaceId=${encodeURIComponent(workspace.id)}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Workspace creation failed'));
    }
  };

  const handleOpenInvite = () => {
    const token = extractInviteToken(inviteLink);
    if (!token) return;
    navigate(ROUTES.INVITE_WITH_TOKEN(token));
  };
  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-2xl">Create your first workspace</CardTitle>
            <CardDescription>
              Workspaces keep projects and issues organized.
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={createWorkspace.isPending || !workspaceName.trim()}>
                Create workspace
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-2xl">Have an invite?</CardTitle>
            <CardDescription>
              Paste an invite link or token to join the workspace instead of creating a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Invite link or token</Label>
              <Input
                id="invite-link"
                value={inviteLink}
                onChange={(event) => setInviteLink(event.target.value)}
                placeholder="Paste invite link or token"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleOpenInvite} disabled={!inviteLink.trim()}>
              Open invitation
            </Button>
            <p className="text-sm text-muted-foreground">
              If the invite belongs to your email, you can accept it after signing in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
