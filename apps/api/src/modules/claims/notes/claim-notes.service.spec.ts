import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClaimNotesService } from './claim-notes.service';
import { PrismaService } from '../../../prisma.service';

describe('ClaimNotesService', () => {
  let service: ClaimNotesService;
  let prisma: {
    claim: { count: jest.Mock };
    claimNote: {
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
      claimNote: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimNotesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimNotesService);
  });

  it('lists notes after claim check', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimNote.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'claim-1');

    expect(prisma.claimNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', claimId: 'claim-1', deletedAt: null } }),
    );
  });

  it('throws when claim missing', async () => {
    prisma.claim.count.mockResolvedValue(0);

    await expect(service.list('tenant-1', 'claim-1')).rejects.toThrow(NotFoundException);
  });

  it('throws when note not found', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimNote.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'claim-1', 'note-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('adds note and records timeline', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimNote.create.mockResolvedValue({ id: 'note-1', noteType: 'GENERAL', isInternal: false });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.add('tenant-1', 'user-1', 'claim-1', {
      note: 'Test',
      noteType: 'GENERAL',
    } as any);

    expect(prisma.claimNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: 'tenant-1', createdById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('updates note and records timeline', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimNote.findFirst.mockResolvedValue({ id: 'note-1' });
    prisma.claimNote.update.mockResolvedValue({ id: 'note-1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.update('tenant-1', 'user-1', 'claim-1', 'note-1', { note: 'Updated' } as any);

    expect(prisma.claimNote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'note-1' },
        data: expect.objectContaining({ note: 'Updated', updatedById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('removes note with soft delete', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimNote.findFirst.mockResolvedValue({ id: 'note-1' });
    prisma.claimNote.update.mockResolvedValue({ id: 'note-1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.remove('tenant-1', 'user-1', 'claim-1', 'note-1');

    expect(result).toEqual({ success: true });
    expect(prisma.claimNote.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }) }),
    );
  });
});