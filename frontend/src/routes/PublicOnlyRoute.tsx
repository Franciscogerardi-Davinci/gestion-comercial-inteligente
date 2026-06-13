import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../features/auth/useAuth';

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
