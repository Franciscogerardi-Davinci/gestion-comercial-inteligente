import { zodResolver } from '@hookform/resolvers/zod';
import { Add, Delete, Edit, FilterAlt } from '@mui/icons-material';
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
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
  type ExpenseFilters,
} from '../features/expenses/expensesApi';
import { useNotifications } from '../features/notifications/useNotifications';
import { expenseFormSchema, type ExpenseFormValues } from '../schemas/expenseSchemas';
import type { Expense } from '../types/commerce';
import { formatDateOnly } from '../utils/dateFormat';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const today = formatLocalDate(new Date());

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [draftFilters, setDraftFilters] = useState<ExpenseFilters>({});
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const expensesQuery = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
  });
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: emptyExpenseForm(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: ExpenseFormValues) => {
      const input = { ...values, amount: Number(values.amount) };
      return editing ? updateExpense(editing.id, input) : createExpense(input);
    },
    onSuccess: async () => {
      notify(editing ? 'Gasto actualizado correctamente.' : 'Gasto creado correctamente.');
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setActionError(message);
      notify(message, 'error');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: async () => {
      notify('Gasto eliminado correctamente.');
      setExpenseToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      setActionError(message);
      notify(message, 'error');
    },
  });

  const openEdit = (expense: Expense) => {
    setEditing(expense);
    setActionError(null);
    reset({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.expenseDate.slice(0, 10),
    });
    setDialogOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Gastos"
        description="Registre y filtre los egresos del comercio."
        actionLabel="Nuevo gasto"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setActionError(null);
          reset(emptyExpenseForm());
          setDialogOpen(true);
        }}
      />
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' } }}
        >
          <TextField
            label="Desde"
            type="date"
            value={draftFilters.dateFrom ?? ''}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, dateFrom: event.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Hasta"
            type="date"
            value={draftFilters.dateTo ?? ''}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, dateTo: event.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Categoría"
            value={draftFilters.category ?? ''}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, category: event.target.value }))
            }
          />
          <Button
            startIcon={<FilterAlt />}
            variant="contained"
            onClick={() => setFilters(draftFilters)}
            sx={{ ml: { md: 'auto' } }}
          >
            Aplicar filtros
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setDraftFilters({});
              setFilters({});
            }}
          >
            Limpiar filtros
          </Button>
        </Stack>
      </Paper>
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {expensesQuery.isLoading ? (
        <LoadingState message="Cargando gastos..." />
      ) : expensesQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(expensesQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Importe</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expensesQuery.data?.length === 0 && (
                <EmptyTableRow
                  colSpan={6}
                  message="No hay gastos para los filtros seleccionados."
                />
              )}
              {expensesQuery.data?.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{formatDateOnly(expense.expenseDate)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.user.firstName} {expense.user.lastName}
                  </TableCell>
                  <TableCell align="right">{currency.format(Number(expense.amount))}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => openEdit(expense)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => setExpenseToDelete(expense)}>
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
          <DialogTitle>{editing ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {saveMutation.isError && actionError && <Alert severity="error">{actionError}</Alert>}
              <TextField
                label="Categoría"
                error={Boolean(errors.category)}
                helperText={errors.category?.message}
                {...register('category')}
              />
              <TextField
                label="Descripción"
                multiline
                rows={3}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                {...register('description')}
              />
              <TextField
                label="Importe"
                type="number"
                error={Boolean(errors.amount)}
                helperText={errors.amount?.message}
                {...register('amount')}
              />
              <TextField
                label="Fecha"
                type="date"
                error={Boolean(errors.expenseDate)}
                helperText={errors.expenseDate?.message}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('expenseDate')}
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
        open={Boolean(expenseToDelete)}
        title="Eliminar gasto"
        description={`Se eliminará el gasto "${expenseToDelete?.description ?? ''}" de los reportes activos. Esta acción no afecta ventas ni stock.`}
        confirmLabel="Eliminar"
        pending={deleteMutation.isPending}
        onCancel={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) deleteMutation.mutate(expenseToDelete.id);
        }}
      />
    </>
  );
}

function emptyExpenseForm(): ExpenseFormValues {
  return { category: '', description: '', amount: '', expenseDate: today };
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
