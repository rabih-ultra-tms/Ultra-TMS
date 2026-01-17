import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsReceivedService } from './payments-received.service';
import { PrismaService } from '../../../prisma.service';

describe('PaymentsReceivedService', () => {
  let service: PaymentsReceivedService;
  let prisma: {
    paymentReceived: { findFirst: jest.Mock; create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      paymentReceived: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsReceivedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PaymentsReceivedService);
  });

  it('throws when payment not found', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue(null);

    await expect(
      service.findOne('pay-1', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects apply when amount exceeds unapplied', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({ id: 'pay-1', unappliedAmount: 10 });

    await expect(
      service.applyToInvoice('pay-1', 'tenant-1', 'user-1', [
        { invoiceId: 'inv-1', amount: 20 },
      ] as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('applies payment and marks invoice paid when fully covered', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({ id: 'pay-1', unappliedAmount: 2500 });

    const tx = {
      invoice: {
        findFirst: jest.fn().mockResolvedValue({ id: 'inv-1', balanceDue: 2500, amountPaid: 0, totalAmount: 2500 }),
        update: jest.fn().mockResolvedValue({ id: 'inv-1', status: 'PAID' }),
      },
      paymentApplication: {
        create: jest.fn().mockResolvedValue({ id: 'app-1' }),
      },
      paymentReceived: {
        update: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'APPLIED' }),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await service.applyToInvoice('pay-1', 'tenant-1', 'user-1', [
      { invoiceId: 'inv-1', amount: 2500 },
    ] as any);

    expect(tx.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: expect.objectContaining({ status: 'PAID' }),
    });
    expect(tx.paymentReceived.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'APPLIED', unappliedAmount: 0 }) }),
    );
  });

  it('applies payment and leaves invoice partial when underpaid', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({ id: 'pay-1', unappliedAmount: 2500 });

    const tx = {
      invoice: {
        findFirst: jest.fn().mockResolvedValue({ id: 'inv-1', balanceDue: 2500, amountPaid: 0, totalAmount: 2500 }),
        update: jest.fn().mockResolvedValue({ id: 'inv-1', status: 'PARTIAL' }),
      },
      paymentApplication: {
        create: jest.fn().mockResolvedValue({ id: 'app-1' }),
      },
      paymentReceived: {
        update: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'PARTIAL' }),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await service.applyToInvoice('pay-1', 'tenant-1', 'user-1', [
      { invoiceId: 'inv-1', amount: 1000 },
    ] as any);

    expect(tx.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: expect.objectContaining({ status: 'PARTIAL' }),
    });
    expect(tx.paymentReceived.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PARTIAL', unappliedAmount: 1500 }) }),
    );
  });

  it('throws when invoice is not found during apply', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({ id: 'pay-1', unappliedAmount: 100 });

    const tx = {
      invoice: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      paymentApplication: {
        create: jest.fn(),
      },
      paymentReceived: {
        update: jest.fn(),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await expect(
      service.applyToInvoice('pay-1', 'tenant-1', 'user-1', [
        { invoiceId: 'inv-404', amount: 100 },
      ] as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('marks payment bounced and reverses applications', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({
      id: 'pay-1',
      applications: [{ id: 'app-1', invoiceId: 'inv-1', amount: 100 }],
    });

    const tx = {
      invoice: {
        findUnique: jest.fn().mockResolvedValue({ id: 'inv-1', totalAmount: 200, amountPaid: 150 }),
        update: jest.fn().mockResolvedValue({ id: 'inv-1', status: 'PARTIAL' }),
      },
      paymentApplication: {
        delete: jest.fn().mockResolvedValue({ id: 'app-1' }),
      },
      paymentReceived: {
        update: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'BOUNCED' }),
      },
    } as any;

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    await service.markBounced('pay-1', 'tenant-1');

    expect(tx.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: expect.objectContaining({ status: 'PARTIAL' }),
    });
    expect(tx.paymentApplication.delete).toHaveBeenCalledWith({ where: { id: 'app-1' } });
    expect(tx.paymentReceived.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'BOUNCED', unappliedAmount: 0 }) }),
    );
  });

  it('creates payment received', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue(null);
    prisma.paymentReceived.create.mockResolvedValue({ id: 'pay-1', paymentNumber: 'PMT-000001' });

    const result = await service.create('tenant-1', 'user-1', {
      companyId: 'c1',
      paymentDate: new Date().toISOString(),
      paymentMethod: 'CHECK',
      amount: 100,
    } as any);

    expect(result.paymentNumber).toBe('PMT-000001');
  });

  it('returns payments list with total', async () => {
    prisma.paymentReceived.findMany.mockResolvedValue([{ id: 'pay-1' }]);
    prisma.paymentReceived.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { status: 'RECEIVED' });

    expect(result).toEqual({ payments: [{ id: 'pay-1' }], total: 1 });
  });

  it('returns payment when found', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue({ id: 'pay-1' });

    const result = await service.findOne('pay-1', 'tenant-1');

    expect(result).toEqual({ id: 'pay-1' });
  });

  it('processes batch payments with success', async () => {
    prisma.paymentReceived.findFirst.mockResolvedValue(null);
    prisma.paymentReceived.create.mockResolvedValue({ id: 'pay-1' });

    const result = await service.processBatch('tenant-1', {
      payments: [{ companyId: 'c1', paymentDate: new Date().toISOString(), paymentMethod: 'CHECK', amount: 50 }],
    } as any, 'user-1');

    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);
  });
});
