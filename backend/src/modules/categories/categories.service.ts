import { prisma } from '../../infrastructure/database/prisma.js';
import { AppError } from '../../shared/errors/app-error.js';
import type { CategoryInput } from './categories.schemas.js';

export function listCategories(businessId: string) {
  return prisma.category.findMany({
    where: { businessId, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
    },
  });
}

export async function createCategory(businessId: string, input: CategoryInput) {
  const inactiveCategory = await prisma.category.findFirst({
    where: { businessId, name: input.name, isActive: false },
    select: { id: true },
  });

  if (inactiveCategory) {
    return prisma.category.update({
      where: { id: inactiveCategory.id },
      data: {
        description: input.description || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return prisma.category.create({
    data: {
      businessId,
      name: input.name,
      description: input.description || null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateCategory(businessId: string, id: string, input: CategoryInput) {
  const result = await prisma.category.updateMany({
    where: { id, businessId, isActive: true },
    data: {
      name: input.name,
      description: input.description || null,
    },
  });

  if (result.count === 0) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'La categoria no existe.');
  }

  return prisma.category.findFirstOrThrow({
    where: { id, businessId },
    select: {
      id: true,
      name: true,
      description: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteCategory(businessId: string, id: string) {
  const category = await prisma.category.findFirst({
    where: { id, businessId, isActive: true },
    select: {
      id: true,
      _count: {
        select: {
          products: { where: { isActive: true } },
        },
      },
    },
  });

  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'La categoria no existe.');
  }

  if (category._count.products > 0) {
    throw new AppError(
      409,
      'CATEGORY_HAS_PRODUCTS',
      'No se puede desactivar una categoria con productos activos.',
    );
  }

  const result = await prisma.category.updateMany({
    where: { id, businessId, isActive: true },
    data: { isActive: false },
  });

  if (result.count === 0) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'La categoria no existe.');
  }
}
