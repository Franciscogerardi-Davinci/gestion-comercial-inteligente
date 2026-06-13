import { z } from 'zod';

import { dateRangeQuerySchema } from '../../shared/schemas/date-range.schemas.js';

export const reportsFilterSchema = z.object({
  query: dateRangeQuerySchema,
});
