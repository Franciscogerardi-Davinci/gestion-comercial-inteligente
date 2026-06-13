import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { cancelSale, getSale } from '../features/sales/salesApi';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function SaleDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const saleQuery = useQuery({
    queryKey: ['sales', id],
    queryFn: () => getSale(id),
    enabled: Boolean(id),
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelSale(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['sales', id] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
      ]);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  if (saleQuery.isLoading) return <CircularProgress />;
  if (saleQuery.isError || !saleQuery.data) {
    return <Alert severity="error">{getApiErrorMessage(saleQuery.error)}</Alert>;
  }

  const sale = saleQuery.data;

  return (
    <Stack spacing={3}>
      {actionError && <Alert severity="error">{actionError}</Alert>}
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 2 }}
        >
          <Stack spacing={1}>
            <Typography component="h1" variant="h4">
              Venta {sale.id.slice(0, 8)}
            </Typography>
            <Typography color="text.secondary">
              {new Date(sale.createdAt).toLocaleString('es-AR')} - {sale.user.firstName}{' '}
              {sale.user.lastName}
            </Typography>
            <Chip
              sx={{ alignSelf: 'flex-start' }}
              color={sale.status === 'CONFIRMED' ? 'success' : 'default'}
              label={sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}
            />
          </Stack>
          {sale.status === 'CONFIRMED' && (
            <Button
              color="error"
              variant="outlined"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    '¿Anular esta venta? El stock de todos los productos será restaurado.',
                  )
                ) {
                  cancelMutation.mutate();
                }
              }}
            >
              {cancelMutation.isPending ? 'Anulando...' : 'Anular venta'}
            </Button>
          )}
        </Stack>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Precio histórico</TableCell>
              <TableCell align="right">Costo histórico</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.productSku ?? '-'}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{currency.format(Number(item.unitPrice))}</TableCell>
                <TableCell align="right">
                  {item.unitCost ? currency.format(Number(item.unitCost)) : '-'}
                </TableCell>
                <TableCell align="right">{currency.format(Number(item.subtotal))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1} divider={<Divider />}>
          <Typography>Subtotal: {currency.format(Number(sale.subtotal))}</Typography>
          <Typography>Descuento: {currency.format(Number(sale.discount))}</Typography>
          <Typography variant="h5">Total: {currency.format(Number(sale.total))}</Typography>
          {sale.notes && <Typography color="text.secondary">Notas: {sale.notes}</Typography>}
        </Stack>
      </Paper>
    </Stack>
  );
}
