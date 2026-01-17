import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../../../prisma.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: { kBArticle: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      kBArticle: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticlesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ArticlesService);
  });

  it('lists articles', async () => {
    prisma.kBArticle.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.kBArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('throws when article not found', async () => {
    prisma.kBArticle.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('creates article with slug and keywords', async () => {
    prisma.kBArticle.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'user-1', {
      title: 'Hello World',
      content: 'Body',
      isPublic: true,
      keywords: ['one', 'two'],
      isFeatured: true,
    } as any);

    expect(prisma.kBArticle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'hello-world',
          keywords: 'one,two',
          isPublished: true,
          publishedAt: expect.any(Date),
          customFields: { isFeatured: true },
        }),
      }),
    );
  });

  it('updates article and merges custom fields', async () => {
    prisma.kBArticle.findFirst.mockResolvedValue({ id: 'a1', title: 'Old', slug: 'old', customFields: { isFeatured: false } });
    prisma.kBArticle.update.mockResolvedValue({ id: 'a1' });

    await service.update('tenant-1', 'user-1', 'a1', { title: 'New', isFeatured: true } as any);

    expect(prisma.kBArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: 'New', customFields: { isFeatured: true } }) }),
    );
  });

  it('publishes article', async () => {
    prisma.kBArticle.findFirst.mockResolvedValue({ id: 'a1', customFields: { isFeatured: false } });
    prisma.kBArticle.update.mockResolvedValue({ id: 'a1' });

    await service.publish('tenant-1', 'user-1', 'a1', { isFeatured: true } as any);

    expect(prisma.kBArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isPublished: true, publishedAt: expect.any(Date) }) }),
    );
  });

  it('increments helpful feedback', async () => {
    prisma.kBArticle.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.kBArticle.update.mockResolvedValue({ id: 'a1' });

    await service.feedback('tenant-1', 'a1', { helpful: true } as any);

    expect(prisma.kBArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { helpfulCount: { increment: 1 } } }),
    );
  });

  it('increments unhelpful feedback', async () => {
    prisma.kBArticle.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.kBArticle.update.mockResolvedValue({ id: 'a1' });

    await service.feedback('tenant-1', 'a1', { helpful: false } as any);

    expect(prisma.kBArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { unhelpfulCount: { increment: 1 } } }),
    );
  });
});
