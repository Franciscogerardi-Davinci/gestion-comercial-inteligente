import type { SaleStatus } from './commerce';

export interface DashboardSummary {
  generatedAt: string;
  period: { dateFrom: string; dateTo: string };
  indicators: {
    salesToday: string;
    salesMonth: string;
    expensesMonth: string;
    estimatedProfitMonth: string;
    salesCountMonth: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string | null;
    currentStock: string;
    minimumStock: string;
  }>;
  latestSales: Array<{
    id: string;
    status: SaleStatus;
    total: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }>;
  latestExpenses: Array<{
    id: string;
    category: string;
    description: string;
    amount: string;
    expenseDate: string;
  }>;
}

export interface SalesReport {
  range: { dateFrom: string; dateTo: string };
  summary: {
    salesCount: number;
    salesTotal: string;
    historicalCost: string;
    grossProfit: string;
  };
  sales: Array<{
    id: string;
    createdAt: string;
    subtotal: string;
    discount: string;
    total: string;
    historicalCost: string;
    grossProfit: string;
    itemCount: number;
    user: { firstName: string; lastName: string };
  }>;
}

export interface ExpensesReport {
  range: { dateFrom: string; dateTo: string };
  summary: {
    expensesCount: number;
    expensesTotal: string;
  };
  expenses: Array<{
    id: string;
    expenseDate: string;
    category: string;
    description: string;
    amount: string;
    user: { firstName: string; lastName: string };
  }>;
}

export interface ProfitReport {
  range: { dateFrom: string; dateTo: string };
  salesTotal: string;
  historicalCost: string;
  grossProfit: string;
  expensesTotal: string;
  estimatedProfit: string;
  salesCount: number;
  expensesCount: number;
}
