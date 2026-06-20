import {
  AccountBalanceWallet,
  Category,
  Inventory2,
  PointOfSale,
  ReceiptLong,
  Savings,
  ShoppingCart,
  SwapVert,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { EmptyTableRow } from '../components/EmptyTableRow';
import { LoadingState } from '../components/LoadingState';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { getDashboardSummary } from '../features/dashboard/dashboardApi';
import { getProducts } from '../features/products/productsApi';
import { formatDateOnly, formatDateTime } from '../utils/dateFormat';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function HomePage() {
  const navigate = useNavigate();
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });

  if (dashboardQuery.isLoading) return <LoadingState message="Preparando el dashboard..." />;
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return <Alert severity="error">{getApiErrorMessage(dashboardQuery.error)}</Alert>;
  }

  const dashboard = dashboardQuery.data;
  const indicators = dashboard.indicators;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Indicadores del período ${formatDateOnly(dashboard.period.dateFrom)} al ${formatDateOnly(dashboard.period.dateTo)}. Actualizado ${formatDateTime(dashboard.generatedAt)}.`}
      />
      {productsQuery.data?.length === 0 && (
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            background: 'linear-gradient(135deg, rgba(49,87,164,0.08), rgba(15,139,141,0.07))',
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                Prepare su comercio en tres pasos
              </Typography>
              <Typography color="text.secondary">
                Todavía no hay productos. Complete esta configuración inicial para comenzar a
                vender.
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <FirstStep
                number="1"
                icon={<Category />}
                title="Organice categorías"
                description="Cree grupos para ordenar su catálogo."
                action="Ir a categorías"
                onClick={() => navigate('/categories')}
              />
              <FirstStep
                number="2"
                icon={<Inventory2 />}
                title="Cargue productos"
                description="Defina precios, costos y stock mínimo."
                action="Crear productos"
                onClick={() => navigate('/products')}
              />
              <FirstStep
                number="3"
                icon={<SwapVert />}
                title="Registre stock"
                description="Ingrese las existencias iniciales."
                action="Ir a stock"
                onClick={() => navigate('/stock-movements')}
              />
            </Box>
          </Stack>
        </Paper>
      )}
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
          label="Ventas del día"
          value={currency.format(Number(indicators.salesToday))}
          icon={<PointOfSale />}
          color="#3157A4"
        />
        <MetricCard
          label="Operaciones del mes"
          value={currency.format(Number(indicators.salesMonth))}
          icon={<ShoppingCart />}
          color="#2878B5"
        />
        <MetricCard
          label="Gastos del mes"
          value={currency.format(Number(indicators.expensesMonth))}
          icon={<AccountBalanceWallet />}
          color="#D98524"
        />
        <MetricCard
          label="Ganancia estimada"
          value={currency.format(Number(indicators.estimatedProfitMonth))}
          icon={<Savings />}
          color="#1F8A5B"
        />
        <MetricCard
          label="Ventas del mes"
          value={String(indicators.salesCountMonth)}
          icon={<ReceiptLong />}
          color="#0F8B8D"
        />
      </Box>

      <DashboardTable title="Productos con stock bajo">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Mínimo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dashboard.lowStockProducts.length === 0 && (
              <EmptyTableRow colSpan={4} message="No hay productos con stock bajo." />
            )}
            {dashboard.lowStockProducts.map((product) => (
              <TableRow
                key={product.id}
                hover
                onClick={() => navigate('/products')}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography color="primary.main" sx={{ fontWeight: 700 }}>
                    {product.name}
                  </Typography>
                </TableCell>
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
        <DashboardTable title="Últimas ventas">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboard.latestSales.length === 0 && (
                <EmptyTableRow colSpan={3} message="Todavía no hay ventas registradas." />
              )}
              {dashboard.latestSales.map((sale) => (
                <TableRow
                  key={sale.id}
                  hover
                  onClick={() => navigate(`/sales/${sale.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
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

        <DashboardTable title="Últimos gastos">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Importe</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboard.latestExpenses.length === 0 && (
                <EmptyTableRow colSpan={3} message="Todavía no hay gastos registrados." />
              )}
              {dashboard.latestExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDateOnly(expense.expenseDate)}</TableCell>
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

function FirstStep({
  number,
  icon,
  title,
  description,
  action,
  onClick,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <Paper sx={{ p: 2.25, bgcolor: 'rgba(255,255,255,0.82)' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              width: 38,
              height: 38,
              placeItems: 'center',
              borderRadius: 2.5,
              color: 'primary.main',
              bgcolor: 'rgba(49,87,164,0.1)',
            }}
          >
            {icon}
          </Box>
          <Typography variant="overline" color="text.secondary">
            Paso {number}
          </Typography>
        </Stack>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Button variant="text" onClick={onClick} sx={{ alignSelf: 'flex-start', px: 0 }}>
          {action}
        </Button>
      </Stack>
    </Paper>
  );
}

function DashboardTable({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ px: 2.5, pt: 2.5 }}>
          {title}
        </Typography>
        <TableContainer>{children}</TableContainer>
      </Stack>
    </Paper>
  );
}
