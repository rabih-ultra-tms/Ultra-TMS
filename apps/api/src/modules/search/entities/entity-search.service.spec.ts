import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EntitySearchService } from './entity-search.service';
import { PrismaService } from '../../../prisma.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

describe('EntitySearchService', () => {
  let service: EntitySearchService;
  let prisma: any;
  let elasticsearch: any;

  beforeEach(async () => {
    prisma = { searchHistory: { create: jest.fn() } };
    elasticsearch = { searchEntity: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitySearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: ElasticsearchService, useValue: elasticsearch },
      ],
    }).compile();

    service = module.get(EntitySearchService);
  });

  it('throws on unsupported entity', async () => {
    await expect(service.search('tenant-1', 'user-1', 'unknown', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('searches entity and logs history', async () => {
    elasticsearch.searchEntity.mockResolvedValue({ total: 1, results: [] });

    const result = await service.search('tenant-1', 'user-1', 'orders', { q: 'test' } as any);

    expect(result.total).toBe(1);
    expect(prisma.searchHistory.create).toHaveBeenCalled();
  });
});
