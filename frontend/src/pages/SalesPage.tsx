import { Add, Visibility } from '@mui/icons-material';
import {
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { getApiErrorMessage } from '../api/apiError';
import { EmptyTableRow } from '../components/EmptyTableRow';
import { PageHeader } from '../components/PageHeader';
import { getSales } from '../features/sales/salesApi';

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export function SalesPage() {
  const navigate = useNavigate();
  const salesQuery = useQuery({ queryKey: ['sales'], queryFn: () => getSales() });

  return (
    <>
      <PageHeader
        title="Ventas"
        description="Consulte ventas confirmadas y anuladas."
        actionLabel="Nueva venta"
        actionIcon={<Add />}
        onAction={() => navigate('/sales/new')}
      />
      {salesQuery.isLoading ? (
        <CircularProgress />
      ) : salesQuery.isError ? (
        <Alert severity="error">{getApiErrorMessage(salesQuery.error)}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesQuery.data?.length === 0 && (
                <EmptyTableRow colSpan={6} message="Todavía no hay ventas registradas." />
              )}
              {salesQuery.data?.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>{new Date(sale.createdAt).toLocaleString('es-AR')}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={sale.status === 'CONFIRMED' ? 'success' : 'default'}
                      label={sale.status === 'CONFIRMED' ? 'Confirmada' : 'Anulada'}
                    />
                  </TableCell>
                  <TableCell>
                    {sale.user.firstName} {sale.user.lastName}
                  </TableCell>
                  <TableCell align="right">{sale._count.items}</TableCell>
                  <TableCell align="right">{currency.format(Number(sale.total))}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalle">
                      <IconButton onClick={() => navigate(`/sales/${sale.id}`)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
