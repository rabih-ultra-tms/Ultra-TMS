import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResolutionService } from './resolution.service';
import { PrismaService } from '../../../prisma.service';

describe('ResolutionService', () => {
  let service: ResolutionService;
  let prisma: {
    claim: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    claimTimeline: { create: jest.Mock };
    claimAdjustment: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      claim: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
      claimAdjustment: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ResolutionService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ResolutionService);
  });

  it('throws when approving closed claim', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'CLOSED' });

    await expect(
      service.approve('tenant-1', 'user-1', 'c1', { approvedAmount: 100 } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('approves claim and records timeline', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT', disposition: null });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'APPROVED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.approve('tenant-1', 'user-1', 'c1', { approvedAmount: 100 } as any);

    expect(result.status).toBe('APPROVED');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'APPROVED', approvedAmount: 100, updatedById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('denies claim and sets closed date', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT', disposition: null, customFields: {} });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'DENIED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.deny('tenant-1', 'user-1', 'c1', { reason: 'Invalid' } as any);

    expect(result.status).toBe('DENIED');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DENIED', closedDate: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
  });

  it('rejects payment when status not approved or settled', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'DRAFT' });

    await expect(
      service.pay('tenant-1', 'user-1', 'c1', { amount: 10 } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('records payment and closes when paid >= approved', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'APPROVED', approvedAmount: 50, paidAmount: 40 });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'CLOSED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.pay('tenant-1', 'user-1', 'c1', { amount: 10 } as any);

    expect(result.status).toBe('CLOSED');
    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paidAmount: 50, status: 'CLOSED', closedDate: expect.any(Date) }),
      }),
    );
  });

  it('closes claim with reason', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1', status: 'APPROVED', customFields: {} });
    prisma.claim.update.mockResolvedValue({ id: 'c1', status: 'CLOSED' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.close('tenant-1', 'user-1', 'c1', { reason: 'Settled' } as any);

    expect(result.status).toBe('CLOSED');
    expect(prisma.claim.update).toHaveBeenCalled();
  });

  it('updates investigation details', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.claim.update.mockResolvedValue({ id: 'c1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.updateInvestigation('tenant-1', 'user-1', 'c1', { investigationNotes: 'Notes' } as any);

    expect(prisma.claim.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ investigationNotes: 'Notes', updatedById: 'user-1' }),
      }),
    );
  });

  it('lists adjustments', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.claimAdjustment.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.listAdjustments('tenant-1', 'c1');

    expect(result).toEqual([{ id: 'a1' }]);
  });

  it('adds adjustment and records timeline', async () => {
    prisma.claim.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.claimAdjustment.create.mockResolvedValue({ id: 'a1', adjustmentType: 'CREDIT' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.addAdjustment('tenant-1', 'user-1', 'c1', { adjustmentType: 'CREDIT', amount: 10 } as any);

    expect(prisma.claimAdjustment.create).toHaveBeenCalled();
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('throws when adjustment missing', async () => {
    prisma.claimAdjustment.findFirst.mockResolvedValue(null);

    await expect(
      service.removeAdjustment('tenant-1', 'user-1', 'c1', 'a1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes adjustment with soft delete', async () => {
    prisma.claimAdjustment.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.claimAdjustment.update.mockResolvedValue({ id: 'a1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.removeAdjustment('tenant-1', 'user-1', 'c1', 'a1');

    expect(result).toEqual({ success: true });
    expect(prisma.claimAdjustment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
  });
});