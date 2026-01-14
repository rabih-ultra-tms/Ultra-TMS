import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ConfigCategory } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { ConfigHistoryService } from '../history/config-history.service';
import { UpdateSystemConfigDto } from '../dto';

@Injectable()
export class SystemConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly cache: ConfigCacheService,
    private readonly history: ConfigHistoryService,
  ) {}

  async list() {
    const cached = await this.cache.getSystemList();
    if (cached) return cached;

    const configs = await this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } });
    await this.cache.setSystemList(configs);
    return configs;
  }

  async categories() {
    const configs = await this.list();
    const unique = new Set<ConfigCategory>();
    for (const cfg of configs) unique.add(cfg.category);
    return Array.from(unique.values());
  }

  async get(key: string) {
    const cached = await this.cache.getSystem(key);
    if (cached) return cached;

    const config = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!config) throw new NotFoundException('Config not found');

    await this.cache.setSystem(key, config);
    return config;
  }

  async update(key: string, dto: UpdateSystemConfigDto, userId?: string | null) {
    const existing = await this.prisma.systemConfig.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException('Config not found');

    const updated = await this.prisma.systemConfig.update({
      where: { key },
      data: {
        value: dto.value as Prisma.InputJsonValue,
        updatedById: userId ?? undefined,
      },
    });

    await this.cache.invalidateSystem(key);
    await this.cache.setSystem(key, updated);

    await this.history.record({
      tenantId: 'system',
      key,
      oldValue: existing.value as Prisma.InputJsonValue,
      newValue: updated.value as Prisma.InputJsonValue,
      changedBy: userId ?? null,
      reason: dto.changeReason ?? null,
    });

    this.events.emit('config.system.updated', { key, oldValue: existing.value, newValue: updated.value });
    return updated;
  }

  async validate(key: string, value: unknown) {
    // Placeholder validation; extend with schema-based checks if needed
    await this.get(key);
    return { valid: true, key, value };
  }
}
