import { zodResolver } from '@hookform/resolvers/zod';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../api/apiError';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyTableRow } from '../components/EmptyTableRow';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../features/categories/categoriesApi';
import { useNotifications } from '../features/notifications/useNotifications';
import { categoryFormSchema, type CategoryFormValues } from '../schemas/inventorySchemas';
import type { Category } from '../types/inventory';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [editing, setEditing] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '' },
  });

  const saveMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      editing ? updateCategory(editing.id, values) : createCategory(values),
    onSuccess: async () => {
      notify(editing ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      setEditing(null);
      reset();
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setActionError(message);
      notify(message, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      notify('Categoría desactivada correctamente.');
      setCategoryToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setActionError(message);
      notify(message, 'error');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setActionError(null);
    reset({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setActionError(null);
    reset({ name: category.name, description: category.description ?? '' });
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Categorías"
        description="Organice el catálogo de productos."
        actionLabel="Nueva categoría"
        actionIcon={<Add />}
        onAction={openCreate}
      />
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {categoriesQuery.isLoading ? (
        <LoadingState message="Cargando categorías..." />
      ) : categoriesQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(categoriesQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Productos</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categoriesQuery.data?.length === 0 && (
                <EmptyTableRow colSpan={4} message="Todavía no hay categorías registradas." />
              )}
              {categoriesQuery.data?.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell align="right">{category._count?.products ?? 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEdit(category)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar">
                      <IconButton color="error" onClick={() => setCategoryToDelete(category)}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Stack component="form" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
          <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {saveMutation.isError && actionError && <Alert severity="error">{actionError}</Alert>}
              <TextField
                label="Nombre"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                {...register('name')}
              />
              <TextField
                label="Descripción"
                multiline
                rows={3}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                {...register('description')}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Desactivar categoría"
        description={`La categoría "${categoryToDelete?.name ?? ''}" dejará de estar disponible. Esta acción solo es posible si no tiene productos activos.`}
        confirmLabel="Desactivar"
        pending={deleteMutation.isPending}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) deleteMutation.mutate(categoryToDelete.id);
        }}
      />
    </>
  );
}
