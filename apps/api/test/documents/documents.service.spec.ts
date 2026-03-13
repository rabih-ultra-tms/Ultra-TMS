import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../../src/modules/documents/documents.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('DocumentsService (MP-07-009)', () => {
  let service: DocumentsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, PrismaService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('CRUD Operations', () => {
    it('should create a document', async () => {
      const result = await service.createDocument(
        { name: 'Test.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      expect(result).toHaveProperty('id');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should read a document', async () => {
      const doc = await service.createDocument(
        { name: 'Read.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      const result = await service.getDocument(doc.id, 'tenant-1', 'user-1');
      expect(result?.id).toBe(doc.id);
    });

    it('should update a document', async () => {
      const doc = await service.createDocument(
        { name: 'Update.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      const result = await service.updateDocument(
        doc.id,
        { name: 'Updated.pdf' },
        'tenant-1'
      );
      expect(result.name).toBe('Updated.pdf');
    });

    it('should soft-delete a document', async () => {
      const doc = await service.createDocument(
        { name: 'Delete.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      await service.deleteDocument(doc.id, 'tenant-1');
      const result = await service.getDocument(doc.id, 'tenant-1', 'user-1');
      expect(result).toBeNull();
    });
  });

  describe('Soft-Delete Filtering', () => {
    it('should not return deleted documents in list', async () => {
      const doc = await service.createDocument(
        { name: 'Hidden.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      await service.deleteDocument(doc.id, 'tenant-1');

      const list = await service.listDocuments('tenant-1');
      expect(list.find((d) => d.id === doc.id)).toBeUndefined();
    });
  });

  describe('Guard Integration', () => {
    it('should deny cross-tenant access', async () => {
      const doc = await service.createDocument(
        { name: 'Secret.pdf', folderId: 'f1' },
        'tenant-1',
        'user-1'
      );
      const result = await service.getDocument(doc.id, 'tenant-2', 'user-2');
      expect(result).toBeNull();
    });
  });
});
