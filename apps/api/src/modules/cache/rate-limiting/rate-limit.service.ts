import { Injectable } from '@nestjs/common';
import { Prisma, RateLimitScope } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { UpdateRateLimitDto } from '../dto/cache.dto';

@Injectable()
export class RateLimitService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId?: string) {
    return this.prisma.rateLimit.findMany({ where: tenantId ? { tenantId } : {}, orderBy: { createdAt: 'desc' } });
  }

  async getByKey(key: string) {
    return this.prisma.rateLimit.findFirst({ where: { identifier: key } });
  }

  async update(key: string, dto: UpdateRateLimitDto, tenantId?: string) {
    const existing = await this.getByKey(key);
    const windowSeconds = dto.requestsPerMinute
      ? 60
      : dto.requestsPerHour
      ? 3600
      : dto.requestsPerDay
      ? 86400
      : existing?.windowSeconds ?? 60;

    const maxRequests = dto.requestsPerMinute ?? dto.requestsPerHour ?? dto.requestsPerDay ?? existing?.maxRequests ?? 60;
    const scope: RateLimitScope = (dto.scope as RateLimitScope | undefined) ?? existing?.scope ?? RateLimitScope.GLOBAL;

    if (existing) {
      return this.prisma.rateLimit.update({
        where: { scope_identifier: { scope: existing.scope, identifier: existing.identifier } },
        data: {
          scope,
          maxRequests,
          windowSeconds,
          currentRequests: dto.isEnabled === false ? 0 : existing.currentRequests,
          windowStartsAt: existing.windowStartsAt,
        },
      });
    }

    return this.prisma.rateLimit.create({
      data: {
        tenantId: tenantId ?? null,
        scope,
        identifier: key,
        maxRequests,
        windowSeconds,
        currentRequests: 0,
        windowStartsAt: new Date(),
        customFields: Prisma.JsonNull,
      },
    });
  }

  async usage(key: string) {
    const record = await this.getByKey(key);
    if (!record) {
      return { identifier: key, current: 0, limit: 0, windowSeconds: 0, resetAt: null };
    }
    const resetAt = new Date(record.windowStartsAt.getTime() + record.windowSeconds * 1000);
    return {
      identifier: record.identifier,
      scope: record.scope,
      current: record.currentRequests,
      limit: record.maxRequests,
      windowSeconds: record.windowSeconds,
      resetAt,
    };
  }

  async reset(key: string) {
    const existing = await this.getByKey(key);
    if (!existing) return { reset: false };
    await this.prisma.rateLimit.update({
      where: { scope_identifier: { scope: existing.scope, identifier: existing.identifier } },
      data: { currentRequests: 0, windowStartsAt: new Date() },
    });
    return { reset: true };
  }

  async incrementUsage(record: { scope: RateLimitScope; identifier: string; windowStartsAt: Date; windowSeconds: number }) {
    const windowEnd = new Date(record.windowStartsAt.getTime() + record.windowSeconds * 1000);
    if (new Date() > windowEnd) {
      await this.prisma.rateLimit.update({
        where: { scope_identifier: { scope: record.scope, identifier: record.identifier } },
        data: { currentRequests: 1, windowStartsAt: new Date() },
      });
      return;
    }

    await this.prisma.rateLimit.update({
      where: { scope_identifier: { scope: record.scope, identifier: record.identifier } },
      data: { currentRequests: { increment: 1 } },
    });
  }
}
