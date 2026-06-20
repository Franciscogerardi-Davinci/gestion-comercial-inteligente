import { Prisma, SaleStatus } from '@prisma/client';

import { prisma } from '../../infrastructure/database/prisma.js';
import type { DateRangeInput } from '../../shared/schemas/date-range.schemas.js';
import { resolveDateOnlyRange, resolveDateRange } from '../../shared/utils/date-range.js';

const zero = () => new Prisma.Decimal(0);

export async function getSalesReport(businessId: string, input: DateRangeInput) {
  const range = resolveDateRange(input);
  const sales = await prisma.sale.findMany({
    where: {
      businessId,
      status: SaleStatus.CONFIRMED,
      createdAt: { gte: range.from, lte: range.to },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      subtotal: true,
      discount: true,
      total: true,
      user: { select: { firstName: true, lastName: true } },
      items: {
        select: {
          quantity: true,
          unitCost: true,
        },
      },
      _count: { select: { items: true } },
    },
  });

  const rows = sales.map((sale) => {
    const historicalCost = sale.items.reduce(
      (sum, item) => sum.plus((item.unitCost ?? zero()).mul(item.quantity)),
      zero(),
    );

    return {
      id: sale.id,
      createdAt: sale.createdAt,
      subtotal: sale.subtotal,
      discount: sale.discount,
      total: sale.total,
      historicalCost,
      grossProfit: sale.total.minus(historicalCost),
      itemCount: sale._count.items,
      user: sale.user,
    };
  });

  return {
    range: { dateFrom: range.dateFrom, dateTo: range.dateTo },
    summary: {
      salesCount: rows.length,
      salesTotal: rows.reduce((sum, row) => sum.plus(row.total), zero()),
      historicalCost: rows.reduce((sum, row) => sum.plus(row.historicalCost), zero()),
      grossProfit: rows.reduce((sum, row) => sum.plus(row.grossProfit), zero()),
    },
    sales: rows,
  };
}

export async function getExpensesReport(businessId: string, input: DateRangeInput) {
  const range = resolveDateOnlyRange(input);
  const expenses = await prisma.expense.findMany({
    where: {
      businessId,
      isActive: true,
      expenseDate: { gte: range.from, lte: range.to },
    },
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      expenseDate: true,
      category: true,
      description: true,
      amount: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return {
    range: { dateFrom: range.dateFrom, dateTo: range.dateTo },
    summary: {
      expensesCount: expenses.length,
      expensesTotal: expenses.reduce((sum, expense) => sum.plus(expense.amount), zero()),
    },
    expenses,
  };
}

export async function getProfitReport(businessId: string, input: DateRangeInput) {
  const [salesReport, expensesReport] = await Promise.all([
    getSalesReport(businessId, input),
    getExpensesReport(businessId, input),
  ]);

  return {
    range: salesReport.range,
    salesTotal: salesReport.summary.salesTotal,
    historicalCost: salesReport.summary.historicalCost,
    grossProfit: salesReport.summary.grossProfit,
    expensesTotal: expensesReport.summary.expensesTotal,
    estimatedProfit: salesReport.summary.grossProfit.minus(expensesReport.summary.expensesTotal),
    salesCount: salesReport.summary.salesCount,
    expensesCount: expensesReport.summary.expensesCount,
  };
}
