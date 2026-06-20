import {
  AccountCircle,
  Assessment,
  Category,
  Home,
  Inventory2,
  Logout,
  Menu as MenuIcon,
  Payments,
  PointOfSale,
  Storefront,
  SwapVert,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { useAuth } from '../features/auth/useAuth';
import { useNotifications } from '../features/notifications/useNotifications';

const drawerWidth = 264;

const navigation: Array<{ label: string; to: string; icon: ReactNode; end?: boolean }> = [
  { label: 'Dashboard', to: '/', icon: <Home />, end: true },
  { label: 'Categorías', to: '/categories', icon: <Category /> },
  { label: 'Productos', to: '/products', icon: <Inventory2 /> },
  { label: 'Movimientos de stock', to: '/stock-movements', icon: <SwapVert /> },
  { label: 'Ventas', to: '/sales', icon: <PointOfSale /> },
  { label: 'Gastos', to: '/expenses', icon: <Payments /> },
  { label: 'Reportes', to: '/reports', icon: <Assessment /> },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      notify('Sesión cerrada correctamente.');
      navigate('/login', { replace: true });
    } catch (error) {
      notify(getApiErrorMessage(error), 'error');
      navigate('/login', { replace: true });
    }
  };

  const drawer = (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            width: 42,
            height: 42,
            flexShrink: 0,
            placeItems: 'center',
            borderRadius: 3,
            color: 'white',
            background: 'linear-gradient(135deg, #5D7BC0 0%, #3157A4 100%)',
            boxShadow: '0 8px 20px rgba(49, 87, 164, 0.3)',
          }}
        >
          <Storefront />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" color="white" noWrap sx={{ fontWeight: 800 }}>
            Gestión Comercial
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.62)' }}>
            Panel inteligente
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.09)', mx: 2 }} />
      <Typography
        variant="overline"
        sx={{ px: 3, pt: 2.5, pb: 1, color: 'rgba(255,255,255,0.45)', fontWeight: 750 }}
      >
        Navegación
      </Typography>
      <List sx={{ px: 1.5, py: 0 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              minHeight: 46,
              mb: 0.5,
              borderRadius: 2.5,
              color: 'rgba(255,255,255,0.72)',
              '& .MuiListItemIcon-root': { color: 'inherit' },
              '&:hover': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.08)',
              },
              '&.active': {
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.13)',
                boxShadow: 'inset 3px 0 0 #62C3C4',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 650 } } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: 'center',
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.07)',
          }}
        >
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'secondary.main', fontSize: '0.9rem' }}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" color="white" noWrap sx={{ fontWeight: 700 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.58)' }}>
              {user?.role}
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: 'rgba(255,255,255,0.72)' }}
            >
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'rgba(255,255,255,0.88)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          <IconButton
            aria-label="Abrir navegación"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.business.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
              Panel de gestión
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <AccountCircle color="primary" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, ml: 1 }}
            >
              Salir
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': drawerPaperSx,
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          pt: { xs: '88px', md: '104px' },
          px: { xs: 2, sm: 3, lg: 4 },
          pb: 5,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1500, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

const drawerPaperSx = {
  width: drawerWidth,
  border: 0,
  color: 'white',
  background: 'linear-gradient(180deg, #172A4D 0%, #1E365F 58%, #172A4D 100%)',
  boxShadow: '8px 0 30px rgba(16, 24, 40, 0.08)',
};
