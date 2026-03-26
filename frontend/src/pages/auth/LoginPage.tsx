import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/routes/routeConstants';
import { workspaceApi } from '@/api/workspace.api';
import { authApi } from '@/api/auth.api';
import { useSessionStore } from '@/store/session.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const setCurrentRole = useSessionStore((state) => state.setCurrentRole);
  const setToken = useSessionStore((state) => state.setToken);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    const auth = await authApi.login({ email: normalizedEmail, password });
    setToken(auth.token);
    setCurrentUser(auth.user);
    const workspaces = await workspaceApi.getAll(auth.user.id);

    if (workspaces.length === 0) {
      setCurrentWorkspace(null);
      setCurrentRole(null);
      navigate(ROUTES.ONBOARDING);
      return;
    }

    setCurrentWorkspace(workspaces[0]);
    setCurrentRole(null);
    navigate(ROUTES.APP.DASHBOARD);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-lg font-semibold">Sign in</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
        Sign in
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        <Link to={ROUTES.AUTH.SIGNUP} className="hover:underline">
          Create account
        </Link>
        {' · '}
        <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="hover:underline">
          Forgot password?
        </Link>
        {' · '}
        <Link to={ROUTES.ONBOARDING} className="hover:underline">
          Create workspace
        </Link>
      </div>
    </form>
  );
}
