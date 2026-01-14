import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, DataType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { ConfigHistoryService } from '../history/config-history.service';
import { BulkUpdateConfigDto, SetTenantConfigDto } from '../dto';

@Injectable()
export class TenantConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly cache: ConfigCacheService,
    private readonly history: ConfigHistoryService,
  ) {}

  async list(tenantId: string) {
    const cached = await this.cache.getTenantList(tenantId);
    if (cached) return cached;

    const [tenantConfigs, systemConfigs] = await this.prisma.$transaction([
      this.prisma.tenantConfig.findMany({ where: { tenantId }, orderBy: { configKey: 'asc' } }),
      this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } }),
    ]);

    await this.cache.setSystemList(systemConfigs);

    const merged = new Map<string, any>();

    for (const sys of systemConfigs) {
      merged.set(sys.key, {
        key: sys.key,
        configKey: sys.key,
        value: sys.value,
        configValue: sys.value,
        category: sys.category,
        dataType: sys.dataType,
        source: 'system',
      });
    }

    for (const cfg of tenantConfigs) {
      merged.set(cfg.configKey, {
        ...cfg,
        key: cfg.configKey,
        value: cfg.configValue,
        source: 'tenant',
      });
    }

    const result = Array.from(merged.values()).sort((a, b) => a.key.localeCompare(b.key));
    await this.cache.setTenantList(tenantId, result);
    return result;
  }

  async get(tenantId: string, key: string) {
    const cached = await this.cache.getTenant(tenantId, key);
    if (cached) return cached;

    const tenantConfig = await this.prisma.tenantConfig.findUnique({
      where: { tenantId_configKey: { tenantId, configKey: key } },
    });

    if (tenantConfig) {
      const payload = { ...tenantConfig, key: tenantConfig.configKey, value: tenantConfig.configValue, source: 'tenant' };
      await this.cache.setTenant(tenantId, key, payload);
      return payload;
    }

    const systemConfig = (await this.cache.getSystem(key)) ?? (await this.prisma.systemConfig.findUnique({ where: { key } }));
    if (systemConfig) {
      await this.cache.setSystem(key, systemConfig);
      const payload = {
        key: systemConfig.key,
        configKey: systemConfig.key,
        value: systemConfig.value,
        configValue: systemConfig.value,
        category: systemConfig.category,
        dataType: systemConfig.dataType,
        source: 'system',
      };
      await this.cache.setTenant(tenantId, key, payload);
      return payload;
    }

    return null;
  }

  async set(tenantId: string, userId: string | null, dto: SetTenantConfigDto) {
    const existing = await this.get(tenantId, dto.key);

    const record = await this.prisma.tenantConfig.upsert({
      where: { tenantId_configKey: { tenantId, configKey: dto.key } },
      update: {
        configValue: dto.value as Prisma.InputJsonValue,
        updatedById: userId ?? undefined,
        dataType: DataType.STRING,
      },
      create: {
        tenantId,
        configKey: dto.key,
        configValue: dto.value as Prisma.InputJsonValue,
        createdById: userId ?? undefined,
        updatedById: userId ?? undefined,
      },
    });

    await this.cache.invalidateTenant(tenantId, dto.key);

    await this.history.record({
      tenantId,
      key: dto.key,
      oldValue: ((existing as any)?.configValue as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
      newValue: record.configValue as Prisma.InputJsonValue,
      changedBy: userId,
      reason: dto.description,
    });

    this.events.emit('config.tenant.updated', { tenantId, key: dto.key });
    return record;
  }

  async reset(tenantId: string, key: string) {
    await this.prisma.tenantConfig.deleteMany({ where: { tenantId, configKey: key } });
    await this.cache.invalidateTenant(tenantId, key);
    const fallback = await this.get(tenantId, key);
    this.events.emit('config.tenant.updated', { tenantId, key });
    return { key, reset: true, value: (fallback as any)?.configValue ?? null };
  }

  async bulk(tenantId: string, userId: string | null, dto: BulkUpdateConfigDto) {
    const results = [] as any[];
    for (const cfg of dto.configs) {
      results.push(await this.set(tenantId, userId, cfg));
    }
    return results;
  }
}
