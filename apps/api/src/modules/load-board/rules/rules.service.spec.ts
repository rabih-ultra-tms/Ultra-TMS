import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostingFrequency } from '@prisma/client';
import { RulesService } from './rules.service';
import { PrismaService } from '../../../prisma.service';

describe('RulesService', () => {
  let service: RulesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      postingRule: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RulesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RulesService);
  });

  it('lists rules', async () => {
    prisma.postingRule.findMany.mockResolvedValue([]);
    prisma.postingRule.count.mockResolvedValue(0);

    const result = await service.list('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('lists rules with isActive filter and paging', async () => {
    prisma.postingRule.findMany.mockResolvedValue([{ id: 'r1' }]);
    prisma.postingRule.count.mockResolvedValue(1);

    const result = await service.list('t1', { isActive: true, page: 2, limit: 5 } as any);

    expect(prisma.postingRule.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', deletedAt: null, isActive: true },
      skip: 5,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    expect(result.totalPages).toBe(1);
  });

  it('throws when rule missing', async () => {
    prisma.postingRule.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'r1')).rejects.toThrow(NotFoundException);
  });

  it('creates rule', async () => {
    prisma.postingRule.create.mockResolvedValue({ id: 'r1', frequency: PostingFrequency.IMMEDIATE });

    const result = await service.create('t1', 'u1', { ruleName: 'Auto', autoPost: true, conditions: [] } as any);

    expect(result.id).toBe('r1');
  });

  it('creates manual rule with delay', async () => {
    prisma.postingRule.create.mockResolvedValue({ id: 'r2', frequency: PostingFrequency.MANUAL });

    await service.create('t1', 'u1', {
      ruleName: 'Manual',
      autoPost: false,
      conditions: [],
      postDelayMinutes: 15,
      postAccounts: ['acc-1'],
      rateAdjustmentType: 'flat',
      rateAdjustmentValue: 10,
      priority: 2,
      description: 'manual',
    } as any);

    expect(prisma.postingRule.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        isActive: false,
        frequency: PostingFrequency.MANUAL,
        scheduleTime: '15m',
      }),
    });
  });

  it('updates rule with conditions and custom fields', async () => {
    prisma.postingRule.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.postingRule.update.mockResolvedValue({ id: 'r1' });

    await service.update('t1', 'r1', {
      ruleName: 'Updated',
      conditions: [{ field: 'mode', operator: 'eq', value: 'FTL' }],
      postDelayMinutes: 30,
      postAccounts: ['acc-1'],
      rateAdjustmentType: 'percent',
      rateAdjustmentValue: 5,
      priority: 1,
      description: 'updated',
    } as any);

    expect(prisma.postingRule.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: expect.objectContaining({
        ruleName: 'Updated',
        conditions: [{ field: 'mode', operator: 'eq', value: 'FTL' }],
        scheduleTime: '30m',
        customFields: {
          postAccounts: ['acc-1'],
          rateAdjustmentType: 'percent',
          rateAdjustmentValue: 5,
          priority: 1,
          description: 'updated',
        },
      }),
    });
  });

  it('updates rule without optional fields', async () => {
    prisma.postingRule.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.postingRule.update.mockResolvedValue({ id: 'r1' });

    await service.update('t1', 'r1', { ruleName: 'OnlyName', isActive: true } as any);

    expect(prisma.postingRule.update).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { ruleName: 'OnlyName', isActive: true },
    });
  });

  it('throws when updating missing rule', async () => {
    prisma.postingRule.findFirst.mockResolvedValue(null);

    await expect(service.update('t1', 'r1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('removes rule', async () => {
    prisma.postingRule.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.postingRule.update.mockResolvedValue({ id: 'r1', isActive: false });

    const result = await service.remove('t1', 'r1');

    expect(result.success).toBe(true);
  });
});
