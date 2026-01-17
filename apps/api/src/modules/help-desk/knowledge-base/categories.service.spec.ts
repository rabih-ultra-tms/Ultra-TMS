import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../../../prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: { tenantConfig: { findFirst: jest.Mock; upsert: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      tenantConfig: {
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CategoriesService);
  });

  it('lists categories with empty default', async () => {
    prisma.tenantConfig.findFirst.mockResolvedValue(null);

    const result = await service.listCategories('tenant-1');

    expect(result).toEqual([]);
  });

  it('creates category with slug', async () => {
    prisma.tenantConfig.findFirst.mockResolvedValue(null);
    prisma.tenantConfig.upsert.mockResolvedValue({});

    const result = await service.create('tenant-1', { name: 'Getting Started' } as any);

    expect(result.slug).toBe('getting-started');
    expect(prisma.tenantConfig.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ configKey: 'helpdesk.kb.categories' }) }),
    );
  });

  it('throws when updating missing category', async () => {
    prisma.tenantConfig.findFirst.mockResolvedValue({ configValue: [] });

    await expect(service.update('tenant-1', 'cat-1', { name: 'New' } as any)).rejects.toThrow(NotFoundException);
  });
});
