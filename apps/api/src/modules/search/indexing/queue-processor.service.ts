import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { IndexingService } from './indexing.service';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class QueueProcessorService {
  private readonly logger = new Logger(QueueProcessorService.name);

  constructor(
    private readonly indexingService: IndexingService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async processNext(tenantId: string) {
    const next = await this.prisma.searchIndexQueue.findFirst({
      where: { tenantId, processedAt: null },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });

    if (!next) {
      return { processed: false };
    }

    await this.indexingService.markProcessing(next.id);

    try {
      if (next.operation === 'DELETE') {
        await this.elasticsearch.deleteDocument(next.entityType, next.entityId);
      } else {
        // In production, fetch entity data and index
        await this.elasticsearch.indexDocument(next.entityType, next.entityId, { id: next.entityId, entityType: next.entityType });
      }

      await this.indexingService.markCompleted(next.id);
      return { processed: true };
    } catch (error) {
      this.logger.error(`Queue item ${next.id} failed`, error as Error);
      await this.indexingService.markFailed(next.id, (error as Error).message);
      return { processed: false, error: (error as Error).message };
    }
  }
}
