import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChangeHistoryService } from './change-history.service';
import { PrismaService } from '../../../prisma.service';

describe('ChangeHistoryService', () => {
  let service: ChangeHistoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { changeHistory: { findMany: jest.fn(), count: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangeHistoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ChangeHistoryService);
  });

  it('lists change history', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([]);
    prisma.changeHistory.count.mockResolvedValue(0);

    const result = await service.list('tenant-1', 'ORDER', 'o1', {} as any);

    expect(result.total).toBe(0);
  });

  it('lists change history with field and date filters', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([]);
    prisma.changeHistory.count.mockResolvedValue(0);

    await service.list('tenant-1', 'ORDER', 'o1', {
      field: 'status',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      limit: 10,
      offset: 5,
    } as any);

    expect(prisma.changeHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          entityType: 'ORDER',
          entityId: 'o1',
          field: 'status',
          createdAt: expect.objectContaining({
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          }),
        }),
        take: 10,
        skip: 5,
      }),
    );
  });

  it('lists change history by entity type', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([{ id: 'ch-1' }]);
    prisma.changeHistory.count.mockResolvedValue(1);

    const result = await service.listByEntityType('tenant-1', 'ORDER', { limit: 2 } as any);

    expect(prisma.changeHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', entityType: 'ORDER' }),
        take: 2,
      }),
    );
    expect(result.total).toBe(1);
  });

  it('returns versions', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([{ field: 'status', createdAt: new Date(), userId: 'u1' }]);

    const result = await service.versions('tenant-1', 'ORDER', 'o1');

    expect(result[0]?.version).toBe(1);
  });

  it('returns version details for valid version', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([
      { id: 'ch-1', tenantId: 'tenant-1', entityType: 'ORDER', entityId: 'o1', field: 'status', oldValue: 'OPEN', newValue: 'CLOSED', userId: 'u1', createdAt: new Date() },
      { id: 'ch-2', tenantId: 'tenant-1', entityType: 'ORDER', entityId: 'o1', field: 'amount', oldValue: '1', newValue: '2', userId: 'u2', createdAt: new Date() },
    ]);

    const result = await service.versionDetails('tenant-1', 'ORDER', 'o1', 2);

    expect(result).toEqual(
      expect.objectContaining({
        version: 2,
        totalVersions: 2,
        change: expect.objectContaining({ id: 'ch-2', field: 'amount' }),
      }),
    );
  });

  it('throws when version missing', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([]);

    await expect(service.versionDetails('tenant-1', 'ORDER', 'o1', 2)).rejects.toThrow(NotFoundException);
  });

  it('throws when version is less than 1', async () => {
    prisma.changeHistory.findMany.mockResolvedValue([{ id: 'ch-1' }]);

    await expect(service.versionDetails('tenant-1', 'ORDER', 'o1', 0)).rejects.toThrow(NotFoundException);
  });
});
