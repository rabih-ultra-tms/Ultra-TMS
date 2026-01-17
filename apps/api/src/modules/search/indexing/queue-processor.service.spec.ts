import { Test, TestingModule } from '@nestjs/testing';
import { QueueProcessorService } from './queue-processor.service';
import { PrismaService } from '../../../prisma.service';
import { IndexingService } from './indexing.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { IndexManagerService } from './index-manager.service';

describe('QueueProcessorService', () => {
  let service: QueueProcessorService;
  let prisma: any;
  let indexing: any;
  let elasticsearch: any;
  let indexManager: any;

  beforeEach(async () => {
    prisma = {
      searchIndexQueue: { findFirst: jest.fn() },
      company: { findMany: jest.fn(), findFirst: jest.fn() },
      order: { findMany: jest.fn(), findFirst: jest.fn() },
      load: { findMany: jest.fn(), findFirst: jest.fn() },
      carrier: { findMany: jest.fn(), findFirst: jest.fn() },
      document: { findMany: jest.fn(), findFirst: jest.fn() },
    };
    indexing = { markProcessing: jest.fn(), markCompleted: jest.fn(), markFailed: jest.fn() };
    elasticsearch = { deleteDocument: jest.fn(), indexDocument: jest.fn() };
    indexManager = { setStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueProcessorService,
        { provide: PrismaService, useValue: prisma },
        { provide: IndexingService, useValue: indexing },
        { provide: ElasticsearchService, useValue: elasticsearch },
        { provide: IndexManagerService, useValue: indexManager },
      ],
    }).compile();

    service = module.get(QueueProcessorService);
  });

  it('returns processed false when no queue item', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue(null);

    const result = await service.processNext('tenant-1');

    expect(result).toEqual({ processed: false });
  });

  it('processes delete operation', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue({ id: 'q1', operation: 'DELETE', entityType: 'orders', entityId: 'o1' });

    const result = await service.processNext('tenant-1');

    expect(result.processed).toBe(true);
    expect(elasticsearch.deleteDocument).toHaveBeenCalled();
    expect(indexing.markCompleted).toHaveBeenCalledWith('q1');
  });

  it('processes reindex operation and updates status', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue({ id: 'q3', operation: 'REINDEX', entityType: 'customers', entityId: 'any' });
    prisma.company.findMany.mockResolvedValue([
      { id: 'c1', name: 'Acme', status: 'ACTIVE' },
      { id: 'c2', name: 'Beta', status: 'ACTIVE' },
    ]);

    const result = await service.processNext('tenant-1');

    expect(result).toEqual({ processed: true, indexed: 2 });
    expect(elasticsearch.indexDocument).toHaveBeenCalledTimes(2);
    expect(indexing.markCompleted).toHaveBeenCalledWith('q3');
    expect(indexManager.setStatus).toHaveBeenCalledWith('tenant-1', 'customers', 'READY', undefined, 2);
  });

  it('processes index operation and maps document', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue({ id: 'q4', operation: 'INDEX', entityType: 'orders', entityId: 'o1' });
    prisma.order.findFirst.mockResolvedValue({
      id: 'o1',
      orderNumber: 'ORD-1',
      customerId: 'c1',
      status: 'NEW',
      commodity: 'Widgets',
      equipmentType: 'VAN',
      orderDate: '2026-01-01',
    });

    const result = await service.processNext('tenant-1');

    expect(result.processed).toBe(true);
    expect(elasticsearch.indexDocument).toHaveBeenCalledWith(
      'orders',
      'o1',
      expect.objectContaining({
        id: 'o1',
        entityType: 'orders',
        title: 'ORD-1',
        status: 'NEW',
      }),
    );
    expect(indexManager.setStatus).toHaveBeenCalledWith('tenant-1', 'orders', 'READY');
  });

  it('marks failed when entity missing', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue({ id: 'q2', operation: 'INDEX', entityType: 'orders', entityId: 'o1' });
    prisma.order.findFirst.mockResolvedValue(null);

    const result = await service.processNext('tenant-1');

    expect(result.processed).toBe(false);
    expect(indexing.markFailed).toHaveBeenCalled();
  });

  it('marks failed when indexing throws', async () => {
    prisma.searchIndexQueue.findFirst.mockResolvedValue({ id: 'q5', operation: 'INDEX', entityType: 'loads', entityId: 'l1' });
    prisma.load.findFirst.mockResolvedValue({ id: 'l1', loadNumber: 'LD1', status: 'PENDING' });
    elasticsearch.indexDocument.mockRejectedValue(new Error('boom'));

    const result = await service.processNext('tenant-1');

    expect(result).toEqual({ processed: false, error: 'boom' });
    expect(indexing.markFailed).toHaveBeenCalledWith('q5', 'boom');
  });
});
