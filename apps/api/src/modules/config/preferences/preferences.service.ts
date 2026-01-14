import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { BulkPreferencesDto, SetPreferenceDto } from '../dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService, private readonly cache: ConfigCacheService) {}

  async list(tenantId: string, userId: string) {
    const systemConfigs =
      (await this.cache.getSystemList()) ??
      (await this.prisma.systemConfig.findMany({ orderBy: { key: 'asc' } }).then(async rows => {
        await this.cache.setSystemList(rows);
        return rows;
      }));

    const safeSystemConfigs = systemConfigs ?? [];

    const [userPrefs, tenantConfigs] = await this.prisma.$transaction([
      this.prisma.userPreference.findMany({ where: { tenantId, userId } }),
      this.prisma.tenantConfig.findMany({ where: { tenantId } }),
    ]);

    const merged = new Map<string, { key: string; value: Prisma.JsonValue; source: 'user' | 'tenant' | 'system' }>();

    for (const cfg of safeSystemConfigs) {
      merged.set(cfg.key, {
        key: cfg.key,
        value: cfg.value as Prisma.JsonValue,
        source: 'system',
      });
    }

    for (const cfg of tenantConfigs) {
      merged.set(cfg.configKey, {
        key: cfg.configKey,
        value: cfg.configValue as Prisma.JsonValue,
        source: 'tenant',
      });
    }

    for (const pref of userPrefs) {
      merged.set(pref.preferenceKey, {
        key: pref.preferenceKey,
        value: pref.preferenceValue as Prisma.JsonValue,
        source: 'user',
      });
    }

    return Array.from(merged.values()).sort((a, b) => a.key.localeCompare(b.key));
  }

  async set(tenantId: string, userId: string, dto: SetPreferenceDto) {
    return this.prisma.userPreference.upsert({
      where: { userId_preferenceKey: { userId, preferenceKey: dto.key } },
      update: { preferenceValue: dto.value as Prisma.InputJsonValue },
      create: {
        tenantId,
        userId,
        preferenceKey: dto.key,
        preferenceValue: dto.value as Prisma.InputJsonValue,
      },
    });
  }

  async reset(tenantId: string, userId: string, key: string) {
    await this.prisma.userPreference.deleteMany({ where: { tenantId, userId, preferenceKey: key } });
    return { key, reset: true };
  }

  async bulk(tenantId: string, userId: string, dto: BulkPreferencesDto) {
    const results = [] as any[];
    for (const pref of dto.prefs) {
      results.push(await this.set(tenantId, userId, pref));
    }
    return results;
  }
}
