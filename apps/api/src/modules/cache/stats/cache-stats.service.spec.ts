import { Test, TestingModule } from '@nestjs/testing';
import { CacheStatsService } from './cache-stats.service';
import { PrismaService } from '../../../prisma.service';

describe('CacheStatsService', () => {
  let service: CacheStatsService;
  let prisma: {
    cacheStats: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      cacheStats: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheStatsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CacheStatsService);
  });

  it('lists recent stats with tenant filter', async () => {
    prisma.cacheStats.findMany.mockResolvedValue([]);

    await service.recent('tenant-1');

    expect(prisma.cacheStats.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' }, take: 48 }),
    );
  });

  it('increments hits when stat exists', async () => {
    prisma.cacheStats.findFirst.mockResolvedValue({ id: 'stat-1' });
    prisma.cacheStats.update.mockResolvedValue({ id: 'stat-1' });

    await service.recordHit('tenant-1', 'loads');

    expect(prisma.cacheStats.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'stat-1' },
        data: { hits: { increment: 1 } },
      }),
    );
  });

  it('creates hits record when missing', async () => {
    prisma.cacheStats.findFirst.mockResolvedValue(null);
    prisma.cacheStats.create.mockResolvedValue({ id: 'stat-1' });

    await service.recordHit(null, 'loads');

    expect(prisma.cacheStats.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cacheType: 'loads', hits: 1, misses: 0, sets: 0 }),
      }),
    );
  });

  it('increments misses when stat exists', async () => {
    prisma.cacheStats.findFirst.mockResolvedValue({ id: 'stat-1' });
    prisma.cacheStats.update.mockResolvedValue({ id: 'stat-1' });

    await service.recordMiss('tenant-1', 'loads');

    expect(prisma.cacheStats.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { misses: { increment: 1 } } }),
    );
  });

  it('increments sets when stat exists', async () => {
    prisma.cacheStats.findFirst.mockResolvedValue({ id: 'stat-1' });
    prisma.cacheStats.update.mockResolvedValue({ id: 'stat-1' });

    await service.recordSet('tenant-1', 'loads');

    expect(prisma.cacheStats.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { sets: { increment: 1 } } }),
    );
  });

  it('increments deletes by count', async () => {
    prisma.cacheStats.findFirst.mockResolvedValue({ id: 'stat-1' });
    prisma.cacheStats.update.mockResolvedValue({ id: 'stat-1' });

    await service.recordDelete('tenant-1', 'loads', 3);

    expect(prisma.cacheStats.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { deletes: { increment: 3 } } }),
    );
  });
});