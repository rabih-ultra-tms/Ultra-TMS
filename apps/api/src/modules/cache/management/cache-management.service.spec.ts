import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheManagementService } from './cache-management.service';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CacheStatsService } from '../stats/cache-stats.service';
import { InvalidationService } from '../invalidation/invalidation.service';
import { CacheWarmerService } from '../warming/cache-warmer.service';

describe('CacheManagementService', () => {
  let service: CacheManagementService;
  let redis: { ping: jest.Mock; keys: jest.Mock; deleteByPattern: jest.Mock };
  let stats: { recent: jest.Mock; recordDelete: jest.Mock };
  let invalidation: { invalidate: jest.Mock };
  let warmer: { warmCache: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    redis = { ping: jest.fn(), keys: jest.fn(), deleteByPattern: jest.fn() };
    stats = { recent: jest.fn(), recordDelete: jest.fn() };
    invalidation = { invalidate: jest.fn() };
    warmer = { warmCache: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheManagementService,
        { provide: RedisService, useValue: redis },
        { provide: PrismaService, useValue: {} },
        { provide: CacheStatsService, useValue: stats },
        { provide: InvalidationService, useValue: invalidation },
        { provide: CacheWarmerService, useValue: warmer },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(CacheManagementService);
  });

  it('returns health ping', async () => {
    redis.ping.mockResolvedValue('PONG');

    const result = await service.health();

    expect(result).toEqual({ status: 'ok', redis: 'PONG' });
  });

  it('returns stats for tenant', async () => {
    stats.recent.mockResolvedValue([{ id: 's1' }]);

    const result = await service.statsForTenant('tenant-1');

    expect(result).toEqual([{ id: 's1' }]);
    expect(stats.recent).toHaveBeenCalledWith('tenant-1');
  });

  it('lists keys by pattern', async () => {
    redis.keys.mockResolvedValue(['k1']);

    const result = await service.listKeys('t:*');

    expect(result).toEqual(['k1']);
    expect(redis.keys).toHaveBeenCalledWith('t:*');
  });

  it('deletes by pattern and emits invalidation', async () => {
    redis.deleteByPattern.mockResolvedValue(4);

    const result = await service.deleteByPattern('t:*');

    expect(result).toEqual({ pattern: 't:*', deleted: 4 });
    expect(stats.recordDelete).toHaveBeenCalledWith(null, 'GENERIC', 4);
    expect(events.emit).toHaveBeenCalledWith('cache.invalidated', { pattern: 't:*', count: 4 });
  });

  it('delegates to invalidation service', async () => {
    invalidation.invalidate.mockResolvedValue({ deleted: 1 });

    const result = await service.invalidate('tenant-1', { pattern: 'x:*' } as any);

    expect(result).toEqual({ deleted: 1 });
    expect(invalidation.invalidate).toHaveBeenCalledWith('tenant-1', { pattern: 'x:*' });
  });

  it('warms cache via warmer', async () => {
    warmer.warmCache.mockResolvedValue({ warmed: ['k1'], failed: [] });

    const result = await service.warm('tenant-1', 'cfg');

    expect(result).toEqual({ warmed: ['k1'], failed: [] });
    expect(warmer.warmCache).toHaveBeenCalledWith('tenant-1', 'cfg');
  });
});