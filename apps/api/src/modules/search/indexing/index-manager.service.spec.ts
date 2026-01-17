import { Test, TestingModule } from '@nestjs/testing';
import { IndexManagerService } from './index-manager.service';
import { PrismaService } from '../../../prisma.service';

describe('IndexManagerService', () => {
  let service: IndexManagerService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { searchIndex: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), create: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexManagerService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(IndexManagerService);
  });

  it('lists indexes', async () => {
    prisma.searchIndex.findMany.mockResolvedValue([]);

    const result = await service.listIndexes('tenant-1');

    expect(result).toEqual([]);
  });

  it('updates status when index exists', async () => {
    prisma.searchIndex.findFirst.mockResolvedValue({ id: 'i1', documentCount: 1 });
    prisma.searchIndex.update.mockResolvedValue({ id: 'i1' });

    const result = await service.setStatus('tenant-1', 'orders', 'READY');

    expect(result).toEqual({ id: 'i1' });
  });

  it('creates index when missing', async () => {
    prisma.searchIndex.findFirst.mockResolvedValue(null);
    prisma.searchIndex.create.mockResolvedValue({ id: 'i2' });

    const result = await service.setStatus('tenant-1', 'orders', 'READY');

    expect(result).toEqual({ id: 'i2' });
  });
});
