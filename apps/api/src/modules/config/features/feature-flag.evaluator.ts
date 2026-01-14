import { Injectable } from '@nestjs/common';
import { FeatureFlag, FeatureFlagOverride, FeatureFlagStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class FeatureFlagEvaluator {
  isEnabled(
    flag: FeatureFlag,
    context: { tenantId?: string; userId?: string; override?: FeatureFlagOverride },
  ): boolean {
    if (!flag || flag.status !== FeatureFlagStatus.ACTIVE) return false;

    const now = new Date();

    if (context.override) {
      const { override } = context;
      const meta = ((override.customFields as Record<string, unknown>) || {}) as {
        userIds?: string[];
        roleIds?: string[];
        percentage?: number;
        enabledFrom?: string;
        enabledUntil?: string;
      };

      if (meta.enabledFrom && new Date(meta.enabledFrom) > now) return flag.enabled;
      if (override.expiresAt && override.expiresAt < now) return flag.enabled;

      if (meta.userIds?.length && context.userId) {
        if (meta.userIds.includes(context.userId)) return override.overrideValue;
      }

      if (typeof meta.percentage === 'number' && context.userId) {
        return this.isInPercentage(context.userId, meta.percentage) ? override.overrideValue : flag.enabled;
      }

      return override.overrideValue;
    }

    if (context.tenantId && flag.tenantIds?.includes(context.tenantId)) {
      return flag.enabled;
    }

    if (context.userId && flag.userIds?.includes(context.userId)) {
      return flag.enabled;
    }

    if (flag.rolloutPercent > 0 && context.userId) {
      return this.isInPercentage(context.userId, flag.rolloutPercent);
    }

    return flag.enabled;
  }

  private isInPercentage(userId: string, percentage: number) {
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const value = parseInt(hash.slice(0, 8), 16) % 100;
    return value < percentage;
  }
}
