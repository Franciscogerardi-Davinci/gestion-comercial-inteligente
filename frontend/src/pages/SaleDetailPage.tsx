import { ReceiptLong } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingState } from '../components/LoadingState';
import { useNotifications } from '../features/notifications/useNotifications';
import { cancelSale, getSale } from '../features/sales/salesApi';
import { formatDateTime } from '../utils/dateFormat';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function SaleDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const saleQuery = useQuery({
    queryKey: ['sales', id],
    queryFn: () => getSale(id),
    enabled: Boolean(id),
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelSale(id),
    onSuccess: async () => {
      notify('Venta anulada y stock restaurado correctamente.');
      setConfirmCancelOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['sales', id] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
      ]);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setActionError(message);
      notify(message, 'error');
    },
  });

  if (saleQuery.isLoading) return <LoadingState message="Cargando detalle de la venta..." />;
  if (saleQuery.isError || !saleQuery.data) {
    return <Alert severity="error">{getApiErrorMessage(saleQuery.error)}</Alert>;
  }

  const sale = saleQuery.data;

  return (
    <Stack spacing={3}>
      {actionError && <Alert severity="error">{actionError}</Alert>}
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F7F9FC 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', gap: 2 }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Box
              sx={{
                display: 'grid',
                width: 50,
                height: 50,
                flexShrink: 0,
                placeItems: 'center',
                borderRadius: 3,
                color: 'primary.main',
                bgcolor: 'rgba(49,87,164,0.09)',
              }}
            >
              <ReceiptLong />
            </Box>
            <Stack spacing={1}>
              <Typography component="h1" variant="h4">
                Venta {sale.id.slice(0, 8)}
              </Typography>
              <Typography color="text.secondary">
                {formatDateTime(sale.createdAt)} - {sale.user.firstName} {sale.user.lastName}
              </Typography>
              <Chip
                sx={{ alignSelf: 'flex-start' }}
                color={sale.status === 'CONFIRMED' ? 'success' : 'default'}
                label={sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}
              />
            </Stack>
          </Stack>
          {sale.status === 'CONFIRMED' && (
            <Button
              color="error"
              variant="outlined"
              disabled={cancelMutation.isPending}
              onClick={() => setConfirmCancelOpen(true)}
            >
              {cancelMutation.isPending ? 'Anulando...' : 'Anular venta'}
            </Button>
          )}
        </Stack>
      </Paper>
      <Paper sx={{ overflow: 'hidden' }}>
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
      <Paper sx={{ p: { xs: 2.5, md: 3 }, ml: { lg: 'auto' }, width: { lg: 430 } }}>
        <Stack spacing={1.5} divider={<Divider />}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {currency.format(Number(sale.subtotal))}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography color="text.secondary">Descuento</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {currency.format(Number(sale.discount))}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h4" color="primary.main">
              {currency.format(Number(sale.total))}
            </Typography>
          </Stack>
          {sale.notes && <Typography color="text.secondary">Notas: {sale.notes}</Typography>}
        </Stack>
      </Paper>
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Anular venta"
        description="La venta quedará anulada y el stock de todos sus productos será restaurado mediante movimientos compensatorios."
        confirmLabel="Anular venta"
        pending={cancelMutation.isPending}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
      />
    </Stack>
  );
}
