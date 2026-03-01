import { Outlet } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground mt-1">Enterprise Project Management</p>
        </div>
        <div className="rounded-md border bg-card p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
