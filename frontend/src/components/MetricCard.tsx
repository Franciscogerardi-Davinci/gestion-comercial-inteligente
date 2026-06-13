import { Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        {icon}
        <Stack>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
