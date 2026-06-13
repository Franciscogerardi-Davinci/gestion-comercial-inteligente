export type SaleStatus = 'CONFIRMED' | 'CANCELLED';

export interface SaleListItem {
  id: string;
  status: SaleStatus;
  total: string;
  createdAt: string;
  cancelledAt: string | null;
  user: { firstName: string; lastName: string };
  _count: { items: number };
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: string;
  unitPrice: string;
  unitCost: string | null;
  discount: string;
  subtotal: string;
}

export interface Sale {
  id: string;
  status: SaleStatus;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string };
  items: SaleItem[];
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string; lastName: string };
}
