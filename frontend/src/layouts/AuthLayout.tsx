import { Assessment, Inventory2, PointOfSale, Storefront } from '@mui/icons-material';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router';

const highlights = [
  { icon: <PointOfSale />, label: 'Ventas y gastos centralizados' },
  { icon: <Inventory2 />, label: 'Control de productos y stock' },
  { icon: <Assessment />, label: 'Indicadores y reportes exportables' },
];

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: { xs: 2, md: 4 },
        background:
          'radial-gradient(circle at 10% 15%, rgba(98,195,196,0.22), transparent 28%), linear-gradient(135deg, #172A4D 0%, #3157A4 58%, #243E72 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(420px, 0.95fr)' },
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 30px 90px rgba(8, 20, 42, 0.3)',
          }}
        >
          <Stack
            spacing={4}
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              p: { md: 6, lg: 8 },
              color: 'white',
              background: 'linear-gradient(145deg, rgba(23,42,77,0.98), rgba(38,69,123,0.94))',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                width: 54,
                height: 54,
                placeItems: 'center',
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Storefront fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ maxWidth: 520, mb: 2 }}>
                Gestión Comercial Inteligente
              </Typography>
              <Typography
                sx={{ maxWidth: 500, color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem' }}
              >
                Una visión clara de su comercio para tomar mejores decisiones todos los días.
              </Typography>
            </Box>
            <Stack spacing={2}>
              {highlights.map((item) => (
                <Stack key={item.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'grid',
                      width: 38,
                      height: 38,
                      placeItems: 'center',
                      borderRadius: 2.5,
                      color: '#8EDCDD',
                      bgcolor: 'rgba(98,195,196,0.12)',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography color="rgba(255,255,255,0.82)">{item.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack sx={{ justifyContent: 'center', p: { xs: 3, sm: 5, md: 6 }, minHeight: 580 }}>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{ display: { md: 'none' }, alignItems: 'center', mb: 4 }}
            >
              <Box
                sx={{
                  display: 'grid',
                  width: 42,
                  height: 42,
                  placeItems: 'center',
                  borderRadius: 3,
                  color: 'white',
                  bgcolor: 'primary.main',
                }}
              >
                <Storefront />
              </Box>
              <Typography variant="h6">Gestión Comercial</Typography>
            </Stack>
            <Outlet />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
