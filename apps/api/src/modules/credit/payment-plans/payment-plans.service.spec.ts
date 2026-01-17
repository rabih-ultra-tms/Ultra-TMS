import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentPlansService } from './payment-plans.service';
import { PrismaService } from '../../../prisma.service';

describe('PaymentPlansService', () => {
  let service: PaymentPlansService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      paymentPlan: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      company: { findFirst: jest.fn() },
      invoice: { findMany: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentPlansService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(PaymentPlansService);
  });

  it('lists payment plans', async () => {
    prisma.paymentPlan.findMany.mockResolvedValue([]);
    prisma.paymentPlan.count.mockResolvedValue(0);

    const result = await service.list('tenant-1', {} as any);

    expect(result.total).toBe(0);
  });

  it('throws when plan missing', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue(null);

    await expect(service.detail('tenant-1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('rejects when invoices missing', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([]);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 0, installmentCount: 1, firstPaymentDate: '2025-01-01' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects when company missing', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 0, installmentCount: 1, firstPaymentDate: '2025-01-01' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects down payment greater than total', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', balanceDue: 100 }]);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 200, installmentCount: 1, firstPaymentDate: '2025-01-01' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects down payment below minimum', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', balanceDue: 100 }]);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 10, installmentCount: 1, firstPaymentDate: '2025-01-01' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects installment count above max', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', balanceDue: 100 }]);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 20, installmentCount: 13, firstPaymentDate: '2025-01-01' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates payment plan and emits event', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', balanceDue: 100 }]);
    prisma.paymentPlan.count.mockResolvedValue(0);
    prisma.paymentPlan.create.mockResolvedValue({ id: 'p1', companyId: 'c1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', invoices: [{ invoiceId: 'i1' }], downPayment: 20, installmentCount: 1, firstPaymentDate: '2025-01-01' } as any);

    expect(events.emit).toHaveBeenCalledWith('payment.plan.created', expect.any(Object));
  });

  it('updates plan and recalculates installment amount', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue({
      id: 'p1',
      companyId: 'c1',
      customerId: 'c1',
      invoiceIds: ['i1'],
      totalAmount: 100,
      amountPaid: 20,
      remainingBalance: 80,
      installmentAmount: 40,
      installmentCount: 2,
      frequency: 'MONTHLY',
      firstPaymentDate: new Date('2025-01-01'),
      nextPaymentDate: new Date('2025-01-01'),
      interestRate: null,
      lateFeePct: null,
      lateFeeFixed: null,
    });
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i2', balanceDue: 200 }]);
    prisma.paymentPlan.update.mockResolvedValue({ id: 'p1' });

    await service.update('tenant-1', 'u1', 'p1', {
      invoices: [{ invoiceId: 'i2' }],
      installmentCount: 4,
    } as any);

    expect(prisma.paymentPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: 200,
          installmentCount: 4,
        }),
      }),
    );
  });

  it('rejects update when invoices missing', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue({
      id: 'p1',
      companyId: 'c1',
      customerId: 'c1',
      invoiceIds: ['i1'],
      totalAmount: 100,
      amountPaid: 20,
      remainingBalance: 80,
      installmentAmount: 40,
      installmentCount: 2,
      frequency: 'MONTHLY',
      firstPaymentDate: new Date('2025-01-01'),
      nextPaymentDate: new Date('2025-01-01'),
    });
    prisma.invoice.findMany.mockResolvedValue([]);

    await expect(service.update('tenant-1', 'u1', 'p1', { invoices: [{ invoiceId: 'i2' }] } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects update when installment count too high', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue({
      id: 'p1',
      companyId: 'c1',
      customerId: 'c1',
      invoiceIds: ['i1'],
      totalAmount: 100,
      amountPaid: 20,
      remainingBalance: 80,
      installmentAmount: 40,
      installmentCount: 2,
      frequency: 'MONTHLY',
      firstPaymentDate: new Date('2025-01-01'),
      nextPaymentDate: new Date('2025-01-01'),
    });

    await expect(service.update('tenant-1', 'u1', 'p1', { installmentCount: 20 } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('records payment and completes plan', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue({
      id: 'p1',
      amountPaid: 50,
      remainingBalance: 50,
      installmentAmount: 25,
      installmentsPaid: 1,
      status: 'ACTIVE',
      nextPaymentDate: new Date('2025-01-01'),
    });
    prisma.paymentPlan.update.mockResolvedValue({ id: 'p1', status: 'COMPLETED' });

    const result = await service.recordPayment('tenant-1', 'u1', 'p1', { amount: 50 } as any);

    expect(result.status).toBe('COMPLETED');
    expect(prisma.paymentPlan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED', nextPaymentDate: null }) }),
    );
  });

  it('cancels payment plan', async () => {
    prisma.paymentPlan.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.paymentPlan.update.mockResolvedValue({ id: 'p1', status: 'CANCELLED' });

    const result = await service.cancel('tenant-1', 'u1', 'p1', { reason: 'Customer request' } as any);

    expect(result.status).toBe('CANCELLED');
  });

  it('generatePlanNumber throws after retries', async () => {
    prisma.paymentPlan.count.mockResolvedValue(1);

    await expect((service as any).generatePlanNumber('tenant-1', 4)).rejects.toThrow(BadRequestException);
  });
});
