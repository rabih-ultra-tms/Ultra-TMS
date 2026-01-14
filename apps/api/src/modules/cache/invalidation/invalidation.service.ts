import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';
import { InvalidateCacheDto } from '../dto/cache.dto';

@Injectable()
export class InvalidationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly events: EventEmitter2,
  ) {}

  async invalidate(tenantId: string, dto: InvalidateCacheDto) {
    if (dto.pattern) {
      const count = await this.redis.deleteByPattern(dto.pattern);
      this.events.emit('cache.invalidated', { pattern: dto.pattern, count });
      return { pattern: dto.pattern, deleted: count };
    }

    if (dto.tags?.length) {
      let deleted = 0;
      for (const tag of dto.tags) {
        const pattern = `${tenantId}:*${tag}*`;
        deleted += await this.redis.deleteByPattern(pattern);
      }
      this.events.emit('cache.invalidated', { tags: dto.tags, count: deleted });
      return { tags: dto.tags, deleted };
    }

    return { deleted: 0 };
  }

  async rules(tenantId: string) {
    return this.prisma.cacheInvalidationRule.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async createRule(tenantId: string, userId: string | null, payload: { triggerEvent: string; cachePattern: string; invalidationType: string }) {
    return this.prisma.cacheInvalidationRule.create({
      data: {
        tenantId,
        triggerEvent: payload.triggerEvent,
        cachePattern: payload.cachePattern,
        invalidationType: payload.invalidationType,
        createdById: userId ?? undefined,
      },
    });
  }

  async deleteRule(tenantId: string, id: string) {
    await this.prisma.cacheInvalidationRule.deleteMany({ where: { id, tenantId } });
    return { deleted: true };
  }
}
