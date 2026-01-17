import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommissionEntriesService } from './commission-entries.service';
import { PrismaService } from '../../../prisma.service';

describe('CommissionEntriesService', () => {
  let service: CommissionEntriesService;
  let prisma: {
    commissionEntry: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
    load: { findFirst: jest.Mock };
    userCommissionAssignment: { findFirst: jest.Mock };
    commissionPlan: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      commissionEntry: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      load: { findFirst: jest.fn() },
      userCommissionAssignment: { findFirst: jest.fn() },
      commissionPlan: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionEntriesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CommissionEntriesService);
  });

  it('throws when entry not found', async () => {
    prisma.commissionEntry.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'entry-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects approval if not pending', async () => {
    prisma.commissionEntry.findFirst.mockResolvedValue({ id: 'entry-1', status: 'APPROVED' });

    await expect(
      service.approve('tenant-1', 'entry-1', {} as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects reversal if already reversed', async () => {
    prisma.commissionEntry.findFirst.mockResolvedValue({ id: 'entry-1', status: 'REVERSED' });

    await expect(
      service.reverse('tenant-1', 'entry-1', { reversalReason: 'dup' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('calculates earnings totals', async () => {
    prisma.commissionEntry.findMany.mockResolvedValue([
      { commissionAmount: 100 },
      { commissionAmount: 50.5 },
    ]);

    const result = await service.getUserEarnings(
      'tenant-1',
      'user-1',
      new Date('2025-01-01'),
      new Date('2025-01-31'),
    );

    expect(result.totalEarnings).toBe(150.5);
    expect(result.entryCount).toBe(2);
  });

  it('creates commission entry', async () => {
    prisma.commissionEntry.create.mockResolvedValue({ id: 'entry-1' });

    const result = await service.create('tenant-1', {
      userId: 'user-1',
      loadId: 'load-1',
      orderId: 'order-1',
      entryType: 'LOAD',
      planId: 'plan-1',
      calculationBasis: 'GROSS_MARGIN',
      basisAmount: 1000,
      rateApplied: 0.1,
      commissionAmount: 100,
      commissionPeriod: new Date('2026-01-01').toISOString(),
    } as any, 'user-2');

    expect(result.id).toBe('entry-1');
  });

  it('finds entries with filters', async () => {
    prisma.commissionEntry.findMany.mockResolvedValue([{ id: 'entry-1' }]);

    const result = await service.findAll('tenant-1', 'user-1', 'APPROVED', '2026-01-01');

    expect(result).toEqual([{ id: 'entry-1' }]);
  });

  it('approves pending entry', async () => {
    prisma.commissionEntry.findFirst.mockResolvedValue({ id: 'entry-1', status: 'PENDING' });
    prisma.commissionEntry.update.mockResolvedValue({ id: 'entry-1', status: 'APPROVED' });

    const result = await service.approve('tenant-1', 'entry-1', {} as any);

    expect(result.status).toBe('APPROVED');
  });

  it('reverses entry with reason', async () => {
    prisma.commissionEntry.findFirst.mockResolvedValue({ id: 'entry-1', status: 'APPROVED' });
    prisma.commissionEntry.update.mockResolvedValue({ id: 'entry-1', status: 'REVERSED' });

    const result = await service.reverse('tenant-1', 'entry-1', { reversalReason: 'error' } as any, 'user-1');

    expect(result.status).toBe('REVERSED');
  });

  it('calculates load commission with flat fee', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'load-1',
      orderId: 'order-1',
      loadNumber: 'LD1',
      totalCost: 500,
      order: { totalCharges: 1000, salesRep: { id: 'rep-1' } },
    });
    prisma.userCommissionAssignment.findFirst.mockResolvedValue({
      userId: 'rep-1',
      overrideRate: null,
      plan: { id: 'plan-1', planType: 'FLAT_FEE', flatAmount: 100 },
    });
    prisma.commissionEntry.create.mockResolvedValue({ id: 'entry-1' });

    const result = await service.calculateLoadCommission('tenant-1', 'load-1', 'user-1');

    expect(result.eligible).toBe(true);
    expect(result.entry.id).toBe('entry-1');
  });

  it('returns ineligible when below minimum margin', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'load-1',
      orderId: 'order-1',
      loadNumber: 'LD1',
      totalCost: 900,
      order: { totalCharges: 1000, salesRep: { id: 'rep-1' } },
    });
    prisma.userCommissionAssignment.findFirst.mockResolvedValue({
      userId: 'rep-1',
      overrideRate: null,
      plan: { id: 'plan-1', planType: 'PERCENT_MARGIN', percentRate: 10, minimumMarginPercent: 20 },
    });

    const result = await service.calculateLoadCommission('tenant-1', 'load-1', 'user-1');

    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Below minimum margin requirement');
  });
});
