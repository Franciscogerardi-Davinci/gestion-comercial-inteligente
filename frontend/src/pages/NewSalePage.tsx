import { Add, Delete } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
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
import { PageHeader } from '../components/PageHeader';
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['sales'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
      ]);
      navigate(`/sales/${sale.id}`, { replace: true });
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
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

  if (productsQuery.isLoading) return <CircularProgress />;
  if (productsQuery.isError)
    return <Alert severity="error">{getApiErrorMessage(productsQuery.error)}</Alert>;

  return (
    <>
      <PageHeader title="Nueva venta" description="Seleccione productos y cantidades." />
      <Stack spacing={2}>
        {formError && <Alert severity="error">{formError}</Alert>}
        {lines.map((line, index) => {
          const product = productsById.get(line.productId);
          const exceedsStock = product && Number(line.quantity) > Number(product.currentStock);
          return (
            <Paper key={index} sx={{ p: 2 }}>
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
                <Typography sx={{ minWidth: 140, textAlign: 'right' }}>
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
          startIcon={<Add />}
          onClick={() => setLines((current) => [...current, { productId: '', quantity: '1' }])}
          sx={{ alignSelf: 'flex-start' }}
        >
          Agregar producto
        </Button>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
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
            <Typography>Subtotal: {currency.format(subtotal)}</Typography>
            <Typography variant="h5">Total: {currency.format(total)}</Typography>
            <Button
              variant="contained"
              size="large"
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
