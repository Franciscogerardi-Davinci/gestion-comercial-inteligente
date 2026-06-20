import type { DateRangeInput } from '../schemas/date-range.schemas.js';
import { env } from '../../config/env.js';

export interface DateRange {
  from: Date;
  to: Date;
  dateFrom: string;
  dateTo: string;
}

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function getTimeZoneOffset(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return representedAsUtc - (date.getTime() - date.getUTCMilliseconds());
}

function atTimeZone(date: string, endOfDay = false) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const day = Number(date.slice(8, 10));
  const utcGuess = Date.UTC(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
  const firstCandidate = new Date(utcGuess - getTimeZoneOffset(new Date(utcGuess)));
  const correctedOffset = getTimeZoneOffset(firstCandidate);

  return new Date(utcGuess - correctedOffset);
}

function currentDate() {
  const parts = getDateParts(new Date());
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function currentMonthRange() {
  const date = currentDate();
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    dateFrom: `${year}-${String(month).padStart(2, '0')}-01`,
    dateTo: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function resolveDateRange(input: DateRangeInput): DateRange {
  const defaults = currentMonthRange();
  const dateFrom = input.dateFrom ?? defaults.dateFrom;
  const dateTo = input.dateTo ?? defaults.dateTo;

  return {
    from: atTimeZone(dateFrom),
    to: atTimeZone(dateTo, true),
    dateFrom,
    dateTo,
  };
}

export function resolveDateOnlyRange(input: DateRangeInput): DateRange {
  const range = resolveDateRange(input);

  return {
    ...range,
    from: new Date(`${range.dateFrom}T00:00:00.000Z`),
    to: new Date(`${range.dateTo}T23:59:59.999Z`),
  };
}

export function resolveOptionalDateRange(input: DateRangeInput) {
  if (!input.dateFrom && !input.dateTo) return undefined;

  return {
    ...(input.dateFrom ? { gte: atTimeZone(input.dateFrom) } : {}),
    ...(input.dateTo ? { lte: atTimeZone(input.dateTo, true) } : {}),
  };
}

export function currentDayRange() {
  const date = currentDate();
  return { from: atTimeZone(date), to: atTimeZone(date, true) };
}
