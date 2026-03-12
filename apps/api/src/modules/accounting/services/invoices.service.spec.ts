import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PrismaService } from '../../../prisma.service';
import { InvoiceStatus } from '../dto';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let prisma: {
    invoice: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    load: {
      findFirst: jest.Mock;
    };
    company: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      invoice: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      load: {
        findFirst: jest.fn(),
      },
      company: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(InvoicesService);
  });

  it('throws when invoice not found', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    await expect(service.findOne('inv-1', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prevents update of voided invoice', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', status: 'VOID' });

    await expect(
      service.update('inv-1', 'tenant-1', 'user-1', { status: InvoiceStatus.SENT }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks invoice sent', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1' });
    prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'SENT' });

    const result = await service.sendInvoice('inv-1', 'tenant-1');

    expect(result.invoice).toEqual({ id: 'inv-1', status: 'SENT' });
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: expect.objectContaining({ status: 'SENT', sentAt: expect.any(Date) }),
    });
  });

  it('prevents void when payments exist', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', amountPaid: 10 });

    await expect(
      service.voidInvoice('inv-1', 'tenant-1', 'user-1', 'Reason'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns invoices list with total', async () => {
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);
    prisma.invoice.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { status: 'SENT' });

    expect(result).toEqual({ invoices: [{ id: 'inv-1' }], total: 1 });
    expect(prisma.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1', status: 'SENT' }) }),
    );
  });

  it('updates invoice when valid', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', status: 'DRAFT' });
    prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'SENT' });

    const result = await service.update('inv-1', 'tenant-1', 'user-1', { status: 'SENT' } as any);

    expect(result!.status).toBe('SENT');
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv-1' }, data: expect.objectContaining({ status: 'SENT' }) }),
    );
  });

  it('sends reminder and marks overdue when past due date', async () => {
    const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', status: 'SENT', dueDate: pastDue });
    prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'OVERDUE' });

    const result = await service.sendReminder('inv-1', 'tenant-1');

    expect(result!.status).toBe('OVERDUE');
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'OVERDUE' }) }),
    );
  });

  it('throws when sending reminder for void invoice', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', status: 'VOID', dueDate: new Date() });

    await expect(service.sendReminder('inv-1', 'tenant-1')).rejects.toThrow(BadRequestException);
  });

  it('builds aging report totals', async () => {
    const now = new Date();
    prisma.invoice.findMany.mockResolvedValue([
      { balanceDue: 100, dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { balanceDue: 200, dueDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000) },
      { balanceDue: 300, dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) },
    ] as any);

    const result = await service.getAgingReport('tenant-1');

    expect(result.totals.current).toBe(300);
    expect(result.totals.days1to30).toBe(100);
    expect(result.totals.days31to60).toBe(200);
  });

  it('throws when generating invoice from missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.generateFromLoad('tenant-1', 'user-1', 'load-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates invoice with generated number', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);
    prisma.invoice.create.mockResolvedValue({ id: 'inv-1', invoiceNumber: 'INV-000001' });

    const result = await service.create('tenant-1', 'user-1', {
      companyId: 'c1',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      subtotal: 100,
      totalAmount: 100,
      balanceDue: 100,
      paymentTerms: 'NET30',
      lineItems: [{ lineNumber: 1, description: 'Freight', itemType: 'FREIGHT', unitPrice: 100, amount: 100 }],
    } as any);

    expect(result.invoiceNumber).toBe('INV-000001');
    expect(prisma.invoice.create).toHaveBeenCalled();
  });

  it('throws when sendInvoice target missing', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    await expect(service.sendInvoice('inv-1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('voids invoice when no payments', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', amountPaid: 0 });
    prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'VOID' });

    const result = await service.voidInvoice('inv-1', 'tenant-1', 'user-1', 'Reason');

    expect(result!.status).toBe('VOID');
  });

  it('gets statement data for company', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'inv-1' }]);

    const result = await service.getStatementData('tenant-1', 'c1', {} as any);

    expect(result.company.id).toBe('c1');
    expect(result.invoices).toEqual([{ id: 'inv-1' }]);
  });

  it('throws when statement company missing', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(service.getStatementData('tenant-1', 'c1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('throws when load has no order', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', order: null });

    await expect(
      service.generateFromLoad('tenant-1', 'user-1', 'load-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates invoice from load data', async () => {
    const load = {
      id: 'load-1',
      loadNumber: 'LD2026010001',
      orderId: 'order-1',
      order: {
        customerId: 'company-1',
        totalCharges: 2500,
        customer: { paymentTerms: 'NET30' },
      },
    };
    prisma.load.findFirst.mockResolvedValue(load);

    const createSpy = jest
      .spyOn(service, 'create')
      .mockResolvedValue({ id: 'inv-1' } as any);

    const result = await service.generateFromLoad('tenant-1', 'user-1', 'load-1');

    expect(result).toEqual({ id: 'inv-1' });
    expect(createSpy).toHaveBeenCalledWith(
      'tenant-1',
      'user-1',
      expect.objectContaining({
        companyId: 'company-1',
        orderId: 'order-1',
        loadId: 'load-1',
        subtotal: 2500,
        totalAmount: 2500,
        balanceDue: 2500,
        paymentTerms: 'NET30',
        lineItems: [
          expect.objectContaining({
            description: expect.stringContaining('LD2026010001'),
          }),
        ],
      }),
    );
  });

  // ── QS-015: Financial Calculation Tests ──────────────────────────────

  describe('Financial Calculations', () => {
    it('creates invoice with line items whose amounts match subtotal', async () => {
      // Realistic TMS scenario: freight $4,200 + detention $350 + lumper $125 = $4,675
      prisma.invoice.findFirst.mockResolvedValue({ invoiceNumber: 'INV-000042' });
      prisma.invoice.create.mockImplementation(({ data }) => Promise.resolve(data));

      const dto = {
        companyId: 'customer-abc',
        orderId: 'order-1',
        loadId: 'load-1',
        invoiceDate: '2026-03-01',
        dueDate: '2026-03-31',
        subtotal: 4675,
        totalAmount: 4675,
        balanceDue: 4675,
        paymentTerms: 'NET30',
        lineItems: [
          { lineNumber: 1, description: 'Line haul freight – Chicago to Dallas', itemType: 'FREIGHT', loadId: 'load-1', quantity: 1, unitPrice: 4200, amount: 4200 },
          { lineNumber: 2, description: 'Detention – 3 hours @ $75/hr', itemType: 'ACCESSORIAL', loadId: 'load-1', quantity: 3, unitPrice: 75, amount: 225, revenueAccountId: 'acc-rev-1' },
          { lineNumber: 3, description: 'Lumper fee', itemType: 'ACCESSORIAL', loadId: 'load-1', quantity: 1, unitPrice: 250, amount: 250 },
        ],
      } as any;

      await service.create('tenant-1', 'user-1', dto);

      const createCall = prisma.invoice.create.mock.calls[0]![0]!;
      const lineItemsData = createCall.data.lineItems.create;
      const lineItemSum = lineItemsData.reduce((sum: number, li: any) => sum + Number(li.amount), 0);

      expect(lineItemSum).toBe(4675);
      expect(lineItemSum).toBe(createCall.data.subtotal);
    });

    it('creates invoice with tax applied after subtotal', async () => {
      // $3,500 subtotal + $280 tax (8%) = $3,780 total
      prisma.invoice.findFirst.mockResolvedValue({ invoiceNumber: 'INV-000010' });
      prisma.invoice.create.mockImplementation(({ data }) => Promise.resolve(data));

      const subtotal = 3500;
      const taxAmount = 280; // 8% of subtotal
      const totalAmount = subtotal + taxAmount;

      await service.create('tenant-1', 'user-1', {
        companyId: 'customer-xyz',
        invoiceDate: '2026-02-15',
        dueDate: '2026-03-17',
        subtotal,
        taxAmount,
        totalAmount,
        balanceDue: totalAmount,
        paymentTerms: 'NET30',
      } as any);

      const createCall = prisma.invoice.create.mock.calls[0]![0]!;

      expect(createCall.data.subtotal).toBe(3500);
      expect(createCall.data.taxAmount).toBe(280);
      expect(createCall.data.totalAmount).toBe(3780);
      expect(createCall.data.totalAmount).toBe(createCall.data.subtotal + createCall.data.taxAmount);
    });

    it('computes aging bucket totals using integer-safe arithmetic', async () => {
      // Amounts that cause floating-point issues with naive addition: 0.1 + 0.2 !== 0.3
      const now = new Date();
      prisma.invoice.findMany.mockResolvedValue([
        { balanceDue: 1999.99, dueDate: new Date(now.getTime() - 10 * 86400000) }, // 1-30 days
        { balanceDue: 3000.01, dueDate: new Date(now.getTime() - 10 * 86400000) }, // 1-30 days
        { balanceDue: 4500.50, dueDate: new Date(now.getTime() - 45 * 86400000) }, // 31-60 days
        { balanceDue: 7250.75, dueDate: new Date(now.getTime() + 5 * 86400000) },  // current (not yet due)
      ] as any);

      const result = await service.getAgingReport('tenant-1');

      // 1999.99 + 3000.01 = 5000.00 exactly
      expect(result.totals.days1to30).toBe(5000);
      expect(result.totals.days31to60).toBe(4500.50);
      expect(result.totals.current).toBe(7250.75);
      // Verify total across buckets
      const grandTotal = result.totals.current + result.totals.days1to30 +
        result.totals.days31to60 + result.totals.days61to90 + result.totals.over90;
      expect(grandTotal).toBe(16751.25);
    });

    it('creates multi-line-item invoice with freight, accessorial, and adjustment', async () => {
      // Real scenario: freight + fuel surcharge + discount adjustment
      prisma.invoice.findFirst.mockResolvedValue({ invoiceNumber: 'INV-000099' });
      prisma.invoice.create.mockImplementation(({ data }) => Promise.resolve(data));

      const lineItems = [
        { lineNumber: 1, description: 'LTL freight – Atlanta to Miami', itemType: 'FREIGHT', quantity: 1, unitPrice: 2800, amount: 2800 },
        { lineNumber: 2, description: 'Fuel surcharge (18%)', itemType: 'ACCESSORIAL', quantity: 1, unitPrice: 504, amount: 504 },
        { lineNumber: 3, description: 'Inside delivery', itemType: 'ACCESSORIAL', quantity: 1, unitPrice: 150, amount: 150 },
        { lineNumber: 4, description: 'Volume discount (5%)', itemType: 'ADJUSTMENT', quantity: 1, unitPrice: -172.70, amount: -172.70 },
      ];
      const subtotal = 3281.30; // 2800 + 504 + 150 - 172.70
      const taxAmount = 262.50;
      const totalAmount = 3543.80; // subtotal + tax

      await service.create('tenant-1', 'user-1', {
        companyId: 'company-1',
        invoiceDate: '2026-03-05',
        dueDate: '2026-04-04',
        subtotal,
        taxAmount,
        totalAmount,
        balanceDue: totalAmount,
        paymentTerms: 'NET30',
        lineItems,
      } as any);

      const createCall = prisma.invoice.create.mock.calls[0]![0]!;
      const created = createCall.data.lineItems.create;

      expect(created).toHaveLength(4);
      // Verify negative adjustment is stored correctly
      expect(created[3].amount).toBe(-172.70);
      // Verify sum of line items equals subtotal
      const sum = created.reduce((s: number, li: any) => s + Number(li.amount), 0);
      expect(Math.round(sum * 100) / 100).toBe(3281.30);
      // Verify total = subtotal + tax
      expect(createCall.data.totalAmount).toBe(createCall.data.subtotal + createCall.data.taxAmount);
    });
  });
});
