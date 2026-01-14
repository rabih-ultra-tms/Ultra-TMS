import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CacheWarmerService {
  private readonly logger = new Logger(CacheWarmerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async warmCache(tenantId: string, configKey?: string) {
    const configs = await this.prisma.cacheConfig.findMany({ where: configKey ? { tenantId, key: configKey } : { tenantId } });

    const results: { warmed: string[]; failed: { key: string; error: string }[] } = {
      warmed: [],
      failed: [],
    };

    for (const cfg of configs) {
      try {
        await this.redis.setJson(cfg.key, { warmedAt: new Date().toISOString() }, cfg.ttlSeconds ?? undefined);
        results.warmed.push(cfg.key);
      } catch (error: any) {
        this.logger.warn(`Warm failed for ${cfg.key}: ${error?.message}`);
        results.failed.push({ key: cfg.key, error: error?.message ?? 'unknown' });
      }
    }

    return results;
  }
}
