import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Company, Invoice, InvoiceLineItem } from '@prisma/client';

@Injectable()
export class PdfService {
  async generateInvoicePdf(
    invoice: Invoice & {
      company: Company;
      lineItems: InvoiceLineItem[];
    },
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(24).text(invoice.company?.name || 'Company', { align: 'left' });
    doc.moveDown();
    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(12).text('BILL TO:', { underline: true });
    doc.fontSize(10);
    doc.text(invoice.company?.name || '');

    doc.moveDown(2);

    const tableTop = doc.y;
    const descriptionX = 50;
    const quantityX = 320;
    const rateX = 380;
    const amountX = 460;

    doc.fontSize(10);
    doc.text('Description', descriptionX, tableTop);
    doc.text('Qty', quantityX, tableTop);
    doc.text('Rate', rateX, tableTop);
    doc.text('Amount', amountX, tableTop);

    doc.moveTo(descriptionX, tableTop + 15).lineTo(540, tableTop + 15).stroke();

    let y = tableTop + 25;
    for (const item of invoice.lineItems) {
      doc.text(item.description || '', descriptionX, y, { width: 250 });
      doc.text(String(item.quantity ?? 1), quantityX, y);
      doc.text(`$${Number(item.unitPrice ?? 0).toFixed(2)}`, rateX, y);
      doc.text(`$${Number(item.amount ?? 0).toFixed(2)}`, amountX, y);
      y += 20;
    }

    y += 20;
    doc.moveTo(350, y).lineTo(540, y).stroke();
    y += 10;

    doc.text('Subtotal:', 350, y);
    doc.text(`$${Number(invoice.subtotal).toFixed(2)}`, amountX, y);
    y += 15;

    if (Number(invoice.taxAmount) > 0) {
      doc.text('Tax:', 350, y);
      doc.text(`$${Number(invoice.taxAmount).toFixed(2)}`, amountX, y);
      y += 15;
    }

    doc.fontSize(12);
    doc.text('TOTAL:', 350, y);
    doc.text(`$${Number(invoice.totalAmount).toFixed(2)}`, amountX, y);

    doc.fontSize(8);
    doc.text('Thank you for your business!', 50, doc.page.height - 50, { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generateStatementPdf(
    company: Company,
    invoices: Invoice[],
    dateRange: { from: Date; to: Date },
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(24).text(company?.name || 'Company');
    doc.moveDown();
    doc.fontSize(16).text('CUSTOMER STATEMENT', { align: 'center' });
    doc.fontSize(10).text(
      `Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`,
      { align: 'center' },
    );

    doc.moveDown(2);

    doc.text(`Customer: ${company.name}`);
    doc.moveDown();

    const tableTop = doc.y;
    doc.text('Date', 50, tableTop);
    doc.text('Invoice #', 120, tableTop);
    doc.text('Amount', 350, tableTop);
    doc.text('Balance', 450, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

    let y = tableTop + 25;
    let runningBalance = 0;

    for (const inv of invoices) {
      const balance = Number(inv.totalAmount) - Number(inv.amountPaid);
      runningBalance += balance;

      doc.text(inv.invoiceDate.toLocaleDateString(), 50, y);
      doc.text(inv.invoiceNumber || '', 120, y);
      doc.text(`$${Number(inv.totalAmount).toFixed(2)}`, 350, y);
      doc.text(`$${balance.toFixed(2)}`, 450, y);
      y += 20;
    }

    y += 20;
    doc.moveTo(350, y).lineTo(540, y).stroke();
    y += 10;
    doc.fontSize(12);
    doc.text('TOTAL BALANCE DUE:', 350, y);
    doc.text(`$${runningBalance.toFixed(2)}`, 450, y);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
