import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FactoredPaymentsService } from './factored-payments.service';
import { PrismaService } from '../../../prisma.service';
import { FactoredPaymentStatus } from '../dto/enums';

describe('FactoredPaymentsService', () => {
  let service: FactoredPaymentsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      factoredPayment: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FactoredPaymentsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(FactoredPaymentsService);
  });

  it('lists payments', async () => {
    prisma.factoredPayment.findMany.mockResolvedValue([]);
    prisma.factoredPayment.count.mockResolvedValue(0);

    const result = await service.findAll('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('throws when payment missing', async () => {
    prisma.factoredPayment.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('processes payment and emits', async () => {
    prisma.factoredPayment.findFirst.mockResolvedValue({ id: 'p1', customFields: {}, paymentAmount: 100 });
    prisma.factoredPayment.update.mockResolvedValue({ id: 'p1', paymentAmount: 100, customFields: { status: FactoredPaymentStatus.PAID } });

    const result = await service.processPayment('t1', 'u1', 'p1', { status: FactoredPaymentStatus.PAID } as any);

    expect(result.customFields.status).toBe(FactoredPaymentStatus.PAID);
    expect(events.emit).toHaveBeenCalledWith('factored.payment.processed', expect.any(Object));
  });

  it('lists carrier payments', async () => {
    prisma.factoredPayment.findMany.mockResolvedValue([]);

    const result = await service.listCarrierPayments('t1', 'c1');

    expect(result).toEqual([]);
  });
});
