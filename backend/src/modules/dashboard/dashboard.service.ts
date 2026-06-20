import { Prisma, SaleStatus } from '@prisma/client';

import { prisma } from '../../infrastructure/database/prisma.js';
import { currentDayRange, resolveDateRange } from '../../shared/utils/date-range.js';
import { getProfitReport } from '../reports/reports.service.js';

const zero = () => new Prisma.Decimal(0);

export async function getDashboardSummary(businessId: string) {
  const now = new Date();
  const monthRange = resolveDateRange({});
  const dayRange = currentDayRange();

  const [daySales, monthSales, profit, products, latestSales, latestExpenses] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        businessId,
        status: SaleStatus.CONFIRMED,
        createdAt: { gte: dayRange.from, lte: dayRange.to },
      },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: {
        businessId,
        status: SaleStatus.CONFIRMED,
        createdAt: { gte: monthRange.from, lte: monthRange.to },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    getProfitReport(businessId, {}),
    prisma.product.findMany({
      where: { businessId, isActive: true },
      orderBy: { currentStock: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
      },
    }),
    prisma.sale.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.expense.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        category: true,
        description: true,
        amount: true,
        expenseDate: true,
      },
    }),
  ]);

  return {
    generatedAt: now,
    period: profit.range,
    indicators: {
      salesToday: daySales._sum.total ?? zero(),
      salesMonth: monthSales._sum.total ?? zero(),
      expensesMonth: profit.expensesTotal,
      estimatedProfitMonth: profit.estimatedProfit,
      salesCountMonth: monthSales._count.id,
    },
    lowStockProducts: products.filter((product) =>
      product.currentStock.lessThanOrEqualTo(product.minimumStock),
    ),
    latestSales,
    latestExpenses,
  };
}
