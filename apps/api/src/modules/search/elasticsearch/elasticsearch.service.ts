import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { SearchResultDto, SuggestionResultDto } from '../dto';

@Injectable()
export class ElasticsearchService {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly client: Client;
  private readonly prefix: string;
  private readonly requestTimeout: number;

  constructor() {
    const node = process.env.ELASTIC_NODE ?? 'http://localhost:9200';
    const maxRetries = Number(process.env.ELASTIC_MAX_RETRIES ?? 3);
    this.prefix = process.env.ELASTIC_NAME_PREFIX ?? 'ultra';
    this.requestTimeout = Number(process.env.ELASTIC_REQUEST_TIMEOUT ?? 10000);

    const useCompatHeaders = process.env.ELASTIC_USE_COMPAT_HEADERS === 'true';
    const headers = useCompatHeaders
      ? {
          Accept: 'application/vnd.elasticsearch+json;compatible-with=8',
          'Content-Type': 'application/vnd.elasticsearch+json;compatible-with=8',
        }
      : {
          accept: 'application/json',
          'content-type': 'application/json',
        };

    this.client = new Client({
      node,
      maxRetries,
      requestTimeout: this.requestTimeout,
      name: 'api-search',
      headers,
    });
  }

  private indexName(entityType: string) {
    return `${this.prefix}-${entityType}-v1`;
  }

  private normalizeEntityType(index?: string) {
    if (!index) return 'unknown';
    if (!index.startsWith(`${this.prefix}-`)) return index;
    return index.replace(`${this.prefix}-`, '').replace(/-v\d+$/, '');
  }

  private totalCount(total: unknown): number {
    if (typeof total === 'number') return total;
    if (typeof (total as { value?: number })?.value === 'number') {
      return (total as { value: number }).value;
    }
    return 0;
  }

  async searchGlobal(query: string, entityTypes?: string[], limit = 20, offset = 0): Promise<SearchResultDto> {
    const indices = entityTypes?.length ? entityTypes.map((e) => this.indexName(e)) : `${this.prefix}-*-v1`;

    const res = await this.client.search({
      index: indices,
      from: offset,
      size: limit,
      query: {
        multi_match: {
          query,
          fields: ['title^2', 'name^2', 'description', 'content'],
          operator: 'and',
        },
      },
    });

    const items = res.hits.hits.map((hit: any) => ({
      id: hit._id,
      entityType: this.normalizeEntityType(hit._index),
      score: hit._score,
      ...hit._source,
    }));

    return { total: this.totalCount(res.hits.total), items, facets: {} };
  }

  async searchEntity(entityType: string, query: string | undefined, filters: Record<string, unknown> | undefined, limit = 20, offset = 0): Promise<SearchResultDto> {
    const must: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^2', 'name^2', 'description', 'content'],
          operator: 'and',
        },
      });
    }

    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        must.push({ term: { [field]: value } });
      });
    }

    const res = await this.client.search({
      index: this.indexName(entityType),
      from: offset,
      size: limit,
      query: must.length ? { bool: { must } } : { match_all: {} },
    });

    const items = res.hits.hits.map((hit: any) => ({
      id: hit._id,
      entityType,
      score: hit._score,
      ...hit._source,
    }));

    return { total: this.totalCount(res.hits.total), items, facets: {} };
  }

  async suggest(query: string, limit = 10): Promise<SuggestionResultDto> {
    const res = await this.client.search({
      index: `${this.prefix}-*-v1`,
      size: 0,
      suggest: {
        text: query,
        name_suggest: {
          completion: {
            field: 'suggest',
            size: limit,
            skip_duplicates: true,
          },
        },
      },
    });

    const rawOptions = Array.isArray(res.suggest?.name_suggest) &&
      Array.isArray(res.suggest.name_suggest[0]?.options)
      ? (res.suggest.name_suggest[0]?.options as any[])
      : [];
    const suggestions = rawOptions.map((o: any) => o.text).filter(Boolean);
    return { suggestions };
  }

  async indexDocument(entityType: string, entityId: string, document: Record<string, unknown>) {
    await this.client.index({
      index: this.indexName(entityType),
      id: entityId,
      document,
      refresh: false,
    });
    return { success: true };
  }

  async deleteDocument(entityType: string, entityId: string) {
    await this.client.delete(
      {
        index: this.indexName(entityType),
        id: entityId,
      },
      { ignore: [404] },
    );
    return { success: true };
  }

  async reindex(indexName: string) {
    const task = await this.client.reindex({
      source: { index: indexName },
      dest: { index: `${indexName}-copy` },
      wait_for_completion: false,
    });
    return { started: true, task: (task as any).task };
  }

  async health(): Promise<any> {
    return this.client.cluster.health();
  }

  async ensureIndex(entityType: string) {
    const index = this.indexName(entityType);
    const exists = await this.client.indices.exists({ index });
    if (exists) {
      return { created: false, index };
    }

    await this.client.indices.create({
      index,
      mappings: {
        properties: {
          title: { type: 'text' },
          name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
          description: { type: 'text' },
          content: { type: 'text' },
          suggest: { type: 'completion' },
        },
      },
    });

    return { created: true, index };
  }
}
