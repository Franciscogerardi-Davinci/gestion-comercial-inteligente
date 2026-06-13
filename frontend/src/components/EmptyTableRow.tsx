import { InboxOutlined } from '@mui/icons-material';
import { Stack, TableCell, TableRow, Typography } from '@mui/material';

type EmptyTableRowProps = {
  colSpan: number;
  message: string;
};

export function EmptyTableRow({ colSpan, message }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
        <Stack spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
          <InboxOutlined sx={{ fontSize: 34, opacity: 0.55 }} />
          <Typography variant="body2">{message}</Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
