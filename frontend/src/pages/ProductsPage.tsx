import { zodResolver } from '@hookform/resolvers/zod';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
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
  Tooltip,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../api/apiError';
import { PageHeader } from '../components/PageHeader';
import { getCategories } from '../features/categories/categoriesApi';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../features/products/productsApi';
import { productFormSchema, type ProductFormValues } from '../schemas/inventorySchemas';
import type { Product } from '../types/inventory';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProductForm(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: ProductFormValues) => {
      const input = {
        categoryId: values.categoryId || null,
        name: values.name,
        description: values.description || null,
        sku: values.sku || null,
        barcode: values.barcode || null,
        salePrice: Number(values.salePrice),
        costPrice: values.costPrice === '' ? null : Number(values.costPrice),
        minimumStock: Number(values.minimumStock),
      };
      return editing ? updateProduct(editing.id, input) : createProduct(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });

  const openEdit = (product: Product) => {
    setEditing(product);
    setActionError(null);
    reset({
      categoryId: product.categoryId ?? '',
      name: product.name,
      description: product.description ?? '',
      sku: product.sku ?? '',
      barcode: product.barcode ?? '',
      salePrice: product.salePrice,
      costPrice: product.costPrice ?? '',
      minimumStock: product.minimumStock,
    });
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Productos"
        description="Administre precios, categorias y niveles de stock."
        actionLabel="Nuevo producto"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setActionError(null);
          reset(emptyProductForm());
          setDialogOpen(true);
        }}
      />
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {productsQuery.isLoading ? (
        <CircularProgress />
      ) : productsQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(productsQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Minimo</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsQuery.data?.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name ?? '-'}</TableCell>
                  <TableCell>{product.sku ?? '-'}</TableCell>
                  <TableCell align="right">{currency.format(Number(product.salePrice))}</TableCell>
                  <TableCell align="right">{product.currentStock}</TableCell>
                  <TableCell align="right">{product.minimumStock}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEdit(product)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar">
                      <IconButton
                        color="error"
                        onClick={() => {
                          if (window.confirm(`¿Desactivar el producto "${product.name}"?`)) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ProductDialog
        open={dialogOpen}
        editing={editing}
        categories={categoriesQuery.data ?? []}
        control={control}
        register={register}
        errors={errors}
        pending={saveMutation.isPending}
        error={saveMutation.isError ? actionError : null}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      />
    </>
  );
}

function emptyProductForm(): ProductFormValues {
  return {
    categoryId: '',
    name: '',
    description: '',
    sku: '',
    barcode: '',
    salePrice: '',
    costPrice: '',
    minimumStock: '0',
  };
}

type ProductDialogProps = {
  open: boolean;
  editing: Product | null;
  categories: Array<{ id: string; name: string }>;
  control: ReturnType<typeof useForm<ProductFormValues>>['control'];
  register: ReturnType<typeof useForm<ProductFormValues>>['register'];
  errors: ReturnType<typeof useForm<ProductFormValues>>['formState']['errors'];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
};

function ProductDialog(props: ProductDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <Stack component="form" onSubmit={props.onSubmit}>
        <DialogTitle>{props.editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {props.error && <Alert severity="error">{props.error}</Alert>}
            <TextField
              label="Nombre"
              error={Boolean(props.errors.name)}
              helperText={props.errors.name?.message}
              {...props.register('name')}
            />
            <Controller
              name="categoryId"
              control={props.control}
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Categoria</InputLabel>
                  <Select {...field} label="Categoria">
                    <MenuItem value="">Sin categoria</MenuItem>
                    {props.categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <TextField label="Descripcion" multiline rows={2} {...props.register('description')} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField fullWidth label="SKU" {...props.register('sku')} />
              <TextField fullWidth label="Codigo de barras" {...props.register('barcode')} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Precio de venta"
                type="number"
                error={Boolean(props.errors.salePrice)}
                helperText={props.errors.salePrice?.message}
                {...props.register('salePrice')}
              />
              <TextField
                fullWidth
                label="Costo"
                type="number"
                error={Boolean(props.errors.costPrice)}
                helperText={props.errors.costPrice?.message}
                {...props.register('costPrice')}
              />
              <TextField
                fullWidth
                label="Stock minimo"
                type="number"
                error={Boolean(props.errors.minimumStock)}
                helperText={props.errors.minimumStock?.message}
                {...props.register('minimumStock')}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={props.pending}>
            {props.pending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
