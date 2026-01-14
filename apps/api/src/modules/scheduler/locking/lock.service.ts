import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class LockService {
  constructor(private readonly prisma: PrismaService) {}

  private lockDurationMs = 5 * 60 * 1000;

  async acquire(jobId: string, workerId: string, tenantId?: string | null, _purpose?: string) {
    const now = new Date();
    const existing = await this.prisma.jobLock.findUnique({ where: { jobId } });

    if (existing && existing.expiresAt > now && existing.workerId !== workerId) {
      return false;
    }

    const expiresAt = new Date(now.getTime() + this.lockDurationMs);

    if (existing) {
      await this.prisma.jobLock.update({
        where: { jobId },
        data: { workerId, tenantId: tenantId ?? existing.tenantId, lockedAt: now, expiresAt, lastHeartbeat: now },
      });
    } else {
      await this.prisma.jobLock.create({ data: { jobId, workerId, tenantId: tenantId ?? undefined, lockedAt: now, expiresAt, lastHeartbeat: now } });
    }

    return true;
  }

  async release(jobId: string, workerId: string) {
    await this.prisma.jobLock.deleteMany({ where: { jobId, workerId } });
  }

  async heartbeat(jobId: string, workerId: string) {
    const expiresAt = new Date(Date.now() + this.lockDurationMs);
    await this.prisma.jobLock.updateMany({ where: { jobId, workerId }, data: { lastHeartbeat: new Date(), expiresAt } });
  }
}
