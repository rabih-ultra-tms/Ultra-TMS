import { Test, TestingModule } from '@nestjs/testing';
import { CacheWarmerService } from './cache-warmer.service';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

describe('CacheWarmerService', () => {
  let service: CacheWarmerService;
  let prisma: { cacheConfig: { findMany: jest.Mock } };
  let redis: { setJson: jest.Mock };

  beforeEach(async () => {
    prisma = { cacheConfig: { findMany: jest.fn() } };
    redis = { setJson: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheWarmerService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get(CacheWarmerService);
  });

  it('warms cache entries and tracks warmed list', async () => {
    prisma.cacheConfig.findMany.mockResolvedValue([
      { key: 'k1', ttlSeconds: 60 },
      { key: 'k2', ttlSeconds: 120 },
    ]);
    redis.setJson.mockResolvedValue(undefined);

    const result = await service.warmCache('tenant-1');

    expect(result.warmed).toEqual(['k1', 'k2']);
    expect(result.failed).toEqual([]);
  });

  it('records failures when setJson throws', async () => {
    prisma.cacheConfig.findMany.mockResolvedValue([{ key: 'k1', ttlSeconds: 60 }]);
    redis.setJson.mockRejectedValue(new Error('boom'));

    const result = await service.warmCache('tenant-1');

    expect(result.warmed).toEqual([]);
    expect(result.failed[0]).toEqual({ key: 'k1', error: 'boom' });
  });
});