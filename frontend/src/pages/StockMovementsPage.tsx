import { zodResolver } from '@hookform/resolvers/zod';
import { Add } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { getApiErrorMessage } from '../api/apiError';
import { PageHeader } from '../components/PageHeader';
import { createStockMovement, getStockMovements } from '../features/inventory/stockMovementsApi';
import { getProducts } from '../features/products/productsApi';
import { stockMovementFormSchema, type StockMovementFormValues } from '../schemas/inventorySchemas';

const movementLabels = {
  IN: 'Entrada',
  OUT: 'Salida',
  ADJUSTMENT: 'Ajuste',
} as const;

export function StockMovementsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const movementsQuery = useQuery({
    queryKey: ['stock-movements'],
    queryFn: getStockMovements,
  });
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: { productId: '', type: 'IN', quantity: '', reason: '' },
  });
  const movementType = useWatch({ control, name: 'type' });

  const createMutation = useMutation({
    mutationFn: (values: StockMovementFormValues) =>
      createStockMovement({ ...values, quantity: Number(values.quantity) }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      setDialogOpen(false);
      reset({ productId: '', type: 'IN', quantity: '', reason: '' });
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  return (
    <>
      <PageHeader
        title="Movimientos de stock"
        description="Registre entradas, salidas y ajustes manuales."
        actionLabel="Nuevo movimiento"
        actionIcon={<Add />}
        onAction={() => {
          setActionError(null);
          setDialogOpen(true);
        }}
      />
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {movementsQuery.isLoading ? (
        <CircularProgress />
      ) : movementsQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(movementsQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Anterior</TableCell>
                <TableCell align="right">Posterior</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Usuario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movementsQuery.data?.map((movement) => (
                <TableRow key={movement.id} hover>
                  <TableCell>{new Date(movement.createdAt).toLocaleString('es-AR')}</TableCell>
                  <TableCell>{movement.product.name}</TableCell>
                  <TableCell>{movementLabels[movement.type]}</TableCell>
                  <TableCell align="right">{movement.quantity}</TableCell>
                  <TableCell align="right">{movement.stockBefore}</TableCell>
                  <TableCell align="right">{movement.stockAfter}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                  <TableCell>
                    {movement.user.firstName} {movement.user.lastName}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Stack component="form" onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
          <DialogTitle>Nuevo movimiento</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {createMutation.isError && actionError && (
                <Alert severity="error">{actionError}</Alert>
              )}
              <Controller
                name="productId"
                control={control}
                render={({ field }) => (
                  <FormControl error={Boolean(errors.productId)}>
                    <InputLabel>Producto</InputLabel>
                    <Select {...field} label="Producto">
                      {productsQuery.data?.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} (stock: {product.currentStock})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Tipo</InputLabel>
                    <Select {...field} label="Tipo">
                      <MenuItem value="IN">Entrada</MenuItem>
                      <MenuItem value="OUT">Salida</MenuItem>
                      <MenuItem value="ADJUSTMENT">Ajuste</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <TextField
                label={movementType === 'ADJUSTMENT' ? 'Variacion (+/-)' : 'Cantidad'}
                type="number"
                error={Boolean(errors.quantity)}
                helperText={
                  errors.quantity?.message ??
                  (movementType === 'ADJUSTMENT'
                    ? 'Use un valor positivo para sumar o negativo para restar.'
                    : undefined)
                }
                {...register('quantity')}
              />
              <TextField
                label="Motivo"
                multiline
                rows={3}
                error={Boolean(errors.reason)}
                helperText={errors.reason?.message}
                {...register('reason')}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </>
  );
}
