import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommissionPlansService } from './commission-plans.service';
import { PrismaService } from '../../../prisma.service';

describe('CommissionPlansService', () => {
  let service: CommissionPlansService;
  let prisma: {
    commissionPlan: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      commissionPlan: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionPlansService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CommissionPlansService);
  });

  it('findAll filters by deletedAt', async () => {
    prisma.commissionPlan.findMany.mockResolvedValue([]);
    prisma.commissionPlan.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { page: 1, limit: 20 });

    expect(prisma.commissionPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null }),
      }),
    );
  });

  it('throws when plan not found', async () => {
    prisma.commissionPlan.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'plan-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('soft deletes plan', async () => {
    prisma.commissionPlan.findFirst.mockResolvedValue({ id: 'plan-1' });
    prisma.commissionPlan.update.mockResolvedValue({ id: 'plan-1' });

    await service.remove('tenant-1', 'plan-1');

    expect(prisma.commissionPlan.update).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('creates commission plan with tiers', async () => {
    prisma.commissionPlan.create.mockResolvedValue({ id: 'plan-1', tiers: [{ tierNumber: 1 }] });

    const result = await service.create('tenant-1', {
      name: 'Standard',
      planType: 'PERCENT',
      effectiveDate: new Date().toISOString(),
      percentRate: 0.1,
      calculationBasis: 'GROSS_MARGIN',
      tiers: [{ tierNumber: 1, tierName: 'Tier 1', thresholdType: 'VOLUME', rateType: 'PERCENT', rateAmount: 0.1 }],
    } as any, 'user-1');

    expect((result as any).id).toBe('plan-1');
    expect(prisma.commissionPlan.create).toHaveBeenCalled();
  });

  it('updates existing plan', async () => {
    prisma.commissionPlan.findFirst.mockResolvedValue({ id: 'plan-1' });
    prisma.commissionPlan.update.mockResolvedValue({ id: 'plan-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'plan-1', { name: 'Updated' } as any);

    expect((result as any).name).toBe('Updated');
  });

  it('gets active plans', async () => {
    prisma.commissionPlan.findMany.mockResolvedValue([{ id: 'plan-1' }]);

    const result = await service.getActive('tenant-1');

    expect(result).toEqual([{ id: 'plan-1' }]);
  });
});
