import {
  AccountCircle,
  Category,
  Home,
  Inventory2,
  Logout,
  Payments,
  PointOfSale,
  SwapVert,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router';

import { useAuth } from '../features/auth/useAuth';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Gestion Comercial Inteligente
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              icon={<AccountCircle />}
              label={`${user?.firstName ?? ''} - ${user?.role ?? ''}`}
              color="default"
            />
            <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Paper square elevation={1}>
        <Container maxWidth="lg">
          <Stack direction="row" spacing={1} sx={{ py: 1, overflowX: 'auto' }}>
            <Button component={RouterLink} to="/" startIcon={<Home />}>
              Inicio
            </Button>
            <Button component={RouterLink} to="/categories" startIcon={<Category />}>
              Categorias
            </Button>
            <Button component={RouterLink} to="/products" startIcon={<Inventory2 />}>
              Productos
            </Button>
            <Button component={RouterLink} to="/stock-movements" startIcon={<SwapVert />}>
              Stock
            </Button>
            <Button component={RouterLink} to="/sales" startIcon={<PointOfSale />}>
              Ventas
            </Button>
            <Button component={RouterLink} to="/expenses" startIcon={<Payments />}>
              Gastos
            </Button>
          </Stack>
        </Container>
      </Paper>
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
