import { Box, Container, Paper, Typography } from '@mui/material';
import { Outlet } from 'react-router';

export function AuthLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }} gutterBottom>
          Gestión Comercial Inteligente
        </Typography>
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 } }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
