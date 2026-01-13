import { BadRequestException, Injectable } from '@nestjs/common';
import { SearchEntityType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { EntitySearchDto, SearchResultDto } from '../dto';

const ENTITY_MAP: Record<string, SearchEntityType> = {
  orders: SearchEntityType.ORDERS,
  loads: SearchEntityType.LOADS,
  companies: SearchEntityType.COMPANIES,
  carriers: SearchEntityType.CARRIERS,
  contacts: SearchEntityType.CONTACTS,
  invoices: SearchEntityType.INVOICES,
  documents: SearchEntityType.DOCUMENTS,
};

@Injectable()
export class EntitySearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elasticsearch: ElasticsearchService,
  ) {}

  async search(
    tenantId: string,
    userId: string,
    entityKey: string,
    dto: EntitySearchDto,
  ): Promise<SearchResultDto> {
    const entityType = ENTITY_MAP[entityKey];
    if (!entityType) {
      throw new BadRequestException('Unsupported entity type');
    }

    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    const result = await this.elasticsearch.searchEntity(entityType, dto.q, dto.filters, limit, offset);

    await this.prisma.searchHistory.create({
      data: {
        tenantId,
        userId,
        entityType,
        searchTerm: dto.q ?? '',
        resultCount: result.total,
      },
    });

    return result;
  }
}
