import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CacheStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async recent(tenantId?: string) {
    return this.prisma.cacheStats.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: [{ statDate: 'desc' }, { statHour: 'desc' }],
      take: 48,
    });
  }

  async recordHit(tenantId: string | null, cacheType: string) {
    const now = new Date();
    const statDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const statHour = now.getUTCHours();
    const existing = await this.prisma.cacheStats.findFirst({ where: { tenantId: tenantId ?? null, statDate, statHour, cacheType } });
    if (existing) {
      await this.prisma.cacheStats.update({
        where: { id: existing.id },
        data: { hits: { increment: 1 } },
      });
      return;
    }

    await this.prisma.cacheStats.create({
      data: {
        tenantId: tenantId ?? null,
        statDate,
        statHour,
        cacheType,
        hits: 1,
        misses: 0,
        sets: 0,
        deletes: 0,
        expirations: 0,
      },
    });
  }

  async recordMiss(tenantId: string | null, cacheType: string) {
    const now = new Date();
    const statDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const statHour = now.getUTCHours();
    const existing = await this.prisma.cacheStats.findFirst({ where: { tenantId: tenantId ?? null, statDate, statHour, cacheType } });
    if (existing) {
      await this.prisma.cacheStats.update({
        where: { id: existing.id },
        data: { misses: { increment: 1 } },
      });
      return;
    }

    await this.prisma.cacheStats.create({
      data: {
        tenantId: tenantId ?? null,
        statDate,
        statHour,
        cacheType,
        hits: 0,
        misses: 1,
        sets: 0,
        deletes: 0,
        expirations: 0,
      },
    });
  }

  async recordSet(tenantId: string | null, cacheType: string) {
    const now = new Date();
    const statDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const statHour = now.getUTCHours();
    const existing = await this.prisma.cacheStats.findFirst({ where: { tenantId: tenantId ?? null, statDate, statHour, cacheType } });
    if (existing) {
      await this.prisma.cacheStats.update({
        where: { id: existing.id },
        data: { sets: { increment: 1 } },
      });
      return;
    }

    await this.prisma.cacheStats.create({
      data: {
        tenantId: tenantId ?? null,
        statDate,
        statHour,
        cacheType,
        hits: 0,
        misses: 0,
        sets: 1,
        deletes: 0,
        expirations: 0,
      },
    });
  }

  async recordDelete(tenantId: string | null, cacheType: string, count: number) {
    const now = new Date();
    const statDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const statHour = now.getUTCHours();
    const existing = await this.prisma.cacheStats.findFirst({ where: { tenantId: tenantId ?? null, statDate, statHour, cacheType } });
    if (existing) {
      await this.prisma.cacheStats.update({
        where: { id: existing.id },
        data: { deletes: { increment: count } },
      });
      return;
    }

    await this.prisma.cacheStats.create({
      data: {
        tenantId: tenantId ?? null,
        statDate,
        statHour,
        cacheType,
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: count,
        expirations: 0,
      },
    });
  }
}
