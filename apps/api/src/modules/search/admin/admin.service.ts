import { Injectable } from '@nestjs/common';
import { IndexOperation, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateSynonymDto, QueueQueryDto, SearchAnalyticsDto, SynonymResponseDto } from '../dto';
import { IndexingService } from '../indexing/indexing.service';
import { IndexManagerService } from '../indexing/index-manager.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly indexingService: IndexingService,
    private readonly indexManager: IndexManagerService,
  ) {}

  async listIndexes(tenantId: string) {
    return this.indexManager.listIndexes(tenantId);
  }

  async reindex(tenantId: string, name: string) {
    await this.indexManager.setStatus(tenantId, name, 'REBUILDING');
    await this.indexingService.enqueue(tenantId, name, name, IndexOperation.REINDEX, 1);
    return { started: true };
  }

  async indexStatus(tenantId: string, name: string) {
    return this.indexManager.getIndexStatus(tenantId, name);
  }

  async listSynonyms(tenantId: string): Promise<SynonymResponseDto[]> {
    const rows = await this.prisma.searchSynonym.findMany({ where: { tenantId, deletedAt: null, isActive: true } });
    return rows.map(s => ({
      id: s.id,
      terms: [s.term, ...(s.synonymsArray as string[])],
      isBidirectional: true,
      primaryTerm: s.term,
      entityTypes: s.entityType ? [s.entityType] : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async createSynonym(tenantId: string, userId: string, dto: CreateSynonymDto): Promise<SynonymResponseDto> {
    const primary = (dto.primaryTerm ?? dto.terms[0]) as string;
    const synonyms = dto.terms.filter(t => t !== primary);

    const row = await this.prisma.searchSynonym.create({
      data: {
        tenantId,
        term: primary,
        synonymsArray: synonyms as Prisma.InputJsonValue,
        entityType: dto.entityTypes?.[0],
        isActive: true,
        createdById: userId,
        updatedById: userId,
      },
    });

    return {
      id: row.id,
      terms: [row.term, ...(row.synonymsArray as string[])],
      isBidirectional: true,
      primaryTerm: row.term,
      entityTypes: row.entityType ? [row.entityType] : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async deleteSynonym(tenantId: string, id: string) {
    await this.prisma.searchSynonym.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { success: true };
  }

  async analytics(tenantId: string): Promise<SearchAnalyticsDto> {
    const totalQueries = await this.prisma.searchHistory.count({ where: { tenantId } });
    const uniqueUsers = await this.prisma.searchHistory.groupBy({ where: { tenantId }, by: ['userId'] });
    const topEntitiesRaw = await this.prisma.searchHistory.groupBy({
      where: { tenantId },
      by: ['entityType'],
      _count: { entityType: true },
      orderBy: { _count: { entityType: 'desc' } },
      take: 5,
    });

    const topEntities = topEntitiesRaw.map(r => ({ entityType: r.entityType, count: r._count.entityType }));

    const topTermsRaw = await this.prisma.searchHistory.groupBy({
      where: { tenantId },
      by: ['searchTerm'],
      _count: { searchTerm: true },
      orderBy: { _count: { searchTerm: 'desc' } },
      take: 5,
    });

    const topTerms = topTermsRaw.map(r => ({ term: r.searchTerm, count: r._count.searchTerm }));

    return { totalQueries, uniqueUsers: uniqueUsers.length, topEntities, topTerms };
  }

  async queueStatus(tenantId: string, query: QueueQueryDto) {
    const items = await this.indexingService.listQueue(tenantId, query.status as 'pending' | 'processed' | undefined, query.limit ?? 20);
    return items;
  }
}
