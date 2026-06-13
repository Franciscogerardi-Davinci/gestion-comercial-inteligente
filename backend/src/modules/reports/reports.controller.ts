import type { RequestHandler } from 'express';

import { AppError } from '../../shared/errors/app-error.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import {
  buildExpensesExcel,
  buildExpensesPdf,
  buildSalesExcel,
  buildSalesPdf,
} from './reports.export.js';
import { reportsFilterSchema } from './reports.schemas.js';
import { getExpensesReport, getProfitReport, getSalesReport } from './reports.service.js';

function getRequestData(request: Parameters<RequestHandler>[0]) {
  if (!request.auth) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Se requiere autenticacion.');
  }
  const { query } = reportsFilterSchema.parse({ query: request.query });
  return { businessId: request.auth.businessId, filters: query };
}

function sendFile(
  response: Parameters<RequestHandler>[1],
  buffer: Buffer,
  contentType: string,
  filename: string,
) {
  response.setHeader('Content-Type', contentType);
  response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  response.setHeader('Content-Length', buffer.length);
  response.status(200).send(buffer);
}

export const sales: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  sendSuccess(response, { report: await getSalesReport(businessId, filters) });
};

export const expenses: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  sendSuccess(response, { report: await getExpensesReport(businessId, filters) });
};

export const profit: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  sendSuccess(response, { report: await getProfitReport(businessId, filters) });
};

export const salesPdf: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  const report = await getSalesReport(businessId, filters);
  sendFile(
    response,
    await buildSalesPdf(report),
    'application/pdf',
    `ventas-${report.range.dateFrom}-${report.range.dateTo}.pdf`,
  );
};

export const salesExcel: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  const report = await getSalesReport(businessId, filters);
  sendFile(
    response,
    await buildSalesExcel(report),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    `ventas-${report.range.dateFrom}-${report.range.dateTo}.xlsx`,
  );
};

export const expensesPdf: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  const report = await getExpensesReport(businessId, filters);
  sendFile(
    response,
    await buildExpensesPdf(report),
    'application/pdf',
    `gastos-${report.range.dateFrom}-${report.range.dateTo}.pdf`,
  );
};

export const expensesExcel: RequestHandler = async (request, response) => {
  const { businessId, filters } = getRequestData(request);
  const report = await getExpensesReport(businessId, filters);
  sendFile(
    response,
    await buildExpensesExcel(report),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    `gastos-${report.range.dateFrom}-${report.range.dateTo}.xlsx`,
  );
};
