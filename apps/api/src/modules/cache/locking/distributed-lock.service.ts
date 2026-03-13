import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class DistributedLockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async listActive(tenantId: string) {
    const now = new Date();
    return this.prisma.distributedLock.findMany({
      where: {
        tenantId,
        releasedAt: null,
        expiresAt: { gt: now },
        deletedAt: null,
      },
      orderBy: { acquiredAt: 'desc' },
      take: 100,
    });
  }

  async lockDetails(tenantId: string, lockKey: string) {
    return this.prisma.distributedLock.findFirst({
      where: { tenantId, lockKey, deletedAt: null },
      orderBy: { acquiredAt: 'desc' },
    });
  }

  async forceRelease(tenantId: string, lockKey: string) {
    const lock = await this.prisma.distributedLock.findFirst({
      where: { lockKey, tenantId, releasedAt: null, deletedAt: null },
    });
    if (!lock) return { released: false };
    const client = this.redis.getClient();
    await client.del(`lock:${tenantId}:${lockKey}`);
    await this.prisma.distributedLock.updateMany({
      where: { lockKey, tenantId, releasedAt: null, deletedAt: null },
      data: { releasedAt: new Date() },
    });
    return { released: true };
  }

  async history(tenantId: string, lockKey?: string) {
    return this.prisma.distributedLock.findMany({
      where: { tenantId, deletedAt: null, ...(lockKey ? { lockKey } : {}) },
      orderBy: { acquiredAt: 'desc' },
      take: 200,
    });
  }
}
