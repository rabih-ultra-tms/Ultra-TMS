import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { PrismaService } from '../../../prisma.service';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let prisma: {
    carrierWatchlist: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    carrier: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      carrierWatchlist: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      carrier: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchlistService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(WatchlistService);
  });

  it('lists watchlist entries', async () => {
    prisma.carrierWatchlist.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.carrierWatchlist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('creates watchlist entry', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'carrier-1' });
    prisma.carrierWatchlist.create.mockResolvedValue({ id: 'w1' });

    await service.create('tenant-1', 'user-1', { carrierId: 'carrier-1', reason: 'Risk' } as any);

    expect(prisma.carrierWatchlist.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isRestricted: false, createdById: 'user-1' }) }),
    );
  });

  it('throws when carrier missing for create', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.create('tenant-1', 'user-1', { carrierId: 'carrier-1' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updates watchlist entry', async () => {
    prisma.carrierWatchlist.findFirst.mockResolvedValue({ id: 'w1' });
    prisma.carrierWatchlist.update.mockResolvedValue({ id: 'w1' });

    await service.update('tenant-1', 'user-1', 'w1', { reason: 'Updated' } as any);

    expect(prisma.carrierWatchlist.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ reason: 'Updated', updatedById: 'user-1' }) }),
    );
  });

  it('resolves watchlist entry', async () => {
    prisma.carrierWatchlist.findFirst.mockResolvedValue({ id: 'w1' });
    prisma.carrierWatchlist.update.mockResolvedValue({ id: 'w1' });

    await service.resolve('tenant-1', 'user-1', 'w1', { resolutionNotes: 'OK' } as any);

    expect(prisma.carrierWatchlist.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isActive: false, resolutionNotes: 'OK' }) }),
    );
  });

  it('throws when watchlist entry missing', async () => {
    prisma.carrierWatchlist.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'w1')).rejects.toThrow(NotFoundException);
  });
});
