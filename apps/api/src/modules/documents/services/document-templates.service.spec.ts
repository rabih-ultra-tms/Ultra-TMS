import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentTemplatesService } from './document-templates.service';
import { PrismaService } from '../../../prisma.service';

describe('DocumentTemplatesService', () => {
  let service: DocumentTemplatesService;
  let prisma: {
    documentTemplate: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      documentTemplate: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentTemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DocumentTemplatesService);
  });

  it('finds templates excluding deleted', async () => {
    prisma.documentTemplate.findMany.mockResolvedValue([{ id: 'tpl-1' }]);

    await service.findAll('tenant-1', 'BOL');

    expect(prisma.documentTemplate.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', deletedAt: null, templateType: 'BOL' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('throws when template not found', async () => {
    prisma.documentTemplate.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'tpl-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('soft deletes template', async () => {
    prisma.documentTemplate.findFirst.mockResolvedValue({ id: 'tpl-1' });
    prisma.documentTemplate.update.mockResolvedValue({ id: 'tpl-1' });

    await service.remove('tenant-1', 'tpl-1');

    expect(prisma.documentTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('creates template', async () => {
    prisma.documentTemplate.create.mockResolvedValue({ id: 'tpl-1' });

    const result = await service.create('tenant-1', { name: 'BOL', templateType: 'BOL' } as any, 'user-1');

    expect(result.id).toBe('tpl-1');
  });

  it('updates template', async () => {
    prisma.documentTemplate.findFirst.mockResolvedValue({ id: 'tpl-1' });
    prisma.documentTemplate.update.mockResolvedValue({ id: 'tpl-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'tpl-1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });
});
