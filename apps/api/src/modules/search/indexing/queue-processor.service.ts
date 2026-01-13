import { Injectable, Logger } from '@nestjs/common';
import { IndexOperation } from '@prisma/client';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { IndexingService } from './indexing.service';
import { PrismaService } from '../../../prisma.service';
import { IndexManagerService } from './index-manager.service';

@Injectable()
export class QueueProcessorService {
  private readonly logger = new Logger(QueueProcessorService.name);

  constructor(
    private readonly indexingService: IndexingService,
    private readonly elasticsearch: ElasticsearchService,
    private readonly prisma: PrismaService,
    private readonly indexManager: IndexManagerService,
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
      if (next.operation === IndexOperation.DELETE) {
        await this.elasticsearch.deleteDocument(next.entityType, next.entityId);
        await this.indexingService.markCompleted(next.id);
        return { processed: true };
      }

      if (next.operation === IndexOperation.REINDEX) {
        const count = await this.reindexAll(tenantId, next.entityType);
        await this.indexingService.markCompleted(next.id);
        await this.indexManager.setStatus(tenantId, next.entityType, 'READY', undefined, count);
        return { processed: true, indexed: count };
      }

      const record = await this.fetchEntity(tenantId, next.entityType, next.entityId);
      if (!record) {
        await this.indexingService.markFailed(next.id, 'Entity not found');
        return { processed: false, error: 'Entity not found' };
      }

      const document = this.mapDocument(next.entityType, record);
      await this.elasticsearch.indexDocument(next.entityType, next.entityId, document);
      await this.indexingService.markCompleted(next.id);
      await this.indexManager.setStatus(tenantId, next.entityType, 'READY');
      return { processed: true };
    } catch (error) {
      this.logger.error(`Queue item ${next.id} failed`, error as Error);
      await this.indexingService.markFailed(next.id, (error as Error).message);
      return { processed: false, error: (error as Error).message };
    }
  }

  private async reindexAll(tenantId: string, entityType: string) {
    const records = await this.fetchAllEntities(tenantId, entityType);
    let indexed = 0;

    for (const record of records) {
      const document = this.mapDocument(entityType, record);
      await this.elasticsearch.indexDocument(entityType, record.id, document);
      indexed += 1;
    }

    return indexed;
  }

  private async fetchAllEntities(tenantId: string, entityType: string) {
    switch (entityType) {
      case 'customers':
        return this.prisma.company.findMany({ where: { tenantId, companyType: 'CUSTOMER', deletedAt: null } });
      case 'orders':
        return this.prisma.order.findMany({ where: { tenantId, deletedAt: null } });
      case 'loads':
        return this.prisma.load.findMany({ where: { tenantId, deletedAt: null } });
      case 'carriers':
        return this.prisma.carrier.findMany({ where: { tenantId, deletedAt: null } });
      case 'documents':
        return this.prisma.document.findMany({ where: { tenantId, deletedAt: null } });
      default:
        return [];
    }
  }

  private async fetchEntity(tenantId: string, entityType: string, entityId: string) {
    switch (entityType) {
      case 'customers':
        return this.prisma.company.findFirst({ where: { tenantId, id: entityId, companyType: 'CUSTOMER', deletedAt: null } });
      case 'orders':
        return this.prisma.order.findFirst({ where: { tenantId, id: entityId, deletedAt: null } });
      case 'loads':
        return this.prisma.load.findFirst({ where: { tenantId, id: entityId, deletedAt: null } });
      case 'carriers':
        return this.prisma.carrier.findFirst({ where: { tenantId, id: entityId, deletedAt: null } });
      case 'documents':
        return this.prisma.document.findFirst({ where: { tenantId, id: entityId, deletedAt: null } });
      default:
        return null;
    }
  }

  private mapDocument(entityType: string, record: any) {
    switch (entityType) {
      case 'customers':
        return {
          id: record.id,
          entityType,
          title: record.name,
          name: record.name,
          city: record.city,
          state: record.state,
          phone: record.phone,
          status: record.status,
          companyType: record.companyType,
          tags: record.tags,
          content: record.defaultDeliveryInstructions || record.defaultPickupInstructions || record.industry,
        };
      case 'orders':
        return {
          id: record.id,
          entityType,
          title: record.orderNumber,
          name: record.orderNumber,
          customerId: record.customerId,
          status: record.status,
          commodity: record.commodity,
          equipmentType: record.equipmentType,
          orderDate: record.orderDate,
          requiredDeliveryDate: record.requiredDeliveryDate,
          isExpedited: record.isExpedited,
          isHot: record.isHot,
          content: record.specialInstructions || record.internalNotes,
        };
      case 'loads':
        return {
          id: record.id,
          entityType,
          title: record.loadNumber,
          name: record.loadNumber,
          orderId: record.orderId,
          carrierId: record.carrierId,
          status: record.status,
          equipmentType: record.equipmentType,
          dispatchedAt: record.dispatchedAt,
          deliveredAt: record.deliveredAt,
          currentCity: record.currentCity,
          currentState: record.currentState,
          content: record.dispatchNotes,
        };
      case 'carriers':
        return {
          id: record.id,
          entityType,
          title: record.legalName || record.dbaName,
          name: record.legalName,
          mcNumber: record.mcNumber,
          dotNumber: record.dotNumber,
          status: record.status,
          city: record.city,
          state: record.state,
          equipmentTypes: record.equipmentTypes,
          serviceStates: record.serviceStates,
          content: record.primaryContactName || record.primaryContactEmail || record.primaryContactPhone,
        };
      case 'documents':
        return {
          id: record.id,
          entityType,
          title: record.name,
          name: record.name,
          documentType: record.documentType,
          status: record.status,
          fileName: record.fileName,
          fileExtension: record.fileExtension,
          mimeType: record.mimeType,
          associatedEntityType: record.entityType,
          associatedEntityId: record.entityId,
          content: record.description,
        };
      default:
        return { id: record.id, entityType, title: record.id };
    }
  }
}
