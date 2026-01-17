import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { PrismaService } from '../../prisma.service';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let prisma: {
    opportunity: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      aggregate: jest.Mock;
    };
    company: { update: jest.Mock; findUnique: jest.Mock };
    activity: { findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      opportunity: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn(),
      },
      company: { update: jest.fn(), findUnique: jest.fn() },
      activity: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpportunitiesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(OpportunitiesService);
  });

  it('findAll applies filters and paging', async () => {
    prisma.opportunity.findMany.mockResolvedValue([]);
    prisma.opportunity.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { page: 2, limit: 5, search: 'acme', stage: 'LEAD' });

    expect(prisma.opportunity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          deletedAt: null,
          stage: 'LEAD',
          name: { contains: 'acme', mode: 'insensitive' },
        }),
      }),
    );
  });

  it('throws when opportunity not found', async () => {
    prisma.opportunity.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'opp-1')).rejects.toThrow(NotFoundException);
  });

  it('creates with defaults and converts dates', async () => {
    prisma.opportunity.create.mockResolvedValue({ id: 'opp-1' });

    await service.create('tenant-1', 'user-1', {
      name: 'New Opp',
      companyId: 'cmp-1',
      expectedCloseDate: '2024-01-02',
    } as any);

    expect(prisma.opportunity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          name: 'New Opp',
          companyId: 'cmp-1',
          stage: 'LEAD',
          probability: 0,
          expectedCloseDate: new Date('2024-01-02'),
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates and sets actualCloseDate on stage change', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1', stage: 'LEAD' });
    prisma.opportunity.update.mockResolvedValue({ id: 'opp-1' });

    await service.update('tenant-1', 'opp-1', 'user-1', { stage: 'WON' } as any);

    expect(prisma.opportunity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stage: 'WON',
          actualCloseDate: expect.any(Date),
          updatedById: 'user-1',
        }),
      }),
    );
  });

  it('soft deletes opportunities', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1' });
    prisma.opportunity.update.mockResolvedValue({ id: 'opp-1' });

    await service.delete('tenant-1', 'opp-1', 'user-1');

    expect(prisma.opportunity.update).toHaveBeenCalledWith({
      where: { id: 'opp-1' },
      data: { deletedAt: expect.any(Date), updatedById: 'user-1' },
    });
  });

  it('groups pipeline by stage', async () => {
    prisma.opportunity.findMany.mockResolvedValue([
      { id: '1', stage: 'LEAD' },
      { id: '2', stage: 'NEGOTIATION' },
      { id: '3', stage: 'WON' },
    ]);

    const result = await service.getPipeline('tenant-1');

    expect(result.LEAD).toHaveLength(1);
    expect(result.NEGOTIATION).toHaveLength(1);
    expect(result.PROPOSAL).toHaveLength(0);
  });

  it('rejects invalid stage in updateStage', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1', stage: 'LEAD' });

    await expect(service.updateStage('tenant-1', 'opp-1', 'user-1', 'INVALID')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updates stage to WON and sets probability and reason', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1', stage: 'LEAD' });
    prisma.opportunity.update.mockResolvedValue({ id: 'opp-1', stage: 'WON' });

    const result = await service.updateStage('tenant-1', 'opp-1', 'user-1', 'WON', 'Price');

    expect(prisma.opportunity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stage: 'WON',
          winReason: 'Price',
          probability: 100,
          actualCloseDate: expect.any(Date),
        }),
      }),
    );
    expect(result.previousStage).toBe('LEAD');
  });

  it('prevents converting non-won opportunity', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1', stage: 'LEAD' });

    await expect(service.convertToCustomer('tenant-1', 'opp-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('converts won opportunity to customer', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1', stage: 'WON', companyId: 'cmp-1' });
    prisma.company.update.mockResolvedValue({});
    prisma.company.findUnique.mockResolvedValue({ id: 'cmp-1', name: 'Acme', contacts: [] });

    const result = await service.convertToCustomer('tenant-1', 'opp-1', 'user-1');

    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id: 'cmp-1' },
      data: { companyType: 'CUSTOMER', updatedById: 'user-1' },
    });
    expect(result.success).toBe(true);
  });

  it('returns activities with paging', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({ id: 'opp-1' });
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(0);

    await service.getActivities('tenant-1', 'opp-1', { page: 2, limit: 5 });

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it('returns stats and win rate', async () => {
    prisma.opportunity.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5);
    prisma.opportunity.aggregate.mockResolvedValue({ _sum: { estimatedValue: 2000 } });

    const result = await service.getStats('tenant-1');

    expect(result).toEqual(
      expect.objectContaining({ total: 10, won: 3, lost: 2, open: 5, winRate: 60, pipelineValue: 2000 }),
    );
  });
});
