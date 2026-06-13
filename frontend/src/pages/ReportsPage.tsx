import { Download, FilterAlt } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import {
  downloadReport,
  getExpensesReport,
  getProfitReport,
  getSalesReport,
  type ReportFilters,
} from '../features/reports/reportsApi';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const today = new Date();
const initialFilters: ReportFilters = {
  dateFrom: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10),
  dateTo: today.toISOString().slice(0, 10),
};

export function ReportsPage() {
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
  const profitQuery = useQuery({
    queryKey: ['reports', 'profit', filters],
    queryFn: () => getProfitReport(filters),
  });

  const handleDownload = async (type: 'sales' | 'expenses', format: 'pdf' | 'excel') => {
    const key = `${type}-${format}`;
    setDownloading(key);
    setDownloadError(null);
    try {
      await downloadReport(type, format, filters);
    } catch (error) {
      setDownloadError(getApiErrorMessage(error));
    } finally {
      setDownloading(null);
    }
  };

  const isLoading = salesQuery.isLoading || expensesQuery.isLoading || profitQuery.isLoading;
  const queryError = salesQuery.error ?? expensesQuery.error ?? profitQuery.error;

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Analice ventas, costos historicos, gastos y ganancia estimada."
      />
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
          >
            Aplicar
          </Button>
        </Stack>
      </Paper>

      {downloadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {downloadError}
        </Alert>
      )}
      {isLoading ? (
        <CircularProgress />
      ) : queryError || !profitQuery.data || !salesQuery.data || !expensesQuery.data ? (
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
              value={currency.format(Number(profitQuery.data.salesTotal))}
              icon={null}
            />
            <MetricCard
              label="Costo historico"
              value={currency.format(Number(profitQuery.data.historicalCost))}
              icon={null}
            />
            <MetricCard
              label="Ganancia bruta"
              value={currency.format(Number(profitQuery.data.grossProfit))}
              icon={null}
            />
            <MetricCard
              label="Gastos"
              value={currency.format(Number(profitQuery.data.expensesTotal))}
              icon={null}
            />
            <MetricCard
              label="Ganancia estimada"
              value={currency.format(Number(profitQuery.data.estimatedProfit))}
              icon={null}
            />
          </Box>

          <ReportSection
            title="Ventas"
            actions={
              <>
                <Button
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('sales', 'pdf')}
                >
                  PDF
                </Button>
                <Button
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
                {salesQuery.data.sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.createdAt).toLocaleDateString('es-AR')}</TableCell>
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
                  startIcon={<Download />}
                  disabled={downloading !== null}
                  onClick={() => handleDownload('expenses', 'pdf')}
                >
                  PDF
                </Button>
                <Button
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
                  <TableCell>Categoria</TableCell>
                  <TableCell>Descripcion</TableCell>
                  <TableCell align="right">Importe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expensesQuery.data.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.expenseDate.slice(0, 10)}</TableCell>
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
    <Paper sx={{ mb: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ p: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row">{actions}</Stack>
      </Stack>
      <TableContainer sx={{ overflowX: 'auto' }}>{children}</TableContainer>
    </Paper>
  );
}
