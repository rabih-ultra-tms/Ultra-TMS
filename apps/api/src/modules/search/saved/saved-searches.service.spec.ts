import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SavedSearchesService } from './saved-searches.service';
import { PrismaService } from '../../../prisma.service';
import { EntitySearchService } from '../entities/entity-search.service';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;
  let prisma: any;
  let entitySearch: { search: jest.Mock };

  beforeEach(async () => {
    prisma = { savedSearch: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() } };
    entitySearch = { search: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchesService,
        { provide: PrismaService, useValue: prisma },
        { provide: EntitySearchService, useValue: entitySearch },
      ],
    }).compile();

    service = module.get(SavedSearchesService);
  });

  it('lists saved searches', async () => {
    prisma.savedSearch.findMany.mockResolvedValue([
      {
        id: 's1',
        name: 'Test',
        description: null,
        entityType: 'LOADS',
        query: { q: 'foo' },
        filters: { status: 'OPEN' },
        isPublic: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      },
    ]);

    const result = await service.listSaved('tenant-1', 'user-1');

    expect(result[0]).toEqual(
      expect.objectContaining({ id: 's1', queryText: 'foo', filters: { status: 'OPEN' }, entityType: 'LOADS' }),
    );
  });

  it('throws when saved search missing', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue(null);

    await expect(service.getSaved('tenant-1', 'user-1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('returns saved search when found', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue({
      id: 's1',
      name: 'Test',
      description: null,
      entityType: 'ORDERS',
      query: { q: 'abc' },
      filters: null,
      isPublic: false,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-02'),
    });

    const result = await service.getSaved('tenant-1', 'user-1', 's1');

    expect(result.queryText).toBe('abc');
    expect(result.filters).toBeUndefined();
  });

  it('creates saved search with defaults', async () => {
    prisma.savedSearch.create.mockResolvedValue({
      id: 's2',
      name: 'My search',
      description: null,
      entityType: 'DOCUMENTS',
      query: { q: 'doc' },
      filters: {},
      isPublic: false,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    const result = await service.createSaved('tenant-1', 'user-1', {
      name: 'My search',
      entityType: 'DOCUMENTS',
      queryText: 'doc',
    } as any);

    expect(result.id).toBe('s2');
    expect(prisma.savedSearch.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isPublic: false }) }),
    );
  });

  it('updates saved search fields', async () => {
    prisma.savedSearch.findFirst
      .mockResolvedValueOnce({ id: 's1', entityType: 'ORDERS', query: { q: 'old' }, filters: null, isPublic: false })
      .mockResolvedValueOnce({ id: 's1', entityType: 'ORDERS', query: { q: 'new' }, filters: { status: 'OPEN' }, isPublic: true });
    prisma.savedSearch.update.mockResolvedValue({ id: 's1' });

    const result = await service.updateSaved('tenant-1', 'user-1', 's1', {
      queryText: 'new',
      filters: { status: 'OPEN' },
      isPublic: true,
    } as any);

    expect(result.queryText).toBe('new');
  });

  it('deletes saved search', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue({ id: 's1', entityType: 'ORDERS' });
    prisma.savedSearch.update.mockResolvedValue({ id: 's1' });

    await service.deleteSaved('tenant-1', 'user-1', 's1');

    expect(prisma.savedSearch.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
  });

  it('executes saved search', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue({ id: 's1', entityType: 'ORDERS', query: { q: 'test' }, filters: null });
    entitySearch.search.mockResolvedValue({ total: 0, results: [] });

    const result = await service.executeSaved('tenant-1', 'user-1', 's1');

    expect(result.total).toBe(0);
  });

  it('executes saved search for loads entity type', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue({ id: 's2', entityType: 'LOADS', query: { q: 'load' }, filters: {} });
    entitySearch.search.mockResolvedValue({ total: 1, results: ['l1'] });

    const result = await service.executeSaved('tenant-1', 'user-1', 's2');

    expect(result.results).toEqual(['l1']);
    expect(entitySearch.search).toHaveBeenCalledWith('tenant-1', 'user-1', 'loads', expect.any(Object));
  });

  it('throws when executing missing saved search', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue(null);

    await expect(service.executeSaved('tenant-1', 'user-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('shares saved search', async () => {
    prisma.savedSearch.findFirst.mockResolvedValue({ id: 's1', entityType: 'ORDERS', isPublic: false });
    prisma.savedSearch.update.mockResolvedValue({ id: 's1' });

    const result = await service.shareSaved('tenant-1', 'user-1', 's1', { isPublic: true } as any);

    expect(result.id).toBe('s1');
  });
});
