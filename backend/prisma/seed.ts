import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, StockMovementType, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { z } from 'zod';

const seedEnv = z
  .object({
    DATABASE_URL: z.string().min(1),
    SEED_ADMIN_PASSWORD: z.string().min(8),
  })
  .parse(process.env);

const adapter = new PrismaPg({
  connectionString: seedEnv.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const ids = {
  business: '10000000-0000-4000-8000-000000000001',
  admin: '20000000-0000-4000-8000-000000000001',
  categories: {
    beverages: '30000000-0000-4000-8000-000000000001',
    groceries: '30000000-0000-4000-8000-000000000002',
    cleaning: '30000000-0000-4000-8000-000000000003',
  },
  products: {
    mineralWater: '40000000-0000-4000-8000-000000000001',
    rice: '40000000-0000-4000-8000-000000000002',
    detergent: '40000000-0000-4000-8000-000000000003',
  },
  expenses: {
    electricity: '50000000-0000-4000-8000-000000000001',
    supplies: '50000000-0000-4000-8000-000000000002',
  },
  stockMovements: {
    mineralWater: '60000000-0000-4000-8000-000000000001',
    rice: '60000000-0000-4000-8000-000000000002',
    detergent: '60000000-0000-4000-8000-000000000003',
  },
} as const;

async function main() {
  const passwordHash = await bcrypt.hash(seedEnv.SEED_ADMIN_PASSWORD, 12);

  await prisma.business.upsert({
    where: { id: ids.business },
    update: {
      name: 'Comercio Demo',
      email: 'contacto@comercio-demo.local',
      phone: '+54 11 5555-0100',
      address: 'Buenos Aires, Argentina',
      isActive: true,
    },
    create: {
      id: ids.business,
      name: 'Comercio Demo',
      email: 'contacto@comercio-demo.local',
      phone: '+54 11 5555-0100',
      address: 'Buenos Aires, Argentina',
    },
  });

  await prisma.user.upsert({
    where: { id: ids.admin },
    update: {
      businessId: ids.business,
      firstName: 'Administrador',
      lastName: 'Demo',
      email: 'admin@comercio-demo.local',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      id: ids.admin,
      businessId: ids.business,
      firstName: 'Administrador',
      lastName: 'Demo',
      email: 'admin@comercio-demo.local',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const categories = [
    {
      id: ids.categories.beverages,
      name: 'Bebidas',
      description: 'Bebidas con y sin alcohol.',
    },
    {
      id: ids.categories.groceries,
      name: 'Almacen',
      description: 'Productos alimenticios de almacen.',
    },
    {
      id: ids.categories.cleaning,
      name: 'Limpieza',
      description: 'Articulos para limpieza del hogar.',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        ...category,
        businessId: ids.business,
        isActive: true,
      },
      create: {
        ...category,
        businessId: ids.business,
      },
    });
  }

  const products = [
    {
      id: ids.products.mineralWater,
      categoryId: ids.categories.beverages,
      name: 'Agua mineral 1.5 L',
      description: 'Botella de agua mineral sin gas.',
      sku: 'BEB-AGUA-1500',
      barcode: '7790000000011',
      salePrice: '1500.00',
      costPrice: '900.00',
      currentStock: '24.000',
      minimumStock: '6.000',
    },
    {
      id: ids.products.rice,
      categoryId: ids.categories.groceries,
      name: 'Arroz largo fino 1 kg',
      description: 'Paquete de arroz largo fino.',
      sku: 'ALM-ARROZ-1000',
      barcode: '7790000000028',
      salePrice: '2200.00',
      costPrice: '1450.00',
      currentStock: '18.000',
      minimumStock: '5.000',
    },
    {
      id: ids.products.detergent,
      categoryId: ids.categories.cleaning,
      name: 'Detergente 750 ml',
      description: 'Detergente concentrado para vajilla.',
      sku: 'LIM-DETER-0750',
      barcode: '7790000000035',
      salePrice: '2800.00',
      costPrice: '1750.00',
      currentStock: '12.000',
      minimumStock: '4.000',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        ...product,
        businessId: ids.business,
        isActive: true,
      },
      create: {
        ...product,
        businessId: ids.business,
      },
    });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const expenses = [
    {
      id: ids.expenses.electricity,
      category: 'Servicios',
      description: 'Factura de electricidad del local',
      amount: '45000.00',
    },
    {
      id: ids.expenses.supplies,
      category: 'Insumos',
      description: 'Bolsas y rollos de papel',
      amount: '12500.00',
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { id: expense.id },
      update: {
        ...expense,
        businessId: ids.business,
        userId: ids.admin,
        expenseDate: today,
      },
      create: {
        ...expense,
        businessId: ids.business,
        userId: ids.admin,
        expenseDate: today,
      },
    });
  }

  const stockMovements = products.map((product, index) => ({
    id: Object.values(ids.stockMovements)[index]!,
    productId: product.id,
    quantity: product.currentStock,
  }));

  for (const movement of stockMovements) {
    await prisma.stockMovement.upsert({
      where: { id: movement.id },
      update: {
        businessId: ids.business,
        productId: movement.productId,
        userId: ids.admin,
        type: StockMovementType.INITIAL,
        quantity: movement.quantity,
        stockBefore: '0.000',
        stockAfter: movement.quantity,
        reason: 'Carga inicial de datos de demostracion',
      },
      create: {
        ...movement,
        businessId: ids.business,
        userId: ids.admin,
        type: StockMovementType.INITIAL,
        stockBefore: '0.000',
        stockAfter: movement.quantity,
        reason: 'Carga inicial de datos de demostracion',
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
