import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/routes/routeConstants';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">We sent a reset link to {email}</p>
        <Link to={ROUTES.AUTH.LOGIN} className="text-sm text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-center">Reset password</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </div>
      <Button type="submit" className="w-full">Send reset link</Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link to={ROUTES.AUTH.LOGIN} className="hover:underline">Back to sign in</Link>
      </p>
    </form>
  );
}
