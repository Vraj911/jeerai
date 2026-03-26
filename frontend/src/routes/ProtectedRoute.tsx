import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/routeConstants';
import { useSessionStore } from '@/store/session.store';

export function ProtectedRoute() {
  const location = useLocation();
  const currentUser = useSessionStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
