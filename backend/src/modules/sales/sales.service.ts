import { Prisma, SaleStatus, StockMovementType } from '@prisma/client';

import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import { resolveOptionalDateRange } from '../../shared/utils/date-range.js';
import type { CreateSaleInput, ListSalesInput } from './sales.schemas.js';

const saleDetailSelect = {
  id: true,
  status: true,
  subtotal: true,
  discount: true,
  total: true,
  notes: true,
  confirmedAt: true,
  cancelledAt: true,
  createdAt: true,
  user: { select: { id: true, firstName: true, lastName: true } },
  items: {
    orderBy: { productName: 'asc' as const },
    select: {
      id: true,
      productId: true,
      productName: true,
      productSku: true,
      quantity: true,
      unitPrice: true,
      unitCost: true,
      discount: true,
      subtotal: true,
    },
  },
} as const;

export function listSales(businessId: string, filters: ListSalesInput) {
  const createdAt = resolveOptionalDateRange(filters);

  return prisma.sale.findMany({
    where: {
      businessId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(createdAt ? { createdAt } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      cancelledAt: true,
      user: { select: { firstName: true, lastName: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getSale(businessId: string, id: string) {
  const sale = await prisma.sale.findFirst({
    where: { id, businessId },
    select: saleDetailSelect,
  });

  if (!sale) {
    throw new AppError(404, 'SALE_NOT_FOUND', 'La venta no existe.');
  }

  return sale;
}

export async function createSale(businessId: string, userId: string, input: CreateSaleInput) {
  return prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: {
        businessId,
        isActive: true,
        id: { in: input.items.map((item) => item.productId) },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        salePrice: true,
        costPrice: true,
        currentStock: true,
      },
    });

    if (products.length !== input.items.length) {
      throw new AppError(400, 'INVALID_PRODUCTS', 'Uno o mas productos no son validos.');
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const saleItems = input.items.map((item) => {
      const product = productById.get(item.productId)!;
      const quantity = new Prisma.Decimal(item.quantity);

      if (product.currentStock.lessThan(quantity)) {
        throw new AppError(
          422,
          'INSUFFICIENT_STOCK',
          `Stock insuficiente para ${product.name}. Disponible: ${product.currentStock.toString()}.`,
        );
      }

      return {
        product,
        quantity,
        subtotal: product.salePrice.mul(quantity).toDecimalPlaces(2),
      };
    });

    const subtotal = saleItems.reduce(
      (total, item) => total.plus(item.subtotal),
      new Prisma.Decimal(0),
    );
    const discount = new Prisma.Decimal(input.discount);

    if (discount.greaterThan(subtotal)) {
      throw new AppError(400, 'INVALID_DISCOUNT', 'El descuento no puede superar el subtotal.');
    }

    const now = new Date();
    const sale = await transaction.sale.create({
      data: {
        businessId,
        userId,
        status: SaleStatus.CONFIRMED,
        subtotal,
        discount,
        total: subtotal.minus(discount),
        notes: input.notes || null,
        confirmedAt: now,
        items: {
          create: saleItems.map(({ product, quantity, subtotal: itemSubtotal }) => ({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity,
            unitPrice: product.salePrice,
            unitCost: product.costPrice,
            discount: 0,
            subtotal: itemSubtotal,
          })),
        },
      },
      select: { id: true },
    });

    const createdItems = await transaction.saleItem.findMany({
      where: { saleId: sale.id },
      select: { id: true, productId: true, quantity: true },
    });

    for (const item of createdItems) {
      const product = productById.get(item.productId)!;
      const stockAfter = product.currentStock.minus(item.quantity);
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
          `El stock de ${product.name} cambio durante la venta. Intente nuevamente.`,
        );
      }

      await transaction.stockMovement.create({
        data: {
          businessId,
          productId: product.id,
          userId,
          saleItemId: item.id,
          type: StockMovementType.OUT,
          quantity: item.quantity,
          stockBefore: product.currentStock,
          stockAfter,
          reason: `Venta ${sale.id}`,
        },
      });
    }

    return transaction.sale.findUniqueOrThrow({
      where: { id: sale.id },
      select: saleDetailSelect,
    });
  });
}

export async function cancelSale(businessId: string, userId: string, id: string) {
  return prisma.$transaction(async (transaction) => {
    const sale = await transaction.sale.findFirst({
      where: { id, businessId },
      select: {
        id: true,
        status: true,
        items: { select: { id: true, productId: true, quantity: true, productName: true } },
      },
    });

    if (!sale) {
      throw new AppError(404, 'SALE_NOT_FOUND', 'La venta no existe.');
    }

    if (sale.status === SaleStatus.CANCELLED) {
      throw new AppError(409, 'SALE_ALREADY_CANCELLED', 'La venta ya esta anulada.');
    }

    const cancelled = await transaction.sale.updateMany({
      where: { id, businessId, status: SaleStatus.CONFIRMED },
      data: { status: SaleStatus.CANCELLED, cancelledAt: new Date() },
    });

    if (cancelled.count === 0) {
      throw new AppError(409, 'SALE_STATUS_CONFLICT', 'La venta no se puede anular.');
    }

    for (const item of sale.items) {
      const product = await transaction.product.findFirst({
        where: { id: item.productId, businessId },
        select: { id: true, currentStock: true },
      });

      if (!product) {
        throw new AppError(
          409,
          'SALE_PRODUCT_MISSING',
          `No se encontró el producto histórico ${item.productName}.`,
        );
      }

      const stockAfter = product.currentStock.plus(item.quantity);
      const updated = await transaction.product.updateMany({
        where: { id: product.id, businessId, currentStock: product.currentStock },
        data: { currentStock: stockAfter },
      });

      if (updated.count === 0) {
        throw new AppError(
          409,
          'STOCK_CONFLICT',
          `El stock de ${item.productName} cambio durante la anulacion.`,
        );
      }

      await transaction.stockMovement.create({
        data: {
          businessId,
          productId: product.id,
          userId,
          saleItemId: item.id,
          type: StockMovementType.IN,
          quantity: item.quantity,
          stockBefore: product.currentStock,
          stockAfter,
          reason: `Anulacion de venta ${sale.id}`,
        },
      });
    }

    return transaction.sale.findUniqueOrThrow({
      where: { id },
      select: saleDetailSelect,
    });
  });
}
