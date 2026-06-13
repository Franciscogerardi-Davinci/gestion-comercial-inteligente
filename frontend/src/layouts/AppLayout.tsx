import {
  AccountCircle,
  Assessment,
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
import { NavLink, Outlet, useNavigate } from 'react-router';

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
            Gestión Comercial Inteligente
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Chip
              icon={<AccountCircle />}
              label={`${user?.firstName ?? ''} - ${user?.role ?? ''}`}
              color="default"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
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
            <Button component={NavLink} to="/" end startIcon={<Home />} sx={navigationButtonSx}>
              Inicio
            </Button>
            <Button
              component={NavLink}
              to="/categories"
              startIcon={<Category />}
              sx={navigationButtonSx}
            >
              Categorías
            </Button>
            <Button
              component={NavLink}
              to="/products"
              startIcon={<Inventory2 />}
              sx={navigationButtonSx}
            >
              Productos
            </Button>
            <Button
              component={NavLink}
              to="/stock-movements"
              startIcon={<SwapVert />}
              sx={navigationButtonSx}
            >
              Stock
            </Button>
            <Button
              component={NavLink}
              to="/sales"
              startIcon={<PointOfSale />}
              sx={navigationButtonSx}
            >
              Ventas
            </Button>
            <Button
              component={NavLink}
              to="/expenses"
              startIcon={<Payments />}
              sx={navigationButtonSx}
            >
              Gastos
            </Button>
            <Button
              component={NavLink}
              to="/reports"
              startIcon={<Assessment />}
              sx={navigationButtonSx}
            >
              Reportes
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

const navigationButtonSx = {
  flexShrink: 0,
  '&.active': {
    bgcolor: 'action.selected',
    color: 'primary.main',
  },
};
