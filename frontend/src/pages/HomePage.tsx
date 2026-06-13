import {
  AccountBalanceWallet,
  PointOfSale,
  ReceiptLong,
  Savings,
  ShoppingCart,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { getApiErrorMessage } from '../api/apiError';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { getDashboardSummary } from '../features/dashboard/dashboardApi';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function HomePage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });

  if (dashboardQuery.isLoading) return <CircularProgress />;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <Alert severity="error">{getApiErrorMessage(dashboardQuery.error)}</Alert>;
  }

  const dashboard = dashboardQuery.data;
  const indicators = dashboard.indicators;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Indicadores del periodo ${dashboard.period.dateFrom} a ${dashboard.period.dateTo}.`}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <MetricCard
          label="Ventas del dia"
          value={currency.format(Number(indicators.salesToday))}
          icon={<PointOfSale color="primary" />}
        />
        <MetricCard
          label="Ventas del mes"
          value={currency.format(Number(indicators.salesMonth))}
          icon={<ShoppingCart color="primary" />}
        />
        <MetricCard
          label="Gastos del mes"
          value={currency.format(Number(indicators.expensesMonth))}
          icon={<AccountBalanceWallet color="warning" />}
        />
        <MetricCard
          label="Ganancia estimada"
          value={currency.format(Number(indicators.estimatedProfitMonth))}
          icon={<Savings color="success" />}
        />
        <MetricCard
          label="Ventas del mes"
          value={String(indicators.salesCountMonth)}
          icon={<ReceiptLong color="info" />}
        />
      </Box>

      <DashboardTable title="Productos con stock bajo">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Minimo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dashboard.lowStockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku ?? '-'}</TableCell>
                <TableCell align="right">{product.currentStock}</TableCell>
                <TableCell align="right">{product.minimumStock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardTable>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
          gap: 3,
          mt: 3,
        }}
      >
        <DashboardTable title="Ultimas ventas">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboard.latestSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{new Date(sale.createdAt).toLocaleString('es-AR')}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={sale.status === 'CONFIRMED' ? 'success' : 'default'}
                      label={sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}
                    />
                  </TableCell>
                  <TableCell align="right">{currency.format(Number(sale.total))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardTable>

        <DashboardTable title="Ultimos gastos">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Importe</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboard.latestExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.expenseDate.slice(0, 10)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell align="right">{currency.format(Number(expense.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardTable>
      </Box>
    </>
  );
}

function DashboardTable({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
          {title}
        </Typography>
        <TableContainer>{children}</TableContainer>
      </Stack>
    </Paper>
  );
}
