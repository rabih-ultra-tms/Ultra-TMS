import { Test, TestingModule } from '@nestjs/testing';
import { IndexingService } from './indexing.service';
import { PrismaService } from '../../../prisma.service';

describe('IndexingService', () => {
  let service: IndexingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { searchIndexQueue: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(IndexingService);
  });

  it('enqueues index job', async () => {
    prisma.searchIndexQueue.create.mockResolvedValue({ id: 'q1' });

    const result = await service.enqueue('tenant-1', 'orders', 'o1', 'INDEX' as any, 1);

    expect(result).toEqual({ id: 'q1' });
  });

  it('lists queue with status filter', async () => {
    prisma.searchIndexQueue.findMany.mockResolvedValue([]);

    const result = await service.listQueue('tenant-1', 'pending');

    expect(result).toEqual([]);
  });

  it('marks completed', async () => {
    prisma.searchIndexQueue.update.mockResolvedValue({ id: 'q1' });

    await service.markCompleted('q1');

    expect(prisma.searchIndexQueue.update).toHaveBeenCalled();
  });
});
