import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditLimitsService } from './credit-limits.service';
import { PrismaService } from '../../../prisma.service';

describe('CreditLimitsService', () => {
  let service: CreditLimitsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      creditLimit: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      company: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditLimitsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(CreditLimitsService);
  });

  it('throws when limit missing', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue(null);

    await expect(service.findOneByCustomer('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('prevents duplicate limit', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditLimit.findFirst.mockResolvedValue({ id: 'l1' });

    await expect(service.create('tenant-1', 'u1', { companyId: 'c1', creditLimit: 100 } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when company missing on create', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(service.create('tenant-1', 'u1', { companyId: 'c1', creditLimit: 100 } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates limit and emits event', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditLimit.findFirst.mockResolvedValue(null);
    prisma.creditLimit.create.mockResolvedValue({ id: 'l1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', creditLimit: 100 } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.limit.created', expect.any(Object));
  });

  it('creates exceeded limit when used exceeds available', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditLimit.findFirst.mockResolvedValue(null);
    prisma.creditLimit.create.mockResolvedValue({ id: 'l1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', creditLimit: 100, usedCredit: 150 } as any);

    expect(prisma.creditLimit.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'EXCEEDED' }) }),
    );
  });

  it('updates limit and emits threshold warning', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue({
      id: 'l1',
      companyId: 'c1',
      tenantId: 't1',
      usedCredit: 70,
      creditLimit: 100,
      status: 'ACTIVE',
      paymentTerms: null,
      singleLoadLimit: null,
      monthlyLimit: null,
      gracePeriodDays: 0,
      nextReviewDate: null,
      reviewFrequencyDays: 90,
    });
    prisma.creditLimit.update.mockResolvedValue({ id: 'l1', companyId: 'c1', tenantId: 't1', usedCredit: 85, creditLimit: 100 });

    await service.update('tenant-1', 'u1', 'c1', { usedCredit: 85 } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.warning.threshold', expect.any(Object));
  });

  it('updates limit and emits over-limit event', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue({
      id: 'l1',
      companyId: 'c1',
      tenantId: 't1',
      usedCredit: 100,
      creditLimit: 100,
      status: 'ACTIVE',
      paymentTerms: null,
      singleLoadLimit: null,
      monthlyLimit: null,
      gracePeriodDays: 0,
      nextReviewDate: null,
      reviewFrequencyDays: 90,
    });
    prisma.creditLimit.update.mockResolvedValue({ id: 'l1', companyId: 'c1', tenantId: 't1', usedCredit: 120, creditLimit: 100 });

    await service.update('tenant-1', 'u1', 'c1', { usedCredit: 120 } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.over.limit', expect.any(Object));
  });

  it('rejects increase with non-positive amount', async () => {
    await expect(service.increase('tenant-1', 'u1', 'c1', { increaseBy: 0 } as any)).rejects.toThrow(BadRequestException);
  });

  it('increases limit by amount', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue({
      id: 'l1',
      companyId: 'c1',
      tenantId: 't1',
      usedCredit: 20,
      creditLimit: 100,
      status: 'ACTIVE',
      paymentTerms: null,
      singleLoadLimit: null,
      monthlyLimit: null,
      gracePeriodDays: 0,
      nextReviewDate: null,
      reviewFrequencyDays: 90,
    });
    prisma.creditLimit.update.mockResolvedValue({ id: 'l1', creditLimit: 150, usedCredit: 20, companyId: 'c1', tenantId: 't1' });

    const result = await service.increase('tenant-1', 'u1', 'c1', { increaseBy: 50 } as any);

    expect(result.creditLimit).toBe(150);
  });

  it('returns zero utilization when limit is zero', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue({ id: 'l1', companyId: 'c1', tenantId: 't1', usedCredit: 0, creditLimit: 0, status: 'ACTIVE' });

    const result = await service.utilization('tenant-1', 'c1');

    expect(result.utilization).toBe(0);
  });

  it('emits threshold events on utilization', async () => {
    prisma.creditLimit.findFirst.mockResolvedValue({ id: 'l1', companyId: 'c1', tenantId: 't1', usedCredit: 90, creditLimit: 100, status: 'ACTIVE' });

    const result = await service.utilization('tenant-1', 'c1');

    expect(result.utilization).toBeGreaterThan(0);
    expect(events.emit).toHaveBeenCalled();
  });
});
