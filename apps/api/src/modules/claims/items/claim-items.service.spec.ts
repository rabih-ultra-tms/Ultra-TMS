import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClaimItemsService } from './claim-items.service';
import { PrismaService } from '../../../prisma.service';

describe('ClaimItemsService', () => {
  let service: ClaimItemsService;
  let prisma: {
    claim: { count: jest.Mock };
    claimItem: {
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
      claimItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      claimTimeline: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimItemsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimItemsService);
  });

  it('lists items after ensuring claim exists', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimItem.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'claim-1');

    expect(prisma.claimItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', claimId: 'claim-1', deletedAt: null } }),
    );
  });

  it('throws when claim missing', async () => {
    prisma.claim.count.mockResolvedValue(0);

    await expect(service.list('tenant-1', 'claim-1')).rejects.toThrow(NotFoundException);
  });

  it('throws when item not found', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimItem.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'claim-1', 'item-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates item with default total value', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimItem.create.mockResolvedValue({ id: 'item-1', description: 'Item', totalValue: 20 });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.create('tenant-1', 'user-1', 'claim-1', {
      description: 'Item',
      quantity: 2,
      unitPrice: 10,
    } as any);

    expect(prisma.claimItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalValue: 20, createdById: 'user-1' }),
      }),
    );
    expect(prisma.claimTimeline.create).toHaveBeenCalled();
  });

  it('updates item and recalculates total value', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimItem.findFirst.mockResolvedValue({ id: 'item-1', quantity: 2, unitPrice: 10, description: 'Item' });
    prisma.claimItem.update.mockResolvedValue({ id: 'item-1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    await service.update('tenant-1', 'user-1', 'claim-1', 'item-1', {
      quantity: 3,
    } as any);

    expect(prisma.claimItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalValue: 30, updatedById: 'user-1' }),
      }),
    );
  });

  it('removes item with soft delete', async () => {
    prisma.claim.count.mockResolvedValue(1);
    prisma.claimItem.findFirst.mockResolvedValue({ id: 'item-1' });
    prisma.claimItem.update.mockResolvedValue({ id: 'item-1' });
    prisma.claimTimeline.create.mockResolvedValue({ id: 't1' });

    const result = await service.remove('tenant-1', 'user-1', 'claim-1', 'item-1');

    expect(result).toEqual({ success: true });
    expect(prisma.claimItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
  });
});