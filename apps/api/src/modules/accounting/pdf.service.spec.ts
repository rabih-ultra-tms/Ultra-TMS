import { PdfService } from './pdf.service';

jest.mock('pdfkit', () => {
  const PDFDocument = jest.fn().mockImplementation(() => {
    const handlers: Record<string, Array<(chunk?: any) => void>> = {};
    let ended = false;
    let endEmitted = false;
    const doc: any = {
      page: { height: 800 },
      y: 100,
      on: jest.fn((event: string, cb: (chunk?: any) => void) => {
        handlers[event] = handlers[event] ?? [];
        handlers[event].push(cb);
        if (event === 'end' && endEmitted) {
          process.nextTick(() => cb());
        }
        return doc;
      }),
      fontSize: jest.fn(() => doc),
      text: jest.fn(() => doc),
      moveDown: jest.fn(() => doc),
      moveTo: jest.fn(() => doc),
      lineTo: jest.fn(() => doc),
      stroke: jest.fn(() => doc),
      end: jest.fn(() => {
        ended = true;
        process.nextTick(() => {
          (handlers.data ?? []).forEach(cb => cb(Buffer.from('pdf')));
          (handlers.end ?? []).forEach(cb => cb());
          endEmitted = true;
        });
      }),
    };
    return doc;
  });

  return { __esModule: true, default: PDFDocument };
});

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    service = new PdfService();
  });

  it('generates invoice pdf with tax', async () => {
    const result = await service.generateInvoicePdf({
      invoiceNumber: 'INV-1',
      invoiceDate: new Date('2024-01-01T00:00:00.000Z'),
      dueDate: new Date('2024-01-15T00:00:00.000Z'),
      subtotal: 100,
      taxAmount: 10,
      totalAmount: 110,
      company: { name: 'Acme' },
      lineItems: [
        { description: 'Line', quantity: 1, unitPrice: 100, amount: 100 },
      ],
    } as any);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('generates statement pdf', async () => {
    const result = await service.generateStatementPdf(
      { name: 'Acme' } as any,
      [
        {
          invoiceNumber: 'INV-2',
          invoiceDate: new Date('2024-01-01T00:00:00.000Z'),
          totalAmount: 200,
          amountPaid: 50,
        } as any,
      ],
      { from: new Date('2024-01-01T00:00:00.000Z'), to: new Date('2024-01-31T00:00:00.000Z') },
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
