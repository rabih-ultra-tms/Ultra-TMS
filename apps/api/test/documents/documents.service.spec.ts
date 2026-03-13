import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../../src/modules/documents/services/documents.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DocumentsService (MP-07-009)', () => {
  let service: DocumentsService;
  let prisma: PrismaService;

  // Mock storage service
  const mockStorageService = {
    upload: jest.fn().mockResolvedValue('/path/to/file'),
    getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.example.com'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: {} },
        { provide: 'STORAGE_SERVICE', useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should create a document', async () => {
      const mockDoc = { id: 'doc-1', tenantId: 'tenant-1', name: 'Test.pdf' };
      jest
        .spyOn(prisma.document || {}, 'create')
        .mockResolvedValue(mockDoc as any);

      const result = await service.create(
        'tenant-1',
        { name: 'Test.pdf' },
        'user-1'
      );
      expect(result.id).toBe('doc-1');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should read a document', async () => {
      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'Read.pdf',
        deletedAt: null,
      };
      jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValue(mockDoc as any);

      const result = await service.findOne('tenant-1', 'doc-1');
      expect(result?.id).toBe('doc-1');
    });

    it('should update a document', async () => {
      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'Updated.pdf',
        deletedAt: null,
      };
      jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValue(mockDoc as any);
      jest
        .spyOn(prisma.document || {}, 'update')
        .mockResolvedValue(mockDoc as any);

      const result = await service.update('tenant-1', 'doc-1', {
        name: 'Updated.pdf',
      });
      expect(result.name).toBe('Updated.pdf');
    });

    it('should soft-delete a document', async () => {
      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'Delete.pdf',
        deletedAt: null,
      };
      const deletedDoc = {
        ...mockDoc,
        deletedAt: new Date(),
        status: 'DELETED',
      };

      jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValueOnce(mockDoc as any);
      jest
        .spyOn(prisma.document || {}, 'update')
        .mockResolvedValue(deletedDoc as any);

      const result = await service.remove('tenant-1', 'doc-1');
      expect(result.deletedAt).toBeDefined();
      expect(result.status).toBe('DELETED');
    });
  });

  describe('Soft-Delete Filtering', () => {
    it('should not return deleted documents in list', async () => {
      const docs = [{ id: 'doc-1', name: 'Active.pdf', deletedAt: null }];
      const total = 1;

      jest.spyOn(prisma.document || {}, 'count').mockResolvedValue(total);
      jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue(docs as any);

      const result = await service.findAll('tenant-1');
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('Active.pdf');
      expect(result.pagination.total).toBe(1);
    });

    it('should filter deleted documents in WHERE clause', async () => {
      const findManyMock = jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue([]);
      jest.spyOn(prisma.document || {}, 'count').mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('Cross-Tenant Isolation', () => {
    it('should not return documents from other tenants', async () => {
      jest.spyOn(prisma.document || {}, 'findFirst').mockResolvedValue(null);

      const result = await service.findOne('tenant-1', 'doc-1');
      expect(result).toBeNull();
    });

    it('should verify tenantId in WHERE clause for findOne', async () => {
      const findFirstMock = jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValue(null);

      await service.findOne('tenant-1', 'doc-1');

      expect(findFirstMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            id: 'doc-1',
            deletedAt: null,
          }),
        })
      );
    });

    it('should reject update for cross-tenant document', async () => {
      jest.spyOn(prisma.document || {}, 'findFirst').mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'doc-1', { name: 'Hack.pdf' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Download URL Generation', () => {
    it('should generate signed download URL', async () => {
      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'File.pdf',
        filePath: '/file.pdf',
        deletedAt: null,
      };
      jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValue(mockDoc as any);
      mockStorageService.getSignedUrl.mockResolvedValue(
        'https://signed-url.example.com/file.pdf?expires=123'
      );

      const result = await service.getDownloadUrl('tenant-1', 'doc-1');

      expect(result.downloadUrl).toContain('https://signed-url');
      expect(result.expiresAt).toBeDefined();
      expect(result.id).toBe('doc-1');
    });

    it('should throw not found for missing document', async () => {
      jest.spyOn(prisma.document || {}, 'findFirst').mockResolvedValue(null);

      await expect(
        service.getDownloadUrl('tenant-1', 'missing')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Entity-Based Filtering', () => {
    it('should filter documents by entity type and ID', async () => {
      const docs = [
        {
          id: 'doc-1',
          entityType: 'Load',
          entityId: 'load-1',
          deletedAt: null,
        },
        {
          id: 'doc-2',
          entityType: 'Load',
          entityId: 'load-1',
          deletedAt: null,
        },
      ];

      jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue(docs as any);

      const result = await service.getByEntity('tenant-1', 'Load', 'load-1');

      expect(result.length).toBe(2);
      expect(result[0].entityId).toBe('load-1');
    });

    it('should verify filters in WHERE clause', async () => {
      const findManyMock = jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue([]);

      await service.getByEntity('tenant-1', 'Load', 'load-1');

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            entityType: 'Load',
            entityId: 'load-1',
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('OCR Text Update', () => {
    it('should update OCR text for document', async () => {
      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'Scan.pdf',
        deletedAt: null,
      };
      const updated = {
        ...mockDoc,
        ocrText: 'Extracted text',
        ocrProcessed: true,
        ocrProcessedAt: new Date(),
      };

      jest
        .spyOn(prisma.document || {}, 'findFirst')
        .mockResolvedValue(mockDoc as any);
      jest
        .spyOn(prisma.document || {}, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.updateOcrText(
        'tenant-1',
        'doc-1',
        'Extracted text'
      );

      expect(result.ocrText).toBe('Extracted text');
      expect(result.ocrProcessed).toBe(true);
      expect(result.ocrProcessedAt).toBeDefined();
    });

    it('should throw not found for missing document', async () => {
      jest.spyOn(prisma.document || {}, 'findFirst').mockResolvedValue(null);

      await expect(
        service.updateOcrText('tenant-1', 'missing', 'text')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Upload and Create', () => {
    it('should upload file and create document', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'invoice.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      };

      const mockDoc = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        name: 'Invoice',
        filePath: '/path/to/file',
        fileName: 'invoice.pdf',
        mimeType: 'application/pdf',
      };

      jest
        .spyOn(prisma.document || {}, 'create')
        .mockResolvedValue(mockDoc as any);
      mockStorageService.upload.mockResolvedValue('/path/to/file');

      const result = await service.uploadAndCreate(
        'tenant-1',
        mockFile as any,
        { name: 'Invoice', documentType: 'INVOICE' },
        'user-1'
      );

      expect(result.filePath).toBe('/path/to/file');
      expect(mockStorageService.upload).toHaveBeenCalled();
    });
  });

  describe('Pagination', () => {
    it('should return paginated results with defaults', async () => {
      const docs = [{ id: 'doc-1', name: 'File.pdf' }];

      jest.spyOn(prisma.document || {}, 'count').mockResolvedValue(1);
      jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue(docs as any);

      const result = await service.findAll('tenant-1');

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply custom page and limit', async () => {
      const findManyMock = jest
        .spyOn(prisma.document || {}, 'findMany')
        .mockResolvedValue([]);
      jest.spyOn(prisma.document || {}, 'count').mockResolvedValue(100);

      await service.findAll('tenant-1', undefined, undefined, undefined, 2, 10);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2 - 1) * 10
          take: 10,
        })
      );
    });
  });
});
