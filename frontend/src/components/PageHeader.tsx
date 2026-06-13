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
        gap: 2.5,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 720 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 0.75 }}>
          {props.title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.925rem', md: '1rem' } }}>
          {props.description}
        </Typography>
      </Box>
      {props.actionLabel && props.onAction && (
        <Button
          variant="contained"
          startIcon={props.actionIcon}
          onClick={props.onAction}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {props.actionLabel}
        </Button>
      )}
    </Box>
  );
}
