import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { PrismaService } from '../../../prisma.service';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let prisma: {
    claim: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    claimTimeline: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      claim: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimsService);
  });

  it('creates claim with draft status and items', async () => {
    prisma.claim.count.mockResolvedValue(0);
    prisma.claim.create.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.create('tenant-1', 'user-1', {
      claimType: 'DAMAGE',
      description: 'Desc',
      incidentDate: '2025-01-01',
      claimedAmount: 100,
      items: [{ description: 'Item', quantity: 2, unitPrice: 10 }],
    } as any);

    expect(prisma.claim.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          status: 'DRAFT',
          createdById: 'user-1',
        }),
        include: expect.objectContaining({ items: true, documents: true, notes: true }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('finds claims with filters and pagination', async () => {
    prisma.claim.findMany.mockResolvedValue([]);
    prisma.claim.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { search: 'CLM', page: 2, limit: 10 } as any);

    expect(prisma.claim.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null, OR: expect.any(Array) }),
        skip: 10,
        take: 10,
      }),
    );
  });

  it('throws when claim not found', async () => {
    prisma.claim.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('prevents update when claim closed', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'CLOSED' });

    await expect(
      service.update('tenant-1', 'user-1', 'c1', { description: 'New' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates claim fields and records timeline', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.claim.update.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.update('tenant-1', 'user-1', 'c1', {
      description: 'Updated',
      receivedDate: null,
      dueDate: '2025-02-01',
      loadId: null,
      orderId: 'o1',
    } as any);

    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'Updated',
          receivedDate: null,
          dueDate: new Date('2025-02-01'),
          load: { disconnect: true },
          order: { connect: { id: 'o1' } },
        }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('files claim only when draft', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'SUBMITTED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.fileClaim('tenant-1', 'user-1', 'c1', {
      receivedDate: '2025-01-02',
    } as any);

    expect(result.status).toBe('SUBMITTED');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUBMITTED', updatedById: 'user-1' }),
      }),
    );
  });

  it('rejects fileClaim when not draft', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'SUBMITTED' });

    await expect(service.fileClaim('tenant-1', 'user-1', 'c1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('assigns claim and records timeline', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.claim.update.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.assign('tenant-1', 'user-1', 'c1', { assignedToId: 'u2' } as any);

    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignedToId: 'u2', updatedById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('assigns claim with due date', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.claim.update.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.assign('tenant-1', 'user-1', 'c1', { assignedToId: 'u2', dueDate: '2025-03-01' } as any);

    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dueDate: new Date('2025-03-01') }),
      }),
    );
  });

  it('prevents reopening closed claim', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'CLOSED' });

    await expect(
      service.updateStatus('tenant-1', 'user-1', 'c1', { status: 'SUBMITTED' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates status to closed and sets closed date', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'SUBMITTED', closedDate: null });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'CLOSED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.updateStatus('tenant-1', 'user-1', 'c1', { status: 'CLOSED', reason: 'Done' } as any);

    expect(result.status).toBe('CLOSED');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ closedDate: expect.any(Date) }) }),
    );
  });

  it('updates status without closing date change', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'SUBMITTED', closedDate: new Date('2025-01-01') });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'IN_REVIEW', closedDate: new Date('2025-01-01') });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.updateStatus('tenant-1', 'user-1', 'c1', { status: 'IN_REVIEW' } as any);

    expect(result.status).toBe('IN_REVIEW');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ closedDate: new Date('2025-01-01') }) }),
    );
  });

  it('soft deletes claim and records timeline', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    prisma.claim.update.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.delete('tenant-1', 'user-1', 'c1');

    expect(result).toEqual({ success: true });
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('generateClaimNumber throws after retries', async () => {
    prisma.claim.count.mockResolvedValue(1);

    await expect((service as any).generateClaimNumber('tenant-1', 4)).rejects.toThrow(BadRequestException);
  });
});