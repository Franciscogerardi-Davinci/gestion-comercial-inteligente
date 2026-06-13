import { Prisma, StockMovementType } from '@prisma/client';

import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { StockMovementInput } from './stock-movements.schemas.js';

export function listStockMovements(businessId: string) {
  return prisma.stockMovement.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      type: true,
      quantity: true,
      stockBefore: true,
      stockAfter: true,
      reason: true,
      createdAt: true,
      product: { select: { id: true, name: true, sku: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function createStockMovement(
  businessId: string,
  userId: string,
  input: StockMovementInput,
) {
  const quantity = new Prisma.Decimal(input.quantity);
  const delta =
    input.type === StockMovementType.OUT ? quantity.negated() : new Prisma.Decimal(input.quantity);

  return prisma.$transaction(async (transaction) => {
    const product = await transaction.product.findFirst({
      where: { id: input.productId, businessId, isActive: true },
      select: { id: true, currentStock: true },
    });

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.');
    }

    const stockAfter = product.currentStock.plus(delta);

    if (stockAfter.isNegative()) {
      throw new AppError(422, 'INSUFFICIENT_STOCK', 'El movimiento dejaria el stock en negativo.');
    }

    const updated = await transaction.product.updateMany({
      where: {
        id: product.id,
        businessId,
        isActive: true,
        currentStock: product.currentStock,
      },
      data: { currentStock: stockAfter },
    });

    if (updated.count === 0) {
      throw new AppError(
        409,
        'STOCK_CONFLICT',
        'El stock fue modificado por otra operacion. Intente nuevamente.',
      );
    }

    return transaction.stockMovement.create({
      data: {
        businessId,
        productId: product.id,
        userId,
        type: input.type,
        quantity,
        stockBefore: product.currentStock,
        stockAfter,
        reason: input.reason,
      },
      select: {
        id: true,
        type: true,
        quantity: true,
        stockBefore: true,
        stockAfter: true,
        reason: true,
        createdAt: true,
        product: { select: { id: true, name: true, sku: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  });
}
