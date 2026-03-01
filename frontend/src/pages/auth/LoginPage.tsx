import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/routes/routeConstants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.APP.DASHBOARD);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Sign in</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full">Sign in</Button>
      <div className="text-center text-sm text-muted-foreground">
        <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="hover:underline">Forgot password?</Link>
        {' · '}
        <Link to={ROUTES.AUTH.SIGNUP} className="hover:underline">Create account</Link>
      </div>
    </form>
  );
}
