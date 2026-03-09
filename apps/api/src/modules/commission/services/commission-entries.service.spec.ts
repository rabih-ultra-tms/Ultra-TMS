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
    expect(result.entry?.id).toBe('entry-1');
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

  // ── QS-015: Financial Calculation Tests ──────────────────────────────

  describe('Financial Calculations', () => {
    it('calculates percentage-based commission on margin (10% of $5,000 margin = $500)', async () => {
      // Revenue $12,000, cost $7,000, margin $5,000. 10% margin commission = $500
      prisma.load.findFirst.mockResolvedValue({
        id: 'load-1',
        orderId: 'order-1',
        loadNumber: 'LD2026030100',
        totalCost: 7000,
        order: { totalCharges: 12000, salesRep: { id: 'rep-1' } },
      });
      prisma.userCommissionAssignment.findFirst.mockResolvedValue({
        userId: 'rep-1',
        overrideRate: null,
        plan: {
          id: 'plan-margin',
          planType: 'PERCENT_MARGIN',
          percentRate: 10,
          calculationBasis: 'NET_MARGIN',
          minimumMarginPercent: null,
        },
      });
      prisma.commissionEntry.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'entry-1', ...data }),
      );

      const result = await service.calculateLoadCommission('tenant-1', 'load-1', 'user-1');

      expect(result.eligible).toBe(true);
      expect(result.calculation!.revenue).toBe(12000);
      expect(result.calculation!.cost).toBe(7000);
      expect(result.calculation!.margin).toBe(5000);
      expect(result.calculation!.rate).toBe(10);
      expect(result.calculation!.commissionAmount).toBe(500); // 10% of $5,000
    });

    it('calculates flat-rate commission ($75 per load regardless of revenue)', async () => {
      // Flat fee plan: $75 per delivered load, regardless of revenue or margin
      prisma.load.findFirst.mockResolvedValue({
        id: 'load-2',
        orderId: 'order-2',
        loadNumber: 'LD2026030201',
        totalCost: 1800,
        order: { totalCharges: 2200, salesRep: { id: 'rep-2' } },
      });
      prisma.userCommissionAssignment.findFirst.mockResolvedValue({
        userId: 'rep-2',
        overrideRate: null,
        plan: {
          id: 'plan-flat',
          planType: 'FLAT_FEE',
          flatAmount: 75,
          percentRate: null,
          calculationBasis: null,
          minimumMarginPercent: null,
        },
      });
      prisma.commissionEntry.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'entry-2', ...data }),
      );

      const result = await service.calculateLoadCommission('tenant-1', 'load-2', 'user-1');

      expect(result.eligible).toBe(true);
      expect(result.calculation!.commissionAmount).toBe(75);
      // Flat fee should NOT vary with margin
      expect(result.calculation!.margin).toBe(400); // 2200 - 1800
      expect(result.calculation!.commissionAmount).not.toBe(result.calculation!.margin * 0.1);
    });

    it('calculates percentage-based commission on revenue (5% of $8,500 revenue = $425)', async () => {
      // Revenue-based plan: 5% of gross revenue, not margin
      prisma.load.findFirst.mockResolvedValue({
        id: 'load-3',
        orderId: 'order-3',
        loadNumber: 'LD2026030305',
        totalCost: 6200,
        order: { totalCharges: 8500, salesRep: { id: 'rep-3' } },
      });
      prisma.userCommissionAssignment.findFirst.mockResolvedValue({
        userId: 'rep-3',
        overrideRate: null,
        plan: {
          id: 'plan-revenue',
          planType: 'PERCENT_REVENUE',
          percentRate: 5,
          flatAmount: null,
          calculationBasis: 'GROSS_REVENUE',
          minimumMarginPercent: null,
        },
      });
      prisma.commissionEntry.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'entry-3', ...data }),
      );

      const result = await service.calculateLoadCommission('tenant-1', 'load-3', 'user-1');

      expect(result.eligible).toBe(true);
      expect(result.calculation!.revenue).toBe(8500);
      expect(result.calculation!.commissionAmount).toBe(425); // 5% of $8,500
      // Revenue-based commission should differ from margin-based
      const marginBasedWouldBe = (8500 - 6200) * 0.05; // $115
      expect(result.calculation!.commissionAmount).not.toBe(marginBasedWouldBe);
    });
  });
});
