import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/routes/routeConstants';
import { useSessionStore } from '@/store/session.store';
import { authApi } from '@/api/auth.api';
import { workspaceApi } from '@/api/workspace.api';
import { useInviteValidation } from '@/queries/invitation.queries';
import { useWorkspaceOnboarding } from '@/queries/workspace.queries';
import { getApiErrorMessage } from '@/api/apiError';
export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') ?? '';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
  const setToken = useSessionStore((state) => state.setToken);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const setCurrentRole = useSessionStore((state) => state.setCurrentRole);
  const { data: inviteValidation, isLoading: inviteLoading, error: inviteError } = useInviteValidation(
    inviteToken || undefined
  );
  const { data: onboardingStatus } = useWorkspaceOnboarding();
  const inviteEmail = inviteValidation?.email ?? '';
  const emailLocked = !!inviteToken && !!inviteValidation?.email;

  useEffect(() => {
    if (!inviteToken) return;
    if (!inviteValidation) return;
    if (inviteValidation.userExists) {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
      return;
    }
    setEmail(inviteValidation.email);
  }, [inviteToken, inviteValidation, navigate]);

  useEffect(() => {
    if (!onboardingStatus || onboardingStatus.onboardingRequired) return;
    if (!inviteToken) {
      navigate(ROUTES.APP.DASHBOARD, { replace: true });
    }
  }, [inviteToken, navigate, onboardingStatus]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      const auth = inviteToken
        ? await authApi.signupWithInvite({
            token: inviteToken,
            name: name.trim(),
            password,
          })
        : await authApi.signup({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          });
      setToken(auth.token);
      setCurrentUser(auth.user);
      if (inviteToken && inviteValidation) {
        const workspaces = await workspaceApi.getAll(auth.user.id);
        const workspace = workspaces.find((entry) => entry.id === inviteValidation.workspaceId) ?? workspaces[0] ?? null;
        setCurrentWorkspace(workspace);
        setCurrentRole(null);
        navigate(`${ROUTES.APP.DASHBOARD}?workspaceId=${encodeURIComponent(inviteValidation.workspaceId)}`, { replace: true });
        return;
      }
      navigate(ROUTES.ONBOARDING, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed'));
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-lg font-semibold">Create account</h2>
      {inviteToken && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          {inviteLoading
            ? 'Checking invitation…'
            : inviteValidation
              ? `Invitation for ${inviteValidation.workspaceName}`
              : inviteError
                ? getApiErrorMessage(inviteError, 'Invalid invitation link')
                : 'Invalid invitation link'}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={inviteToken ? inviteEmail || email : email}
          onChange={(event) => {
            if (!emailLocked) {
              setEmail(event.target.value);
            }
          }}
          readOnly={emailLocked}
          disabled={emailLocked}
          placeholder="you@company.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.AUTH.LOGIN} className="hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
