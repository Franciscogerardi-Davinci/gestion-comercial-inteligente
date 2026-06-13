import { Paper, Stack, Typography } from '@mui/material';

import { useAuth } from '../features/auth/useAuth';

export function HomePage() {
  const { user } = useAuth();

  return (
    <Paper elevation={1} sx={{ p: { xs: 3, md: 5 } }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Bienvenido, {user?.firstName}
        </Typography>
        <Typography color="text.secondary">
          Sesion activa en {user?.business.name}. Los modulos comerciales se incorporaran en las
          siguientes fases.
        </Typography>
      </Stack>
    </Paper>
  );
}
