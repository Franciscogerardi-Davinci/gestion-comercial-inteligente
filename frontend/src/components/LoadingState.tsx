import { Box, CircularProgress, Stack, Typography } from '@mui/material';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Cargando información...' }: LoadingStateProps) {
  return (
    <Box sx={{ display: 'grid', minHeight: 280, placeItems: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={34} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}
