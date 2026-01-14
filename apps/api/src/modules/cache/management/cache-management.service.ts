import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CacheStatsService } from '../stats/cache-stats.service';
import { InvalidationService } from '../invalidation/invalidation.service';
import { CacheWarmerService } from '../warming/cache-warmer.service';
import { InvalidateCacheDto } from '../dto/cache.dto';

@Injectable()
export class CacheManagementService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
    private readonly stats: CacheStatsService,
    private readonly invalidation: InvalidationService,
    private readonly warmer: CacheWarmerService,
    private readonly events: EventEmitter2,
  ) {}

  async health() {
    const ping = await this.redis.ping();
    return { status: 'ok', redis: ping };
  }

  async statsForTenant(tenantId?: string) {
    return this.stats.recent(tenantId);
  }

  async listKeys(pattern = '*') {
    return this.redis.keys(pattern);
  }

  async deleteByPattern(pattern: string) {
    const deleted = await this.redis.deleteByPattern(pattern);
    await this.stats.recordDelete(null, 'GENERIC', deleted);
    this.events.emit('cache.invalidated', { pattern, count: deleted });
    return { pattern, deleted };
  }

  async invalidate(tenantId: string, dto: InvalidateCacheDto) {
    return this.invalidation.invalidate(tenantId, dto);
  }

  async warm(tenantId: string, configKey?: string) {
    return this.warmer.warmCache(tenantId, configKey);
  }
}
