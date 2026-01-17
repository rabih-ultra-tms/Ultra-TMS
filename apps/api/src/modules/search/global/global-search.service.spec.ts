import { Test, TestingModule } from '@nestjs/testing';
import { GlobalSearchService } from './global-search.service';
import { PrismaService } from '../../../prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

describe('GlobalSearchService', () => {
  let service: GlobalSearchService;
  let prisma: any;
  let elasticsearch: any;

  beforeEach(async () => {
    prisma = {
      searchHistory: { create: jest.fn(), findMany: jest.fn() },
      searchSuggestion: { findMany: jest.fn() },
    };
    elasticsearch = { searchGlobal: jest.fn(), suggest: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: ElasticsearchService, useValue: elasticsearch },
      ],
    }).compile();

    service = module.get(GlobalSearchService);
  });

  it('searches and stores history', async () => {
    elasticsearch.searchGlobal.mockResolvedValue({ total: 1, results: [] });
    prisma.searchHistory.create.mockResolvedValue({ id: 'h1' });

    const result = await service.search('tenant-1', 'user-1', { q: 'load' } as any);

    expect(result.total).toBe(1);
    expect(prisma.searchHistory.create).toHaveBeenCalled();
  });

  it('returns suggestions from db', async () => {
    prisma.searchSuggestion.findMany.mockResolvedValue([{ suggestionText: 'load' }]);

    const result = await service.suggestions('tenant-1', 'loa');

    expect(result.suggestions).toEqual(['load']);
  });

  it('falls back to elasticsearch suggestions', async () => {
    prisma.searchSuggestion.findMany.mockResolvedValue([]);
    elasticsearch.suggest.mockResolvedValue({ suggestions: ['order'] });

    const result = await service.suggestions('tenant-1', 'ord');

    expect(result).toEqual({ suggestions: ['order'] });
  });

  it('returns recent search history', async () => {
    prisma.searchHistory.findMany.mockResolvedValue([{ id: 'h1', searchTerm: 'load', entityType: 'ORDERS', resultCount: 1, createdAt: new Date() }]);

    const result = await service.recent('tenant-1', 'user-1');

    expect(result[0]).toEqual(expect.objectContaining({ term: 'load' }));
  });
});
