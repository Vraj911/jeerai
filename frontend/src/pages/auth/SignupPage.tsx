import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/routes/routeConstants';
import { useCreateWorkspace } from '@/queries/workspace.queries';
import { useSessionStore } from '@/store/session.store';
import { authApi } from '@/api/auth.api';
import { getApiErrorMessage } from '@/api/apiError';
export default function SignupPage() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const setCurrentUser = useSessionStore((state) => state.setCurrentUser);
  const setCurrentWorkspace = useSessionStore((state) => state.setCurrentWorkspace);
  const setToken = useSessionStore((state) => state.setToken);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!workspaceName.trim()) {
      setError('Workspace name is required.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Email is required.');
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
      const auth = await authApi.signup({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });
      setToken(auth.token);
      setCurrentUser(auth.user);
      const workspace = await createWorkspace.mutateAsync({
        name: workspaceName,
        ownerUserId: auth.user.id,
        ownerName: auth.user.name,
        ownerEmail: auth.user.email,
      });
      setCurrentWorkspace(workspace);
      navigate(ROUTES.APP.DASHBOARD);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed'));
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-center text-lg font-semibold">Create account</h2>
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
          placeholder="My Team"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" />
      </div>
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
        Create workspace
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
