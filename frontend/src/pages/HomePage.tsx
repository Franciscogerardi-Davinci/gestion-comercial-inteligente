import { Box, Container, Paper, Stack, Typography } from '@mui/material';

export function HomePage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: { xs: 3, md: 6 } }}>
          <Stack spacing={2}>
            <Typography component="h1" variant="h3">
              Sistema de Gestion Comercial Inteligente
            </Typography>
            <Typography color="text.secondary">
              Arquitectura inicial preparada. Los modulos funcionales se incorporaran en las
              siguientes fases.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
