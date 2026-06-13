import type { DateRangeInput } from '../schemas/date-range.schemas.js';

export interface DateRange {
  from: Date;
  to: Date;
  dateFrom: string;
  dateTo: string;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function resolveDateRange(input: DateRangeInput): DateRange {
  const now = new Date();
  const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const dateFrom = input.dateFrom ?? toIsoDate(defaultFrom);
  const dateTo = input.dateTo ?? toIsoDate(defaultTo);

  return {
    from: new Date(`${dateFrom}T00:00:00.000Z`),
    to: new Date(`${dateTo}T23:59:59.999Z`),
    dateFrom,
    dateTo,
  };
}

export function currentUtcDayRange() {
  const now = new Date();
  const date = toIsoDate(now);
  return {
    from: new Date(`${date}T00:00:00.000Z`),
    to: new Date(`${date}T23:59:59.999Z`),
  };
}
