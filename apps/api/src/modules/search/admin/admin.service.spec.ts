import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../../prisma.service';
import { IndexingService } from '../indexing/indexing.service';
import { IndexManagerService } from '../indexing/index-manager.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;
  let indexing: any;
  let indexManager: any;
  let elasticsearch: any;

  beforeEach(async () => {
    prisma = { searchSynonym: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() }, searchHistory: { count: jest.fn(), groupBy: jest.fn() } };
    indexing = { enqueue: jest.fn(), listQueue: jest.fn() };
    indexManager = { listIndexes: jest.fn(), setStatus: jest.fn(), getIndexStatus: jest.fn() };
    elasticsearch = { ensureIndex: jest.fn(), health: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        { provide: IndexingService, useValue: indexing },
        { provide: IndexManagerService, useValue: indexManager },
        { provide: ElasticsearchService, useValue: elasticsearch },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  it('reindexes and returns started', async () => {
    indexManager.setStatus.mockResolvedValue({});
    indexing.enqueue.mockResolvedValue({});

    const result = await service.reindex('tenant-1', 'orders');

    expect(result.started).toBe(true);
  });

  it('creates synonym', async () => {
    prisma.searchSynonym.create.mockResolvedValue({ id: 's1', term: 'truck', synonymsArray: ['lorry'], entityType: null, createdAt: new Date(), updatedAt: new Date() });

    const result = await service.createSynonym('tenant-1', 'user-1', { terms: ['truck', 'lorry'] } as any);

    expect(result.terms).toEqual(['truck', 'lorry']);
  });

  it('returns analytics', async () => {
    prisma.searchHistory.count.mockResolvedValue(2);
    prisma.searchHistory.groupBy
      .mockResolvedValueOnce([{ userId: 'u1' }])
      .mockResolvedValueOnce([{ entityType: 'ORDERS', _count: { entityType: 1 } }])
      .mockResolvedValueOnce([{ searchTerm: 'load', _count: { searchTerm: 2 } }]);

    const result = await service.analytics('tenant-1');

    expect(result.totalQueries).toBe(2);
  });

  it('returns queue status', async () => {
    indexing.listQueue.mockResolvedValue([{ id: 'q1' }]);

    const result = await service.queueStatus('tenant-1', { status: 'pending', limit: 1 } as any);

    expect(result).toEqual([{ id: 'q1' }]);
  });
});
