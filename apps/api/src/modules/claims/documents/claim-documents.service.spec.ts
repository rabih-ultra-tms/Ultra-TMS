import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClaimDocumentsService } from './claim-documents.service';
import { PrismaService } from '../../../prisma.service';

describe('ClaimDocumentsService', () => {
  let service: ClaimDocumentsService;
  let prisma: {
    claim: { count: jest.Mock };
    claimDocument: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    claimTimeline: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      claim: { count: jest.fn() },
      claimDocument: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimDocumentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimDocumentsService);
  });

  it('lists documents after claim check', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimDocument.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'claim-1');

    expect(prisma.claimDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', claimId: 'claim-1', deletedAt: null } }),
    );
  });

  it('throws when claim missing', async () => {
    prisma.claim.count.mockResolvedValue(0);

    await expect(service.list('tenant-1', 'claim-1')).rejects.toThrow(NotFoundException);
  });

  it('adds document and records timeline', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimDocument.create.mockResolvedValue({ id: 'doc-1', documentType: 'POD' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.add('tenant-1', 'user-1', 'claim-1', {
      documentId: 'd1',
      documentType: 'POD',
      description: 'Proof',
    } as any);

    expect(prisma.claimDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('removes document with soft delete', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimDocument.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.claimDocument.update.mockResolvedValue({ id: 'doc-1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.remove('tenant-1', 'user-1', 'claim-1', 'doc-1');

    expect(result).toEqual({ success: true });
    expect(prisma.claimDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }) }),
    );
  });

  it('throws when document missing', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimDocument.findFirst.mockResolvedValue(null);

    await expect(service.remove('tenant-1', 'user-1', 'claim-1', 'doc-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});