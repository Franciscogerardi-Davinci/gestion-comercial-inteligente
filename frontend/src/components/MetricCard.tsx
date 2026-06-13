import { alpha, Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  color?: string;
}

export function MetricCard({ label, value, icon, color = '#3157A4' }: MetricCardProps) {
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 90,
          height: 90,
          borderRadius: '50%',
          bgcolor: alpha(color, 0.07),
          right: -30,
          top: -34,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', position: 'relative', zIndex: 1 }}
      >
        {icon && (
          <Box
            sx={{
              display: 'grid',
              width: 46,
              height: 46,
              flexShrink: 0,
              placeItems: 'center',
              borderRadius: 3,
              color,
              bgcolor: alpha(color, 0.1),
              '& svg': { fontSize: 24 },
            }}
          >
            {icon}
          </Box>
        )}
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 650 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
