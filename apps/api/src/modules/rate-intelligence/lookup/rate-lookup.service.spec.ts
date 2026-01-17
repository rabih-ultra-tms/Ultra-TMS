import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RateLookupService } from './rate-lookup.service';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RateAggregatorService } from './rate-aggregator.service';

describe('RateLookupService', () => {
  let service: RateLookupService;
  let prisma: any;
  let redis: any;
  let aggregator: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { rateQuery: { create: jest.fn() } };
    redis = { get: jest.fn(), setWithTTL: jest.fn() };
    aggregator = { queryProviders: jest.fn(), aggregate: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLookupService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        { provide: RateAggregatorService, useValue: aggregator },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(RateLookupService);
  });

  it('returns cached rate lookup', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ id: 'q1' }));

    const result = await service.lookup('tenant-1', 'user-1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' } as any);

    expect(result).toEqual({ id: 'q1' });
    expect(prisma.rateQuery.create).not.toHaveBeenCalled();
  });

  it('creates rate lookup when cache misses', async () => {
    redis.get.mockResolvedValue(null);
    aggregator.queryProviders.mockResolvedValue([]);
    aggregator.aggregate.mockReturnValue({
      lowRate: 1,
      highRate: 2,
      averageRate: 1.5,
      confidenceLabel: 'HIGH',
      loadVolume: 1,
      truckVolume: 1,
      marketTrend: 'UP',
      cachedUntil: new Date(),
      sources: {},
      primarySource: 'INTERNAL',
    });
    prisma.rateQuery.create.mockResolvedValue({ id: 'q1' });

    const result = await service.lookup('tenant-1', 'user-1', { originState: 'TX', destState: 'CA', equipmentType: 'VAN' } as any);

    expect(result).toEqual({ id: 'q1' });
    expect(redis.setWithTTL).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('rate.query.completed', expect.any(Object));
  });

  it('batch lookup returns count', async () => {
    jest.spyOn(service, 'lookup').mockResolvedValue({ id: 'q1' } as any);

    const result = await service.batchLookup('tenant-1', 'user-1', { queries: [{ originState: 'TX', destState: 'CA', equipmentType: 'VAN' }] } as any);

    expect(result.count).toBe(1);
  });
});
