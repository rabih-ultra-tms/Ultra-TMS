import { Injectable, NotFoundException } from '@nestjs/common';
import { EdiMessageStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class EdiQueueService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.ediMessage.findMany({
      where: { tenantId, deletedAt: null, status: { in: [EdiMessageStatus.PENDING, EdiMessageStatus.QUEUED, EdiMessageStatus.ERROR] } },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.requireMessage(tenantId, id);
  }

  async retry(tenantId: string, id: string) {
    const message = await this.requireMessage(tenantId, id);
    const nextRetry = message.retryCount + 1;

    return this.prisma.ediMessage.update({
      where: { id: message.id },
      data: {
        status: EdiMessageStatus.QUEUED,
        retryCount: nextRetry,
        lastRetryAt: new Date(),
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    await this.requireMessage(tenantId, id);
    return this.prisma.ediMessage.update({ where: { id }, data: { status: EdiMessageStatus.REJECTED, processedAt: new Date() } });
  }

  async process(tenantId: string) {
    const pending = await this.prisma.ediMessage.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: [EdiMessageStatus.PENDING, EdiMessageStatus.QUEUED] },
      },
      take: 20,
      orderBy: { createdAt: 'asc' },
    });

    const processedIds = pending.map((p) => p.id);

    if (processedIds.length === 0) {
      return { processed: 0 };
    }

    await this.prisma.ediMessage.updateMany({
      where: { id: { in: processedIds } },
      data: { status: EdiMessageStatus.SENT, processedAt: new Date() },
    });

    return { processed: processedIds.length };
  }

  async stats(tenantId: string) {
    const result = await this.prisma.ediMessage.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { _all: true },
    });

    const totals: Record<string, number> = {};
    result.forEach((row) => {
      totals[row.status] = row._count._all;
    });

    return totals;
  }

  private async requireMessage(tenantId: string, id: string) {
    const message = await this.prisma.ediMessage.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!message) {
      throw new NotFoundException('Queue item not found');
    }
    return message;
  }
}
