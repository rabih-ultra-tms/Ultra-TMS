import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { UpdateCacheConfigDto } from '../dto/cache.dto';

@Injectable()
export class CacheConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async listConfigs(tenantId: string) {
    return this.prisma.cacheConfig.findMany({ where: { tenantId } });
  }

  async updateConfig(tenantId: string, key: string, dto: UpdateCacheConfigDto) {
    const existing = await this.prisma.cacheConfig.findFirst({ where: { tenantId, key } });
    if (!existing) {
      throw new NotFoundException('Cache config not found');
    }

    return this.prisma.cacheConfig.update({
      where: { tenantId_cacheType_key: { tenantId, cacheType: existing.cacheType, key } },
      data: {
        ttlSeconds: dto.ttlSeconds ?? existing.ttlSeconds,
        tags: (dto.tags as string[] | undefined) ?? existing.tags,
        customFields: (existing.customFields as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        updatedAt: new Date(),
      },
    });
  }

  async listRules(tenantId: string) {
    return this.prisma.cacheInvalidationRule.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }
}
