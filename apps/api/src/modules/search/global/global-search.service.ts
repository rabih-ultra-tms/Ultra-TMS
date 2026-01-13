import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { GlobalSearchDto, SearchResultDto, SuggestionResultDto } from '../dto';
import { SearchEntityType } from '@prisma/client';

@Injectable()
export class GlobalSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async search(tenantId: string, userId: string, dto: GlobalSearchDto): Promise<SearchResultDto> {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    const result = await this.elasticsearch.searchGlobal(dto.q, dto.entityTypes, limit, offset);

    const entityTypeForHistory = this.pickEntityType(dto.entityTypes);
    await this.prisma.searchHistory.create({
      data: {
        tenantId,
        userId,
        entityType: entityTypeForHistory,
        searchTerm: dto.q,
        resultCount: result.total,
      },
    });

    return result;
  }

  async suggestions(tenantId: string, query: string): Promise<SuggestionResultDto> {
    const limit = 10;
    const fromSuggestions = await this.prisma.searchSuggestion.findMany({
      where: {
        tenantId,
        isActive: true,
        suggestionText: { contains: query, mode: 'insensitive' },
      },
      orderBy: [{ frequency: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
    });

    if (fromSuggestions.length > 0) {
      return { suggestions: fromSuggestions.map(s => s.suggestionText) };
    }

    return this.elasticsearch.suggest(query, limit);
  }

  async recent(tenantId: string, userId: string) {
    const history = await this.prisma.searchHistory.findMany({
      where: { tenantId, userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return history.map(h => ({ id: h.id, term: h.searchTerm, entityType: h.entityType, resultCount: h.resultCount, createdAt: h.createdAt }));
  }

  private pickEntityType(entityTypes?: string[]): SearchEntityType {
    if (entityTypes?.length) {
      const candidate = entityTypes[0]?.toUpperCase() as SearchEntityType;
      if (Object.values(SearchEntityType).includes(candidate)) {
        return candidate;
      }
    }
    return SearchEntityType.ORDERS;
  }
}
