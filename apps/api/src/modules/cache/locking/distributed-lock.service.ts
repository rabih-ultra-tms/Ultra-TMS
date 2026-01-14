import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class DistributedLockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listActive(tenantId?: string) {
    const now = new Date();
    return this.prisma.distributedLock.findMany({
      where: {
        tenantId: tenantId ?? undefined,
        releasedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { acquiredAt: 'desc' },
      take: 100,
    });
  }

  async lockDetails(lockKey: string) {
    return this.prisma.distributedLock.findFirst({ where: { lockKey }, orderBy: { acquiredAt: 'desc' } });
  }

  async forceRelease(lockKey: string) {
    const client = this.redis.getClient();
    await client.del(`lock:${lockKey}`);
    await this.prisma.distributedLock.updateMany({
      where: { lockKey, releasedAt: null },
      data: { releasedAt: new Date() },
    });
    return { released: true };
  }

  async history(lockKey?: string) {
    return this.prisma.distributedLock.findMany({
      where: lockKey ? { lockKey } : {},
      orderBy: { acquiredAt: 'desc' },
      take: 200,
    });
  }
}
