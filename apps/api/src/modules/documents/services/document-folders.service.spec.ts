import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocumentFoldersService } from './document-folders.service';
import { PrismaService } from '../../../prisma.service';

describe('DocumentFoldersService', () => {
  let service: DocumentFoldersService;
  let prisma: {
    documentFolder: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    document: { findFirst: jest.Mock };
    folderDocument: { create: jest.Mock; delete: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      documentFolder: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      document: { findFirst: jest.fn() },
      folderDocument: { create: jest.fn(), delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentFoldersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DocumentFoldersService);
  });

  it('throws when folder not found', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'folder-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('soft deletes folder', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue({ id: 'folder-1' });
    prisma.documentFolder.update.mockResolvedValue({ id: 'folder-1' });

    await service.remove('tenant-1', 'folder-1');

    expect(prisma.documentFolder.update).toHaveBeenCalledWith({
      where: { id: 'folder-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws when adding document to missing folder', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue(null);

    await expect(
      service.addDocument('tenant-1', 'folder-1', { documentId: 'doc-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when adding missing document', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue({ id: 'folder-1' });
    prisma.document.findFirst.mockResolvedValue(null);

    await expect(
      service.addDocument('tenant-1', 'folder-1', { documentId: 'doc-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates folder', async () => {
    prisma.documentFolder.create.mockResolvedValue({ id: 'folder-1' });

    const result = await service.create('tenant-1', { name: 'Folder' } as any, 'user-1');

    expect(result.id).toBe('folder-1');
  });

  it('lists folders', async () => {
    prisma.documentFolder.findMany.mockResolvedValue([{ id: 'folder-1' }]);

    const result = await service.findAll('tenant-1');

    expect(result).toEqual([{ id: 'folder-1' }]);
  });

  it('updates folder', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue({ id: 'folder-1' });
    prisma.documentFolder.update.mockResolvedValue({ id: 'folder-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'folder-1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });

  it('adds document to folder', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue({ id: 'folder-1' });
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.folderDocument.create.mockResolvedValue({ folderId: 'folder-1', documentId: 'doc-1' });

    const result = await service.addDocument('tenant-1', 'folder-1', { documentId: 'doc-1' } as any);

    expect(result).toEqual(expect.objectContaining({ folderId: 'folder-1', documentId: 'doc-1' }));
  });

  it('removes document from folder', async () => {
    prisma.documentFolder.findFirst.mockResolvedValue({ id: 'folder-1' });
    prisma.document.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.folderDocument.delete.mockResolvedValue({ folderId: 'folder-1', documentId: 'doc-1' });

    const result = await service.removeDocument('tenant-1', 'folder-1', 'doc-1');

    expect(result).toEqual(expect.objectContaining({ folderId: 'folder-1', documentId: 'doc-1' }));
  });
});
