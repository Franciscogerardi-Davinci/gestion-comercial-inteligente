import { httpClient } from '../../api/httpClient';
import type { ApiSuccess } from '../../types/auth';
import type { DashboardSummary } from '../../types/reports';

export async function getDashboardSummary() {
  const response =
    await httpClient.get<ApiSuccess<{ dashboard: DashboardSummary }>>('/v1/dashboard/summary');
  return response.data.data.dashboard;
}
