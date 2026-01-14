import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, FeatureFlagStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ConfigCacheService } from '../config-cache.service';
import { CreateFeatureFlagDto, SetFeatureFlagOverrideDto, UpdateFeatureFlagDto } from '../dto';
import { FeatureFlagEvaluator } from './feature-flag.evaluator';

@Injectable()
export class FeaturesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly cache: ConfigCacheService,
    private readonly evaluator: FeatureFlagEvaluator,
  ) {}

  async list() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async get(code: string) {
    const cached = await this.cache.getFeature(code);
    if (cached) return cached;

    const flag = await this.prisma.featureFlag.findUnique({ where: { key: code } });
    if (!flag) throw new NotFoundException('Feature flag not found');
    await this.cache.setFeature(code, flag);
    return flag;
  }

  async create(dto: CreateFeatureFlagDto, userId?: string | null) {
    const record = await this.prisma.featureFlag.create({
      data: {
        key: dto.code,
        name: dto.name,
        description: dto.description,
        status: FeatureFlagStatus.ACTIVE,
        enabled: dto.defaultEnabled ?? false,
        rolloutPercent: dto.rolloutPercentage ?? 0,
        tenantIds: [],
        userIds: [],
        customFields: {
          category: dto.category,
          owner: dto.owner,
        } as Prisma.InputJsonValue,
        createdById: userId ?? undefined,
        updatedById: userId ?? undefined,
      },
    });

    await this.cache.invalidateFeature(dto.code);
    return record;
  }

  async update(code: string, dto: UpdateFeatureFlagDto, userId?: string | null) {
    const existing = await this.get(code);
    const customFields = (existing.customFields as Record<string, unknown>) || {};

    const updated = await this.prisma.featureFlag.update({
      where: { key: code },
      data: {
        name: dto.name,
        description: dto.description,
        enabled: dto.defaultEnabled ?? existing.enabled,
        rolloutPercent: dto.rolloutPercentage ?? existing.rolloutPercent,
        customFields: {
          ...customFields,
          category: dto.category ?? customFields.category,
          owner: dto.owner ?? customFields.owner,
        } as Prisma.InputJsonValue,
        updatedById: userId ?? undefined,
      },
    });

    await this.cache.invalidateFeature(code);
    await this.cache.setFeature(code, updated);
    return updated;
  }

  async checkEnabled(code: string, tenantId?: string | null, userId?: string | null) {
    const flag = await this.get(code);
    const userOverride = userId
      ? await this.prisma.featureFlagOverride.findFirst({ where: { featureFlagId: flag.id, userId } })
      : null;
    const tenantOverride = tenantId
      ? await this.prisma.featureFlagOverride.findFirst({ where: { featureFlagId: flag.id, tenantId } })
      : null;

    const enabled = this.evaluator.isEnabled(flag, {
      tenantId: tenantId ?? undefined,
      userId: userId ?? undefined,
      override: userOverride ?? tenantOverride ?? undefined,
    });

    return { code, enabled };
  }

  async setOverride(code: string, tenantId: string, dto: SetFeatureFlagOverrideDto, userId?: string | null) {
    const flag = await this.get(code);

    const payload: Prisma.FeatureFlagOverrideUncheckedCreateInput = {
      featureFlagId: flag.id,
      tenantId,
      userId: null,
      overrideValue: dto.isEnabled,
      expiresAt: dto.enabledUntil ? new Date(dto.enabledUntil) : null,
      customFields: {
        userIds: dto.userIds,
        roleIds: dto.roleIds,
        percentage: dto.percentage,
        enabledFrom: dto.enabledFrom,
        enabledUntil: dto.enabledUntil,
        reason: dto.reason,
      } as Prisma.InputJsonValue,
      createdById: userId ?? undefined,
      updatedById: userId ?? undefined,
    };

    const existing = await this.prisma.featureFlagOverride.findFirst({
      where: { featureFlagId: flag.id, tenantId },
    });

    const record = existing
      ? await this.prisma.featureFlagOverride.update({
          where: { id: existing.id },
          data: payload as Prisma.FeatureFlagOverrideUncheckedUpdateInput,
        })
      : await this.prisma.featureFlagOverride.create({ data: payload });

    await this.cache.invalidateFeature(code);
    this.events.emit(dto.isEnabled ? 'feature.enabled' : 'feature.disabled', { flagCode: code, tenantId });
    return record;
  }

  async removeOverride(code: string, tenantId: string) {
    const flag = await this.get(code);
    await this.prisma.featureFlagOverride.deleteMany({ where: { featureFlagId: flag.id, tenantId } });
    await this.cache.invalidateFeature(code);
    this.events.emit('feature.disabled', { flagCode: code, tenantId });
    return { code, tenantId, removed: true };
  }
}
