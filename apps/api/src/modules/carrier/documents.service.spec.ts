import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma.service';
import { DocumentStatus } from './dto';

describe('Carrier DocumentsService', () => {
  let service: DocumentsService;
  let prisma: {
    carrier: { findFirst: jest.Mock };
    carrierDocument: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      carrier: { findFirst: jest.fn() },
      carrierDocument: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DocumentsService);
  });

  it('throws when carrier missing on list', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.list('tenant-1', 'car-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects when document missing on update', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tenant-1', 'car-1', 'doc-1', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('requires rejection reason', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue({ id: 'doc-1' });

    await expect(
      service.reject('tenant-1', 'car-1', 'doc-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('soft deletes document', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.carrierDocument.update.mockResolvedValue({ id: 'doc-1' });

    await service.remove('tenant-1', 'car-1', 'doc-1');

    expect(prisma.carrierDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc-1' },
      data: { deletedAt: expect.any(Date), status: DocumentStatus.REJECTED },
    });
  });

  it('lists documents for carrier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.carrierDocument.findMany.mockResolvedValue([{ id: 'doc-1' }]);

    const result = await service.list('tenant-1', 'car-1');

    expect(result).toEqual([{ id: 'doc-1' }]);
  });

  it('creates document', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.carrierDocument.create.mockResolvedValue({ id: 'doc-1' });

    const result = await service.create('tenant-1', 'car-1', {
      documentType: 'W9',
      fileUrl: 'url',
      expirationDate: new Date().toISOString(),
    } as any);

    expect(result.id).toBe('doc-1');
  });

  it('rejects create when carrier missing', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'car-1', { documentType: 'W9', fileUrl: 'url' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('approves document', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.carrierDocument.update.mockResolvedValue({ id: 'doc-1', status: DocumentStatus.APPROVED });

    const result = await service.approve('tenant-1', 'car-1', 'doc-1');

    expect(result.status).toBe(DocumentStatus.APPROVED);
  });

  it('throws when approving missing document', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue(null);

    await expect(service.approve('tenant-1', 'car-1', 'doc-1')).rejects.toThrow(NotFoundException);
  });

  it('rejects document with reason', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.carrierDocument.update.mockResolvedValue({ id: 'doc-1', status: DocumentStatus.REJECTED });

    const result = await service.reject('tenant-1', 'car-1', 'doc-1', 'missing');

    expect(result.status).toBe(DocumentStatus.REJECTED);
  });

  it('updates document expiration date', async () => {
    prisma.carrierDocument.findFirst.mockResolvedValue({
      id: 'doc-1',
      documentType: 'W9',
      name: 'Doc',
      description: null,
      filePath: 'path',
      mimeType: 'text/plain',
      expirationDate: null,
      status: DocumentStatus.PENDING,
      rejectionReason: null,
    });
    prisma.carrierDocument.update.mockResolvedValue({ id: 'doc-1', expirationDate: new Date('2026-01-01') });

    const result = await service.update('tenant-1', 'car-1', 'doc-1', { expirationDate: '2026-01-01' } as any);

    expect(result.expirationDate).toEqual(new Date('2026-01-01'));
  });
});
