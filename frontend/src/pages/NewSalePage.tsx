import { Add, Delete, ReceiptLong, ShoppingCartCheckout } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { useNotifications } from '../features/notifications/useNotifications';
import { getProducts } from '../features/products/productsApi';
import { createSale } from '../features/sales/salesApi';

interface SaleLine {
  productId: string;
  quantity: string;
}

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function NewSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const [lines, setLines] = useState<SaleLine[]>([{ productId: '', quantity: '1' }]);
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const productsById = useMemo(
    () => new Map(productsQuery.data?.map((product) => [product.id, product]) ?? []),
    [productsQuery.data],
  );
  const subtotal = lines.reduce((total, line) => {
    const product = productsById.get(line.productId);
    return total + (product ? Number(product.salePrice) * Number(line.quantity || 0) : 0);
  }, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  const saleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: async (sale) => {
      notify('Venta confirmada y stock actualizado correctamente.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
      ]);
      navigate(`/sales/${sale.id}`, { replace: true });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setFormError(message);
      notify(message, 'error');
    },
  });

  const submit = () => {
    setFormError(null);
    const selected = lines.filter((line) => line.productId);

    if (selected.length === 0) {
      setFormError('Agregue al menos un producto.');
      return;
    }
    if (new Set(selected.map((line) => line.productId)).size !== selected.length) {
      setFormError('No repita productos en la venta.');
      return;
    }
    for (const line of selected) {
      const product = productsById.get(line.productId);
      const quantity = Number(line.quantity);
      if (!product || !Number.isFinite(quantity) || quantity <= 0) {
        setFormError('Revise las cantidades ingresadas.');
        return;
      }
      if (quantity > Number(product.currentStock)) {
        setFormError(`Stock insuficiente para ${product.name}.`);
        return;
      }
    }
    if (Number(discount) < 0 || Number(discount) > subtotal) {
      setFormError('El descuento no puede ser negativo ni superar el subtotal.');
      return;
    }

    saleMutation.mutate({
      items: selected.map((line) => ({
        productId: line.productId,
        quantity: Number(line.quantity),
      })),
      discount: Number(discount || 0),
      notes: notes || null,
    });
  };

  if (productsQuery.isLoading) return <LoadingState message="Cargando productos disponibles..." />;
  if (productsQuery.isError)
    return <Alert severity="error">{getApiErrorMessage(productsQuery.error)}</Alert>;

  return (
    <>
      <PageHeader title="Nueva venta" description="Seleccione productos y cantidades." />
      <Stack spacing={3}>
        {formError && <Alert severity="error">{formError}</Alert>}
        {lines.map((line, index) => {
          const product = productsById.get(line.productId);
          const exceedsStock = product && Number(line.quantity) > Number(product.currentStock);
          return (
            <Paper
              key={index}
              sx={{
                p: 2,
                borderColor: exceedsStock ? 'error.light' : 'divider',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
                '&:hover': { boxShadow: 2 },
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: 'center' }}
              >
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={line.productId}
                    label="Producto"
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, productId: event.target.value } : item,
                        ),
                      )
                    }
                  >
                    {productsQuery.data?.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                        disabled={Number(item.currentStock) <= 0}
                      >
                        {item.name} - stock {item.currentStock} -{' '}
                        {currency.format(Number(item.salePrice))}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Cantidad"
                  type="number"
                  value={line.quantity}
                  error={Boolean(exceedsStock)}
                  helperText={exceedsStock ? `Disponible: ${product?.currentStock}` : undefined}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, quantity: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Typography sx={{ minWidth: 140, textAlign: 'right', fontWeight: 750 }}>
                  {currency.format(
                    product ? Number(product.salePrice) * Number(line.quantity || 0) : 0,
                  )}
                </Typography>
                <IconButton
                  color="error"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))
                  }
                >
                  <Delete />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setLines((current) => [...current, { productId: '', quantity: '1' }])}
          sx={{ alignSelf: 'flex-start' }}
        >
          Agregar producto
        </Button>
        <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: '#F9FBFD' }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'grid',
                  width: 42,
                  height: 42,
                  placeItems: 'center',
                  borderRadius: 2.5,
                  color: 'primary.main',
                  bgcolor: 'rgba(49,87,164,0.09)',
                }}
              >
                <ReceiptLong />
              </Box>
              <Box>
                <Typography variant="h6">Resumen de la venta</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revise los importes antes de confirmar.
                </Typography>
              </Box>
            </Stack>
            <TextField
              label="Notas"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <TextField
              label="Descuento"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>{currency.format(subtotal)}</Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6">Total</Typography>
              <Typography variant="h4" color="primary.main">
                {currency.format(total)}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartCheckout />}
              disabled={saleMutation.isPending}
              onClick={submit}
            >
              {saleMutation.isPending ? 'Confirmando...' : 'Confirmar venta'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </>
  );
}
