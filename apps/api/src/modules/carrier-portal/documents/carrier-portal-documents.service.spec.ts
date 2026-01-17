import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CarrierDocumentType } from '@prisma/client';
import { CarrierPortalDocumentsService } from './carrier-portal-documents.service';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalDocumentsService', () => {
  let service: CarrierPortalDocumentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      carrierPortalDocument: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalDocumentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalDocumentsService);
  });

  it('lists documents', async () => {
    prisma.carrierPortalDocument.findMany.mockResolvedValue([]);

    const result = await service.list('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('uploads document', async () => {
    prisma.carrierPortalDocument.create.mockResolvedValue({ id: 'd1' });

    const result = await service.upload('t1', 'c1', 'u1', { fileName: 'a.pdf', fileSize: 1, mimeType: 'application/pdf', documentType: CarrierDocumentType.POD });

    expect(result.id).toBe('d1');
  });

  it('throws when document missing', async () => {
    prisma.carrierPortalDocument.findFirst.mockResolvedValue(null);

    await expect(service.get('t1', 'c1', 'd1')).rejects.toThrow(NotFoundException);
  });

  it('deletes document', async () => {
    prisma.carrierPortalDocument.findFirst.mockResolvedValue({ id: 'd1' });
    prisma.carrierPortalDocument.delete.mockResolvedValue({ id: 'd1' });

    const result = await service.delete('t1', 'c1', 'd1');

    expect(result.success).toBe(true);
  });
});
