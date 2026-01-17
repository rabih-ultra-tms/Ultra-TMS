import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LoadPostingsService } from './load-postings.service';
import { PrismaService } from '../../../prisma.service';
import { GeocodingService } from './geocoding.service';
import { PostingStatus } from '../dto';

describe('LoadPostingsService', () => {
  let service: LoadPostingsService;
  let prisma: {
    load: { findFirst: jest.Mock };
    loadPosting: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
    carrierLoadView: { upsert: jest.Mock };
  };
  const geocodingService = {
    getCoordinates: jest.fn(),
    getCoordinatesFromZip: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      load: { findFirst: jest.fn() },
      loadPosting: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      carrierLoadView: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadPostingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeocodingService, useValue: geocodingService },
      ],
    }).compile();

    service = module.get(LoadPostingsService);
  });

  it('throws when load not found on create', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.create('tenant-1', { loadId: 'load-1' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates load posting with defaults', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'load-1',
      equipmentType: 'VAN',
      order: {
        weightLbs: 1000,
        stops: [
          { stopType: 'PICKUP', city: 'Dallas', state: 'TX', postalCode: '75001', latitude: 32.9, longitude: -96.8, appointmentDate: new Date('2026-01-01') },
          { stopType: 'DELIVERY', city: 'LA', state: 'CA', postalCode: '90001', latitude: 34.0, longitude: -118.2, appointmentDate: new Date('2026-01-03') },
        ],
      },
    });
    prisma.loadPosting.create.mockResolvedValue({ id: 'post-1' });

    const result = await service.create('tenant-1', { loadId: 'load-1', postingType: 'PUBLIC' } as any, 'user-1');

    expect(result.id).toBe('post-1');
    expect(prisma.loadPosting.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originCity: 'Dallas',
          destCity: 'LA',
          autoRefresh: true,
          refreshInterval: 4,
        }),
      }),
    );
  });

  it('finds postings with state filters and ranges', async () => {
    prisma.loadPosting.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1', {
      originState: 'TX',
      destState: 'CA',
      equipmentType: 'VAN',
      pickupDateFrom: '2024-01-01',
      pickupDateTo: '2024-01-31',
      minRate: 100,
      maxRate: 200,
      page: 1,
      limit: 10,
    } as any);

    expect(prisma.loadPosting.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          originState: 'TX',
          destState: 'CA',
          equipmentType: 'VAN',
          pickupDate: expect.objectContaining({
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          }),
          postedRate: expect.objectContaining({ gte: 100, lte: 200 }),
        }),
      }),
    );
  });

  it('finds postings using geocoded origin and destination with distance sorting', async () => {
    geocodingService.getCoordinates.mockResolvedValueOnce({ latitude: 32.9, longitude: -96.8 });
    geocodingService.getCoordinates.mockResolvedValueOnce({ latitude: 34.0, longitude: -118.2 });
    prisma.loadPosting.findMany.mockResolvedValue([
      { id: 'p1', originLat: 40.0, originLng: -120.0, destLat: 40.0, destLng: -120.0 },
      { id: 'p2', originLat: 32.9, originLng: -96.8, destLat: 34.0, destLng: -118.2 },
    ]);

    const result = await service.findAll('tenant-1', {
      origin: { city: 'Dallas', state: 'TX', radiusMiles: 50 },
      destination: { city: 'LA', state: 'CA', radiusMiles: 50 },
      includeDistance: true,
      sortByDistance: true,
      page: 1,
      limit: 10,
    } as any);

    expect(result.data[0].id).toBe('p2');
    expect(geocodingService.getCoordinates).toHaveBeenCalledTimes(2);
  });

  it('finds postings using zip origin', async () => {
    geocodingService.getCoordinatesFromZip.mockResolvedValue({ latitude: 32.9, longitude: -96.8 });
    prisma.loadPosting.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1', {
      origin: { zip: '75001', radiusMiles: 50 },
      destination: { state: 'CA' },
    } as any);

    expect(geocodingService.getCoordinatesFromZip).toHaveBeenCalledWith('75001');
  });

  it('finds postings using zip destination', async () => {
    geocodingService.getCoordinatesFromZip.mockResolvedValue({ latitude: 34.0, longitude: -118.2 });
    prisma.loadPosting.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1', {
      origin: { state: 'TX' },
      destination: { zip: '90001', radiusMiles: 25 },
    } as any);

    expect(geocodingService.getCoordinatesFromZip).toHaveBeenCalledWith('90001');
  });

  it('uses explicit zero coordinates for origin', async () => {
    prisma.loadPosting.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1', {
      origin: { latitude: 0, longitude: 0, radiusMiles: 10 },
    } as any);

    expect(geocodingService.getCoordinates).not.toHaveBeenCalled();
  });

  it('searches by geo using defaults', async () => {
    const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue({ data: [], meta: {} } as any);

    await service.searchByGeo('tenant-1', {
      originLat: 41.8781,
      originLng: -87.6298,
    } as any);

    expect(findAllSpy).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({
        origin: expect.objectContaining({ radiusMiles: 50 }),
      }),
    );
  });

  it('searches by lane using state filters', async () => {
    const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue({ data: [], meta: {} } as any);

    await service.searchByLane('tenant-1', {
      originState: 'IL',
      destState: 'NY',
      equipmentType: 'VAN',
    } as any);

    expect(findAllSpy).toHaveBeenCalledWith(
      'tenant-1',
      expect.objectContaining({
        originState: 'IL',
        destState: 'NY',
        equipmentType: 'VAN',
      }),
    );
  });

  it('throws when posting not found on findOne', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'post-1')).rejects.toThrow(NotFoundException);
  });

  it('updates posting when found', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1' });
    prisma.loadPosting.update.mockResolvedValue({ id: 'post-1', status: PostingStatus.ACTIVE });

    const result = await service.update('tenant-1', 'post-1', { status: PostingStatus.ACTIVE } as any);

    expect(result.id).toBe('post-1');
  });

  it('throws when posting not found on update', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'post-1', { status: PostingStatus.ACTIVE } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when posting not found on expire', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.expire('tenant-1', 'post-1')).rejects.toThrow(NotFoundException);
  });

  it('expires posting when found', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1' });
    prisma.loadPosting.update.mockResolvedValue({ id: 'post-1', status: PostingStatus.EXPIRED });

    const result = await service.expire('tenant-1', 'post-1');

    expect(result.status).toBe(PostingStatus.EXPIRED);
  });

  it('throws when refresh called on non-active posting', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: PostingStatus.EXPIRED });

    await expect(service.refresh('tenant-1', 'post-1')).rejects.toThrow(BadRequestException);
  });

  it('soft deletes posting', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1' });
    prisma.loadPosting.update.mockResolvedValue({ id: 'post-1' });

    await service.remove('tenant-1', 'post-1');

    expect(prisma.loadPosting.findFirst).toHaveBeenCalledWith({
      where: { id: 'post-1', tenantId: 'tenant-1', deletedAt: null },
    });
    expect(prisma.loadPosting.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws when posting missing on remove', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.remove('tenant-1', 'post-1')).rejects.toThrow(NotFoundException);
  });

  it('expires old postings excluding deleted', async () => {
    prisma.loadPosting.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.expireOldPostings('tenant-1');

    expect(result).toEqual({ expiredCount: 2 });
    expect(prisma.loadPosting.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenantId: 'tenant-1',
        deletedAt: null,
        status: PostingStatus.ACTIVE,
      }),
      data: { status: PostingStatus.EXPIRED },
    });
  });

  it('tracks view and increments count', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1' });
    prisma.carrierLoadView.upsert.mockResolvedValue({});
    prisma.loadPosting.update.mockResolvedValue({ id: 'post-1' });

    const result = await service.trackView('tenant-1', 'post-1', 'carrier-1');

    expect(result).toEqual({ success: true });
  });

  it('throws when trackView posting missing', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.trackView('tenant-1', 'post-1', 'carrier-1')).rejects.toThrow(NotFoundException);
  });

  it('returns metrics for posting', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({
      id: 'post-1',
      viewCount: 3,
      inquiryCount: 1,
      status: PostingStatus.ACTIVE,
      postedAt: new Date('2024-01-01T00:00:00.000Z'),
      expiresAt: new Date('2024-01-10T00:00:00.000Z'),
      _count: { views: 2, bids: 1 },
    });

    const result = await service.getMetrics('tenant-1', 'post-1');

    expect(result).toEqual(
      expect.objectContaining({ postingId: 'post-1', viewCount: 3, uniqueViewers: 2, bidCount: 1, status: PostingStatus.ACTIVE }),
    );
  });

  it('throws when metrics posting missing', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue(null);

    await expect(service.getMetrics('tenant-1', 'post-1')).rejects.toThrow(NotFoundException);
  });

  it('refreshes active posting', async () => {
    prisma.loadPosting.findFirst.mockResolvedValue({ id: 'post-1', status: PostingStatus.ACTIVE });
    prisma.loadPosting.update.mockResolvedValue({ id: 'post-1' });

    const result = await service.refresh('tenant-1', 'post-1');

    expect(result).toEqual({ id: 'post-1' });
  });

  it('auto refreshes postings', async () => {
    prisma.loadPosting.findMany.mockResolvedValue([{ id: 'post-1' }, { id: 'post-2' }]);
    prisma.loadPosting.update.mockResolvedValue({});

    const result = await service.autoRefreshPostings('tenant-1');

    expect(prisma.loadPosting.update).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ refreshedCount: 2 });
  });
});
