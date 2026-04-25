import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/pages/ErrorBoundary';
export function RootLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
