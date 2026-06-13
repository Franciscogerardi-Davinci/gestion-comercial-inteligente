import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { StockMovement, StockMovementType } from '../../types/inventory';

export interface StockMovementInput {
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

export async function getStockMovements() {
  const response =
    await httpClient.get<ApiSuccess<{ movements: StockMovement[] }>>('/v1/stock-movements');
  return response.data.data.movements;
}

export async function createStockMovement(input: StockMovementInput) {
  const response = await httpClient.post<ApiSuccess<{ movement: StockMovement }>>(
    '/v1/stock-movements',
    input,
  );
  return response.data.data.movement;
}
