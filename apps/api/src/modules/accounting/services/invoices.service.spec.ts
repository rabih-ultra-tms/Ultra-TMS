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

    expect(result.status).toBe('SENT');
    expect(prisma.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inv-1' }, data: expect.objectContaining({ status: 'SENT' }) }),
    );
  });

  it('sends reminder and marks overdue when past due date', async () => {
    const pastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    prisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', status: 'SENT', dueDate: pastDue });
    prisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'OVERDUE' });

    const result = await service.sendReminder('inv-1', 'tenant-1');

    expect(result.status).toBe('OVERDUE');
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

    expect(result.status).toBe('VOID');
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
});
