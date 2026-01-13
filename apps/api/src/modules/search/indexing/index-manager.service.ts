import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class IndexManagerService {
  constructor(private readonly prisma: PrismaService) {}

  async listIndexes(tenantId: string) {
    return this.prisma.searchIndex.findMany({ where: { tenantId }, orderBy: { indexName: 'asc' } });
  }

  async getIndexStatus(tenantId: string, indexName: string) {
    const index = await this.prisma.searchIndex.findFirst({ where: { indexName, tenantId } });
    return index;
  }

  async setStatus(
    tenantId: string,
    indexName: string,
    status: string,
    _errorMessage?: string,
    documentCount?: number,
  ) {
    const existing = await this.prisma.searchIndex.findFirst({ where: { indexName, tenantId } });

    if (existing) {
      return this.prisma.searchIndex.update({
        where: { id: existing.id },
        data: {
          status,
          lastUpdated: new Date(),
          documentCount: documentCount ?? existing.documentCount,
        },
      });
    }

    return this.prisma.searchIndex.create({
      data: {
        tenantId,
        indexName,
        entityType: indexName,
        status,
        lastUpdated: new Date(),
        ...(documentCount !== undefined ? { documentCount } : {}),
      },
    });
  }
}
