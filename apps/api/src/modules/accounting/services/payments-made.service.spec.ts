import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsMadeService } from './payments-made.service';
import { PrismaService } from '../../../prisma.service';

describe('PaymentsMadeService', () => {
  let service: PaymentsMadeService;
  let prisma: {
    paymentMade: { findFirst: jest.Mock; update: jest.Mock; create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    settlement: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      paymentMade: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      settlement: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsMadeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PaymentsMadeService);
  });

  it('throws when payment not found on update', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue(null);

    await expect(service.update('pay-1', 'tenant-1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects update for cleared payment', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1', status: 'CLEARED' });

    await expect(service.update('pay-1', 'tenant-1', {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects void for cleared payment', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1', status: 'CLEARED' });

    await expect(service.voidPayment('pay-1', 'tenant-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates payment with generated number', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue(null);
    prisma.paymentMade.create.mockResolvedValue({ id: 'pay-1', paymentNumber: 'PAY-000001' });

    const result = await service.create('tenant-1', 'user-1', {
      carrierId: 'car-1',
      paymentDate: new Date().toISOString(),
      paymentMethod: 'CHECK',
      amount: 100,
    } as any);

    expect(result.paymentNumber).toBe('PAY-000001');
    expect(prisma.paymentMade.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdById: 'user-1' }),
      }),
    );
  });

  it('returns payments list with total', async () => {
    prisma.paymentMade.findMany.mockResolvedValue([{ id: 'pay-1' }]);
    prisma.paymentMade.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { status: 'PENDING' });

    expect(result).toEqual({ payments: [{ id: 'pay-1' }], total: 1 });
    expect(prisma.paymentMade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1', status: 'PENDING' }) }),
    );
  });

  it('finds payment by id', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1' });

    const result = await service.findOne('pay-1', 'tenant-1');

    expect(result).toEqual({ id: 'pay-1' });
  });

  it('marks payment sent', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1' });
    prisma.paymentMade.update.mockResolvedValue({ id: 'pay-1', status: 'SENT' });

    const result = await service.markSent('pay-1', 'tenant-1');

    expect(result.status).toBe('SENT');
    expect(prisma.paymentMade.update).toHaveBeenCalledWith({ where: { id: 'pay-1' }, data: { status: 'SENT' } });
  });

  it('marks payment cleared', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1' });
    prisma.paymentMade.update.mockResolvedValue({ id: 'pay-1', status: 'CLEARED' });

    const result = await service.markCleared('pay-1', 'tenant-1');

    expect(result.status).toBe('CLEARED');
    expect(prisma.paymentMade.update).toHaveBeenCalledWith({ where: { id: 'pay-1' }, data: { status: 'CLEARED' } });
  });

  it('voids payment when not cleared', async () => {
    prisma.paymentMade.findFirst.mockResolvedValue({ id: 'pay-1', status: 'SENT' });
    prisma.paymentMade.update.mockResolvedValue({ id: 'pay-1', status: 'VOID' });

    const result = await service.voidPayment('pay-1', 'tenant-1');

    expect(result.status).toBe('VOID');
  });

  it('returns payment run summary groups', async () => {
    prisma.settlement.findMany.mockResolvedValue([
      { id: 's1', balanceDue: 100, payToFactoring: false, carrier: { paymentTerms: 'QUICK_PAY', factoringCompany: null } },
      { id: 's2', balanceDue: 200, payToFactoring: true, carrier: { paymentTerms: 'NET30', factoringCompany: null } },
      { id: 's3', balanceDue: 300, payToFactoring: false, carrier: { paymentTerms: 'NET30', factoringCompany: null } },
    ] as any);

    const result = await service.getPaymentRunSummary('tenant-1');

    expect(result.quickPay.count).toBe(1);
    expect(result.factoring.count).toBe(1);
    expect(result.regular.count).toBe(1);
    expect(result.grandTotal).toBe(600);
  });
});
