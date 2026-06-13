import { zodResolver } from '@hookform/resolvers/zod';
import { Add, Delete, Edit, FilterAlt } from '@mui/icons-material';
import {
  Alert,
  Button,
  CircularProgress,
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
import { PageHeader } from '../components/PageHeader';
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
  type ExpenseFilters,
} from '../features/expenses/expensesApi';
import { expenseFormSchema, type ExpenseFormValues } from '../schemas/expenseSchemas';
import type { Expense } from '../types/commerce';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const today = new Date().toISOString().slice(0, 10);

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [draftFilters, setDraftFilters] = useState<ExpenseFilters>({});
  const [editing, setEditing] = useState<Expense | null>(null);
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
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (error) => setActionError(getApiErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    onError: (error) => setActionError(getApiErrorMessage(error)),
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
            label="Categoria"
            value={draftFilters.category ?? ''}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, category: event.target.value }))
            }
          />
          <Button
            startIcon={<FilterAlt />}
            variant="outlined"
            onClick={() => setFilters(draftFilters)}
          >
            Filtrar
          </Button>
        </Stack>
      </Paper>
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}
      {expensesQuery.isLoading ? (
        <CircularProgress />
      ) : expensesQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(expensesQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Descripcion</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Importe</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expensesQuery.data?.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>{expense.expenseDate.slice(0, 10)}</TableCell>
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
                      <IconButton
                        color="error"
                        onClick={() => {
                          if (window.confirm('¿Eliminar este gasto?'))
                            deleteMutation.mutate(expense.id);
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Stack component="form" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
          <DialogTitle>{editing ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {saveMutation.isError && actionError && <Alert severity="error">{actionError}</Alert>}
              <TextField
                label="Categoria"
                error={Boolean(errors.category)}
                helperText={errors.category?.message}
                {...register('category')}
              />
              <TextField
                label="Descripcion"
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
    </>
  );
}

function emptyExpenseForm(): ExpenseFormValues {
  return { category: '', description: '', amount: '', expenseDate: today };
}
