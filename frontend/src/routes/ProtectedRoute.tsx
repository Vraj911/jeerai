import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';
import { useSessionStore } from '@/store/session.store';
export function ProtectedRoute() {
  const location = useLocation();
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const currentUser = useSessionStore((state) => state.currentUser);
  const token = useSessionStore((state) => state.token);
  if (!hasHydrated) {
    return null;
  }
  if (!token || !currentUser) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace state={{ from: location }} />;
  }
  return <Outlet />;
}
