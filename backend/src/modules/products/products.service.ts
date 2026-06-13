import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { ProductInput } from './products.schemas.js';

const productSelect = {
  id: true,
  name: true,
  description: true,
  sku: true,
  barcode: true,
  salePrice: true,
  costPrice: true,
  currentStock: true,
  minimumStock: true,
  isActive: true,
  categoryId: true,
  category: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} as const;

async function validateCategory(businessId: string, categoryId?: string | null) {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, businessId, isActive: true },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(400, 'INVALID_CATEGORY', 'La categoria seleccionada no es valida.');
  }
}

export function listProducts(businessId: string) {
  return prisma.product.findMany({
    where: { businessId, isActive: true },
    orderBy: { name: 'asc' },
    select: productSelect,
  });
}

export async function getProduct(businessId: string, id: string) {
  const product = await prisma.product.findFirst({
    where: { id, businessId, isActive: true },
    select: productSelect,
  });

  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.');
  }

  return product;
}

export async function createProduct(businessId: string, input: ProductInput) {
  await validateCategory(businessId, input.categoryId);

  return prisma.product.create({
    data: {
      businessId,
      categoryId: input.categoryId || null,
      name: input.name,
      description: input.description || null,
      sku: input.sku,
      barcode: input.barcode,
      salePrice: input.salePrice,
      costPrice: input.costPrice ?? null,
      minimumStock: input.minimumStock,
      currentStock: 0,
    },
    select: productSelect,
  });
}

export async function updateProduct(businessId: string, id: string, input: ProductInput) {
  await getProduct(businessId, id);
  await validateCategory(businessId, input.categoryId);

  return prisma.product.update({
    where: { id },
    data: {
      categoryId: input.categoryId || null,
      name: input.name,
      description: input.description || null,
      sku: input.sku,
      barcode: input.barcode,
      salePrice: input.salePrice,
      costPrice: input.costPrice ?? null,
      minimumStock: input.minimumStock,
    },
    select: productSelect,
  });
}

export async function deleteProduct(businessId: string, id: string) {
  const result = await prisma.product.updateMany({
    where: { id, businessId, isActive: true },
    data: {
      isActive: false,
      sku: null,
      barcode: null,
    },
  });

  if (result.count === 0) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'El producto no existe.');
  }
}
