import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../../prisma.service';
import { STORAGE_SERVICE } from '../../storage/storage.module';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: {
    document: {
      findFirst: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };
  const storageService = {
    getSignedUrl: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      document: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: STORAGE_SERVICE, useValue: storageService },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  it('throws when document not found', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'doc-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns download url for existing document', async () => {
    prisma.document.findFirst.mockResolvedValue({
      id: 'doc-1',
      name: 'Doc',
      filePath: 'path/file.pdf',
      deletedAt: null,
    });
    storageService.getSignedUrl.mockResolvedValue('https://signed-url');

    const result = await service.getDownloadUrl('tenant-1', 'doc-1');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'doc-1',
        name: 'Doc',
        downloadUrl: 'https://signed-url',
      }),
    );
    expect(storageService.getSignedUrl).toHaveBeenCalledWith('path/file.pdf', {
      expiresIn: 15 * 60,
    });
  });

  it('throws when generating download url for missing document', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.getDownloadUrl('tenant-1', 'doc-1')).rejects.toThrow(NotFoundException);
  });

  it('soft deletes document', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({ id: 'doc-1' });

    await service.remove('tenant-1', 'doc-1');

    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
      data: { deletedAt: expect.any(Date), status: 'DELETED' },
    });
  });

  it('throws when deleting missing document', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.remove('tenant-1', 'doc-1')).rejects.toThrow(NotFoundException);
  });

  it('creates a document', async () => {
    prisma.document.create.mockResolvedValue({ id: 'doc-1' });

    const result = await service.create('tenant-1', {
      name: 'Doc',
      documentType: 'BOL',
      fileName: 'doc.pdf',
      filePath: 'path/doc.pdf',
      fileSize: 100,
      mimeType: 'application/pdf',
      fileExtension: 'pdf',
      tags: ['urgent'],
      isPublic: true,
    } as any, 'user-1');

    expect(result.id).toBe('doc-1');
  });

  it('returns paginated documents', async () => {
    prisma.document.count.mockResolvedValue(1);
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }]);

    const result = await service.findAll('tenant-1', undefined, undefined, undefined, 1, 10);

    expect(result.data).toEqual([{ id: 'doc-1' }]);
    expect(result.pagination.total).toBe(1);
  });

  it('filters documents by type and entity', async () => {
    prisma.document.count.mockResolvedValue(2);
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }, { id: 'doc-2' }]);

    const result = await service.findAll('tenant-1', 'BOL', 'ORDER', 'order-1', 2, 5);

    expect(result.pagination.page).toBe(2);
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ documentType: 'BOL', entityType: 'ORDER', entityId: 'order-1' }) }),
    );
  });

  it('updates document', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({ id: 'doc-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'doc-1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });

  it('throws when updating missing document', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'doc-1', { name: 'Updated' } as any)).rejects.toThrow(NotFoundException);
  });

  it('gets documents by entity', async () => {
    prisma.document.findMany.mockResolvedValue([{ id: 'doc-1' }]);

    const result = await service.getByEntity('tenant-1', 'ORDER', 'order-1');

    expect(result).toEqual([{ id: 'doc-1' }]);
  });

  it('updates OCR text', async () => {
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.document.update.mockResolvedValue({ id: 'doc-1', ocrProcessed: true });

    const result = await service.updateOcrText('tenant-1', 'doc-1', 'text');

    expect(result.ocrProcessed).toBe(true);
  });

  it('throws when updating OCR text for missing document', async () => {
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(service.updateOcrText('tenant-1', 'doc-1', 'text')).rejects.toThrow(NotFoundException);
  });
});
