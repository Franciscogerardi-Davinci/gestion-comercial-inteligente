import {
  AccountBalanceWallet,
  Download,
  FilterAlt,
  PointOfSale,
  Savings,
  TrendingUp,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getApiErrorMessage } from '../api/apiError';
import { EmptyTableRow } from '../components/EmptyTableRow';
import { LoadingState } from '../components/LoadingState';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import {
  downloadReport,
  getExpensesReport,
  getSalesReport,
  type ReportFilters,
} from '../features/reports/reportsApi';
import { useNotifications } from '../features/notifications/useNotifications';
import { formatDate, formatDateOnly } from '../utils/dateFormat';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const today = new Date();
const initialFilters: ReportFilters = {
  dateFrom: formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1)),
  dateTo: formatLocalDate(today),
};

export function ReportsPage() {
  const { notify } = useNotifications();
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const salesQuery = useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: () => getSalesReport(filters),
  });
  const expensesQuery = useQuery({
    queryKey: ['reports', 'expenses', filters],
    queryFn: () => getExpensesReport(filters),
  });

  const handleDownload = async (type: 'sales' | 'expenses', format: 'pdf' | 'excel') => {
    const key = `${type}-${format}`;
    setDownloading(key);
    setDownloadError(null);
    try {
      await downloadReport(type, format, filters);
      notify(`Reporte de ${type === 'sales' ? 'ventas' : 'gastos'} descargado correctamente.`);
    } catch (error) {
      const message = getApiErrorMessage(error);
      setDownloadError(message);
      notify(message, 'error');
    } finally {
      setDownloading(null);
    }
  };

  const isLoading = salesQuery.isLoading || expensesQuery.isLoading;
  const queryError = salesQuery.error ?? expensesQuery.error;

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Analice ventas, costos históricos, gastos y ganancia estimada."
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
            value={draftFilters.dateFrom}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, dateFrom: event.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Hasta"
            type="date"
            value={draftFilters.dateTo}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, dateTo: event.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
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
              setDraftFilters(initialFilters);
              setFilters(initialFilters);
            }}
          >
            Limpiar filtros
          </Button>
        </Stack>
      </Paper>

      {downloadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {downloadError}
        </Alert>
      )}
      {isLoading ? (
        <LoadingState message="Generando reportes..." />
      ) : queryError || !salesQuery.data || !expensesQuery.data ? (
        <Alert severity="error">{getApiErrorMessage(queryError)}</Alert>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            <MetricCard
              label="Ventas"
              value={currency.format(Number(salesQuery.data.summary.salesTotal))}
              icon={<PointOfSale />}
              color="#3157A4"
            />
            <MetricCard
              label="Costo histórico"
              value={currency.format(Number(salesQuery.data.summary.historicalCost))}
              icon={<TrendingUp />}
              color="#2878B5"
            />
            <MetricCard
              label="Ganancia bruta"
              value={currency.format(Number(salesQuery.data.summary.grossProfit))}
              icon={<Savings />}
              color="#1F8A5B"
            />
            <MetricCard
              label="Gastos"
              value={currency.format(Number(expensesQuery.data.summary.expensesTotal))}
              icon={<AccountBalanceWallet />}
              color="#D98524"
            />
            <MetricCard
              label="Ganancia estimada"
              value={currency.format(
                Number(salesQuery.data.summary.grossProfit) -
                  Number(expensesQuery.data.summary.expensesTotal),
              )}
              icon={<Savings />}
              color="#0F8B8D"
            />
          </Box>

          <ReportSection
            title="Ventas"
            actions={
              <>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('sales', 'pdf')}
                >
                  PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('sales', 'excel')}
                >
                  Excel
                </Button>
              </>
            }
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Venta</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Costo</TableCell>
                  <TableCell align="right">Ganancia bruta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesQuery.data.sales.length === 0 && (
                  <EmptyTableRow colSpan={6} message="No hay ventas en el período seleccionado." />
                )}
                {salesQuery.data.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>{sale.id.slice(0, 8)}</TableCell>
                    <TableCell align="right">{sale.itemCount}</TableCell>
                    <TableCell align="right">{currency.format(Number(sale.total))}</TableCell>
                    <TableCell align="right">
                      {currency.format(Number(sale.historicalCost))}
                    </TableCell>
                    <TableCell align="right">{currency.format(Number(sale.grossProfit))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportSection>

          <ReportSection
            title="Gastos"
            actions={
              <>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('expenses', 'pdf')}
                >
                  PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('expenses', 'excel')}
                >
                  Excel
                </Button>
              </>
            }
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Importe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expensesQuery.data.expenses.length === 0 && (
                  <EmptyTableRow colSpan={4} message="No hay gastos en el período seleccionado." />
                )}
                {expensesQuery.data.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDateOnly(expense.expenseDate)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">{currency.format(Number(expense.amount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ReportSection>
        </>
      )}
    </>
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ReportSection({
  title,
  actions,
  children,
}: {
  title: string;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          p: 2.5,
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={1}>
          {actions}
        </Stack>
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>{children}</TableContainer>
    </Paper>
  );
}
