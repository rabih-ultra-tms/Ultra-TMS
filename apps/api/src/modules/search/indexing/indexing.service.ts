import { Injectable } from '@nestjs/common';
import { IndexOperation, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class IndexingService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(
    tenantId: string,
    entityType: string,
    entityId: string,
    operation: IndexOperation,
    priority = 5,
  ) {
    return this.prisma.searchIndexQueue.create({
      data: {
        tenantId,
        entityType,
        entityId,
        operation,
        priority,
      },
    });
  }

  async listQueue(tenantId: string, status?: 'pending' | 'processed', limit = 20) {
    const where: Prisma.SearchIndexQueueWhereInput = {
      tenantId,
      ...(status === 'pending' ? { processedAt: null } : {}),
      ...(status === 'processed' ? { processedAt: { not: null } } : {}),
    };

    return this.prisma.searchIndexQueue.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    });
  }

  async markProcessing(id: string) {
    return this.prisma.searchIndexQueue.update({
      where: { id },
      data: { retryCount: { increment: 1 }, lastError: null },
    });
  }

  async markCompleted(id: string) {
    return this.prisma.searchIndexQueue.update({ where: { id }, data: { processedAt: new Date() } });
  }

  async markFailed(id: string, errorMessage: string) {
    return this.prisma.searchIndexQueue.update({ where: { id }, data: { lastError: errorMessage } });
  }
}
