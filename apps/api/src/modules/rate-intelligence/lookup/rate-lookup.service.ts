import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, RateProvider } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';
import { BatchRateLookupDto } from './dto/batch-rate-lookup.dto';
import { RateLookupDto } from './dto/rate-lookup.dto';
import { RateAggregatorService } from './rate-aggregator.service';

@Injectable()
export class RateLookupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly aggregator: RateAggregatorService,
    private readonly events: EventEmitter2,
  ) {}

  async lookup(tenantId: string, userId: string, dto: RateLookupDto) {
    const providers = dto.providers?.length
      ? dto.providers.map((p) => p.toUpperCase())
      : Object.values(RateProvider);

    const cacheKey = this.buildCacheKey(tenantId, dto, providers);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as any);
    }

    const providerResults = await this.aggregator.queryProviders(tenantId, dto, providers);
    const aggregated = this.aggregator.aggregate(providerResults);

    const primaryProvider = this.toPrismaProvider(aggregated.primarySource);

    const record = await this.prisma.rateQuery.create({
      data: {
        tenantId,
        originCity: dto.originCity ?? '',
        originState: dto.originState,
        originZip: dto.originZip,
        destCity: dto.destCity ?? '',
        destState: dto.destState,
        destZip: dto.destZip,
        equipmentType: dto.equipmentType,
        provider: primaryProvider,
        lowRate: new Prisma.Decimal(aggregated.lowRate),
        highRate: new Prisma.Decimal(aggregated.highRate),
        avgRate: new Prisma.Decimal(aggregated.averageRate),
        confidence: aggregated.confidenceLabel,
        loadVolume: aggregated.loadVolume,
        truckVolume: aggregated.truckVolume,
        marketTrend: aggregated.marketTrend,
        queryHash: cacheKey,
        cachedUntil: aggregated.cachedUntil,
        customFields: aggregated.sources as unknown as Prisma.InputJsonValue,
        createdById: userId,
      },
    });

    await this.redis.setWithTTL(cacheKey, JSON.stringify(record), 3600);
    this.events.emit('rate.query.completed', { queryId: record.id, results: aggregated });
    return record;
  }

  async batchLookup(tenantId: string, userId: string, dto: BatchRateLookupDto) {
    const results = [] as any[];
    for (const query of dto.queries) {
      const result = await this.lookup(tenantId, userId, query);
      results.push(result);
    }
    return { count: results.length, results };
  }

  private buildCacheKey(tenantId: string, dto: RateLookupDto, providers: string[]) {
    const parts = [
      tenantId,
      dto.originState,
      dto.destState,
      dto.equipmentType,
      dto.originZip ?? '',
      dto.destZip ?? '',
      ...providers.map((p) => p.toString()).sort(),
    ];
    return `rate:${parts.join(':')}`;
  }

  private toPrismaProvider(source: string): RateProvider {
    const upper = source.toUpperCase();
    if (upper === 'DAT') return RateProvider.DAT;
    if (upper === 'TRUCKSTOP') return RateProvider.TRUCKSTOP;
    return RateProvider.INTERNAL;
  }
}
