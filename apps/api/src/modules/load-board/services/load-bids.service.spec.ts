import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoadBidsService } from './load-bids.service';
import { PrismaService } from '../../../prisma.service';
import { BidStatus } from '../dto';

describe('LoadBidsService', () => {
  let service: LoadBidsService;
  let prisma: {
    loadPosting: { findFirst: jest.Mock };
    carrier: { findFirst: jest.Mock };
    loadBid: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      loadPosting: { findFirst: jest.fn() },
      carrier: { findFirst: jest.fn() },
      loadBid: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadBidsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(LoadBidsService);
  });

  it('throws when posting not found', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', { postingId: 'post-1', carrierId: 'car-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when posting inactive', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: 'EXPIRED' });

    await expect(
      service.create('tenant-1', { postingId: 'post-1', carrierId: 'car-1' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when carrier not found', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: 'ACTIVE' });
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', { postingId: 'post-1', carrierId: 'car-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('prevents duplicate active bid', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: 'ACTIVE' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1' });

    await expect(
      service.create('tenant-1', { postingId: 'post-1', carrierId: 'car-1' } as any),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.loadBid.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        postingId: 'post-1',
        carrierId: 'car-1',
        deletedAt: null,
        status: { in: [BidStatus.PENDING, BidStatus.COUNTERED] },
      },
    });
  });

  it('creates bid when posting active and carrier exists', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: 'ACTIVE' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.loadBid.findFirst.mockResolvedValue(null);
    prisma.loadBid.create.mockResolvedValue({ id: 'bid-1' });

    const result = await service.create('tenant-1', {
      postingId: 'post-1',
      loadId: 'load-1',
      carrierId: 'car-1',
      bidAmount: 1000,
      rateType: 'FLAT',
    } as any);

    expect(result).toEqual({ id: 'bid-1' });
  });

  it('finds bids excluding deleted', async () => {
    prisma.loadBid.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1');

    expect(prisma.loadBid.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('throws when bid not found on findOne', async () => {
    prisma.loadBid.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'bid-1')).rejects.toThrow(NotFoundException);
  });

  it('returns bid on findOne', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1' });

    const result = await service.findOne('tenant-1', 'bid-1');

    expect(result).toEqual({ id: 'bid-1' });
  });

  it('rejects update when bid status is not pending or countered', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1', status: BidStatus.ACCEPTED });

    await expect(service.update('tenant-1', 'bid-1', { notes: 'n' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('accepts bid via transaction', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1', postingId: 'post-1', loadId: 'load-1', carrierId: 'car-1', status: BidStatus.PENDING });
    prisma.$transaction.mockImplementation(async (cb: any) =>
      cb({
        loadBid: { update: jest.fn().mockResolvedValue({ id: 'bid-1', status: BidStatus.ACCEPTED }), updateMany: jest.fn() },
        loadPosting: { update: jest.fn() },
        load: { update: jest.fn() },
      }),
    );

    const result = await service.accept('tenant-1', 'bid-1', {} as any);

    expect(result.status).toBe(BidStatus.ACCEPTED);
  });

  it('rejects bid when pending', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1', status: BidStatus.PENDING });
    prisma.loadBid.update.mockResolvedValue({ id: 'bid-1', status: BidStatus.REJECTED });

    const result = await service.reject('tenant-1', 'bid-1', { rejectionReason: 'No' } as any);

    expect(result.status).toBe(BidStatus.REJECTED);
  });

  it('counters pending bid', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1', status: BidStatus.PENDING });
    prisma.loadBid.update.mockResolvedValue({ id: 'bid-1', status: BidStatus.COUNTERED });

    const result = await service.counter('tenant-1', 'bid-1', { counterAmount: 1200, counterNotes: 'x' } as any);

    expect(result.status).toBe(BidStatus.COUNTERED);
  });

  it('throws when posting not found for getForPosting', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.getForPosting('tenant-1', 'post-1')).rejects.toThrow(NotFoundException);
  });

  it('rejects withdraw when bid accepted', async () => {
    prisma.loadBid.findFirst.mockResolvedValue({ id: 'bid-1', status: BidStatus.ACCEPTED });

    await expect(service.withdraw('tenant-1', 'bid-1')).rejects.toThrow(BadRequestException);
  });

  it('expires old bids', async () => {
    prisma.loadBid.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.expireOldBids('tenant-1');

    expect(result.expiredCount).toBe(3);
  });
});
