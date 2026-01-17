import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { KpisService } from './kpis.service';
import { PrismaService } from '../../prisma.service';

describe('KpisService', () => {
  let service: KpisService;
  let prisma: {
    kPIDefinition: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    kPISnapshot: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      kPIDefinition: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      kPISnapshot: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [KpisService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(KpisService);
  });

  it('lists kpis with category and status', async () => {
    prisma.kPIDefinition.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'FINANCIAL' as any, 'ACTIVE');

    expect(prisma.kPIDefinition.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          category: 'FINANCIAL',
          status: 'ACTIVE',
          deletedAt: null,
        }),
      }),
    );
  });

  it('throws when KPI not found', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'k1')).rejects.toThrow(NotFoundException);
  });

  it('prevents duplicate KPI code', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1' });

    await expect(
      service.create('tenant-1', 'user-1', { code: 'KPI1' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('creates KPI with defaults', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue(null);
    prisma.kPIDefinition.create.mockResolvedValue({ id: 'k1' });

    await service.create('tenant-1', 'user-1', {
      code: 'KPI1',
      name: 'KPI',
      category: 'FINANCIAL',
      aggregationType: 'SUM',
    } as any);

    expect(prisma.kPIDefinition.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          code: 'KPI1',
          status: 'ACTIVE',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates KPI after fetching', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1' });
    prisma.kPIDefinition.update.mockResolvedValue({ id: 'k1' });

    await service.update('tenant-1', 'user-1', 'k1', { name: 'New' } as any);

    expect(prisma.kPIDefinition.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'k1' },
        data: expect.objectContaining({ name: 'New', updatedById: 'user-1' }),
      }),
    );
  });

  it('soft deletes KPI', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1' });
    prisma.kPIDefinition.update.mockResolvedValue({ id: 'k1' });

    const result = await service.remove('tenant-1', 'k1');

    expect(result).toEqual({ success: true });
    expect(prisma.kPIDefinition.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'k1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), status: 'INACTIVE' }),
      }),
    );
  });

  it('returns KPI values with snapshot range', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1' });
    prisma.kPISnapshot.findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }]);

    const result = await service.values('tenant-1', 'k1', {
      startDate: '2025-01-01',
      endDate: '2025-01-05',
    } as any);

    expect(result.count).toBe(2);
    expect(prisma.kPISnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          kpiDefinitionId: 'k1',
          deletedAt: null,
        }),
      }),
    );
  });

  it('returns current values with latest snapshots', async () => {
    prisma.kPIDefinition.findMany.mockResolvedValue([
      { id: 'k1', code: 'K1', name: 'KPI1', category: 'FINANCIAL' },
      { id: 'k2', code: 'K2', name: 'KPI2', category: 'OPS' },
    ]);
    prisma.kPISnapshot.findFirst
      .mockResolvedValueOnce({ value: 10, comparisonValue: 8, trendDirection: 'UP', snapshotDate: new Date('2025-01-01') })
      .mockResolvedValueOnce(null);

    const result = await service.currentValues('tenant-1');

    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('currentValue', 10);
    expect(result[1]).toHaveProperty('currentValue', null);
  });

  it('calculates KPI snapshot and sets trend', async () => {
    prisma.kPIDefinition.findFirst.mockResolvedValue({ id: 'k1' });
    prisma.kPISnapshot.findFirst.mockResolvedValue({ value: 20 });
    prisma.kPISnapshot.create.mockResolvedValue({ id: 's1' });

    const result = await service.calculate('tenant-1', 'k1', {
      snapshotDate: '2025-01-10',
    } as any);

    expect(result).toEqual({ id: 's1' });
    expect(prisma.kPISnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', kpiDefinitionId: 'k1' }),
      }),
    );
  });
});