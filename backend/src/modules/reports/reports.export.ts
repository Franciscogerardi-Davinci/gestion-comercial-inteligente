import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

type SalesReport = Awaited<ReturnType<typeof import('./reports.service.js').getSalesReport>>;
type ExpensesReport = Awaited<ReturnType<typeof import('./reports.service.js').getExpensesReport>>;

function formatMoney(value: { toString(): string }) {
  return Number(value.toString()).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

function pdfToBuffer(document: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on('data', (chunk: Buffer) => chunks.push(chunk));
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
    document.end();
  });
}

export function buildSalesPdf(report: SalesReport) {
  const document = new PDFDocument({ margin: 40, size: 'A4' });
  document.fontSize(18).text('Reporte de ventas');
  document
    .fontSize(10)
    .text(`Periodo: ${report.range.dateFrom} a ${report.range.dateTo}`)
    .moveDown();
  document.text(`Cantidad de ventas: ${report.summary.salesCount}`);
  document.text(`Ventas: ${formatMoney(report.summary.salesTotal)}`);
  document.text(`Costo histórico: ${formatMoney(report.summary.historicalCost)}`);
  document.text(`Ganancia bruta: ${formatMoney(report.summary.grossProfit)}`).moveDown();

  for (const sale of report.sales) {
    if (document.y > 740) document.addPage();
    document
      .fontSize(9)
      .text(
        `${sale.createdAt.toISOString().slice(0, 10)} | ${sale.id.slice(0, 8)} | ` +
          `${sale.itemCount} items | ${formatMoney(sale.total)} | ` +
          `Ganancia: ${formatMoney(sale.grossProfit)}`,
      );
  }

  return pdfToBuffer(document);
}

export function buildExpensesPdf(report: ExpensesReport) {
  const document = new PDFDocument({ margin: 40, size: 'A4' });
  document.fontSize(18).text('Reporte de gastos');
  document
    .fontSize(10)
    .text(`Periodo: ${report.range.dateFrom} a ${report.range.dateTo}`)
    .moveDown();
  document.text(`Cantidad de gastos: ${report.summary.expensesCount}`);
  document.text(`Total: ${formatMoney(report.summary.expensesTotal)}`).moveDown();

  for (const expense of report.expenses) {
    if (document.y > 740) document.addPage();
    document
      .fontSize(9)
      .text(
        `${expense.expenseDate.toISOString().slice(0, 10)} | ${expense.category} | ` +
          `${expense.description} | ${formatMoney(expense.amount)}`,
      );
  }

  return pdfToBuffer(document);
}

function styleWorksheet(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1565C0' },
  };
  worksheet.columns.forEach((column) => {
    column.width = Math.max(column.width ?? 10, 16);
  });
}

export async function buildSalesExcel(report: SalesReport) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ventas');
  worksheet.columns = [
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Venta', key: 'id', width: 38 },
    { header: 'Usuario', key: 'user', width: 24 },
    { header: 'Items', key: 'items', width: 10 },
    { header: 'Subtotal', key: 'subtotal', width: 16 },
    { header: 'Descuento', key: 'discount', width: 16 },
    { header: 'Total', key: 'total', width: 16 },
    { header: 'Costo histórico', key: 'cost', width: 18 },
    { header: 'Ganancia bruta', key: 'profit', width: 18 },
  ];
  report.sales.forEach((sale) => {
    worksheet.addRow({
      date: sale.createdAt.toISOString().slice(0, 10),
      id: sale.id,
      user: `${sale.user.firstName} ${sale.user.lastName}`,
      items: sale.itemCount,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
      cost: Number(sale.historicalCost),
      profit: Number(sale.grossProfit),
    });
  });
  styleWorksheet(worksheet);
  ['E', 'F', 'G', 'H', 'I'].forEach((column) => {
    worksheet.getColumn(column).numFmt = '$#,##0.00';
  });
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function buildExpensesExcel(report: ExpensesReport) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Gastos');
  worksheet.columns = [
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Categoria', key: 'category', width: 20 },
    { header: 'Descripcion', key: 'description', width: 40 },
    { header: 'Usuario', key: 'user', width: 24 },
    { header: 'Importe', key: 'amount', width: 16 },
  ];
  report.expenses.forEach((expense) => {
    worksheet.addRow({
      date: expense.expenseDate.toISOString().slice(0, 10),
      category: expense.category,
      description: expense.description,
      user: `${expense.user.firstName} ${expense.user.lastName}`,
      amount: Number(expense.amount),
    });
  });
  styleWorksheet(worksheet);
  worksheet.getColumn('E').numFmt = '$#,##0.00';
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
