import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PortalPaymentStatus } from '@prisma/client';
import { PortalPaymentsService } from './portal-payments.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalPaymentsService', () => {
  let service: PortalPaymentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      invoice: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      portalPayment: { create: jest.fn(), count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
      portalSavedPaymentMethod: { create: jest.fn() },
      portalActivityLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalPaymentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalPaymentsService);
  });

  it('throws when invoices missing', async () => {
    await expect(service.makePayment('t1', 'c1', 'u1', { invoices: [] } as any)).rejects.toThrow(BadRequestException);
  });

  it('throws when invoice not found', async () => {
    prisma.invoice.findMany.mockResolvedValue([]);

    await expect(service.makePayment('t1', 'c1', 'u1', { invoices: [{ invoiceId: 'i1', amount: 10 }], amount: 10 } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates payment and logs activity', async () => {
    prisma.invoice.findMany.mockResolvedValue([{ id: 'i1', amountPaid: 0, totalAmount: 10 }]);
    prisma.portalPayment.count.mockResolvedValue(0);
    prisma.portalPayment.create.mockResolvedValue({ id: 'p1', paymentNumber: 'PAY-00001', status: PortalPaymentStatus.COMPLETED });
    prisma.invoice.findFirst.mockResolvedValue({ id: 'i1', amountPaid: 0, totalAmount: 10 });
    prisma.invoice.update.mockResolvedValue({ id: 'i1' });
    prisma.portalSavedPaymentMethod.create.mockResolvedValue({ id: 'pm1' });
    prisma.portalActivityLog.create.mockResolvedValue({ id: 'al1' });

    const result = await service.makePayment('t1', 'c1', 'u1', {
      invoices: [{ invoiceId: 'i1', amount: 10 }],
      amount: 10,
      paymentMethod: 'CARD',
      paymentToken: 'tok_1234',
      savePaymentMethod: true,
    } as any);

    expect(result.status).toBe(PortalPaymentStatus.COMPLETED);
  });

  it('returns history', async () => {
    prisma.portalPayment.findMany.mockResolvedValue([]);

    const result = await service.history('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('throws when payment missing', async () => {
    prisma.portalPayment.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'c1', 'p1')).rejects.toThrow(NotFoundException);
  });
});
