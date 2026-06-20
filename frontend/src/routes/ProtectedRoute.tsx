import { Box } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../features/auth/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <LoadingState message="Restaurando sesión..." />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
