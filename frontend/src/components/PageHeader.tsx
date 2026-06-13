import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}

export function PageHeader(props: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 3,
      }}
    >
      <Box>
        <Typography component="h1" variant="h4">
          {props.title}
        </Typography>
        <Typography color="text.secondary">{props.description}</Typography>
      </Box>
      {props.actionLabel && props.onAction && (
        <Button variant="contained" startIcon={props.actionIcon} onClick={props.onAction}>
          {props.actionLabel}
        </Button>
      )}
    </Box>
  );
}
