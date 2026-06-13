export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  salePrice: string;
  costPrice: string | null;
  currentStock: string;
  minimumStock: string;
  isActive: boolean;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: string;
  stockBefore: string;
  stockAfter: string;
  reason: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string | null };
  user: { id: string; firstName: string; lastName: string };
}
