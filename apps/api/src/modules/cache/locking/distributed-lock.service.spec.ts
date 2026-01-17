import { Test, TestingModule } from '@nestjs/testing';
import { DistributedLockService } from './distributed-lock.service';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('DistributedLockService', () => {
  let service: DistributedLockService;
  let prisma: any;
  let redis: any;

  beforeEach(async () => {
    prisma = {
      distributedLock: { findMany: jest.fn(), findFirst: jest.fn(), updateMany: jest.fn() },
    };
    const client = { del: jest.fn() };
    redis = { getClient: jest.fn(() => client) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DistributedLockService, { provide: PrismaService, useValue: prisma }, { provide: RedisService, useValue: redis }],
    }).compile();

    service = module.get(DistributedLockService);
  });

  it('lists active locks', async () => {
    prisma.distributedLock.findMany.mockResolvedValue([]);

    const result = await service.listActive('t1');

    expect(result).toEqual([]);
  });

  it('returns lock details', async () => {
    prisma.distributedLock.findFirst.mockResolvedValue({ lockKey: 'k1' });

    const result = await service.lockDetails('k1');

    expect(result.lockKey).toBe('k1');
  });

  it('forces release', async () => {
    prisma.distributedLock.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.forceRelease('k1');

    expect(result.released).toBe(true);
  });

  it('returns history', async () => {
    prisma.distributedLock.findMany.mockResolvedValue([]);

    const result = await service.history('k1');

    expect(result).toEqual([]);
  });
});
