import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../../prisma.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: { findMany: jest.fn(), findFirst: jest.fn() },
      checkCall: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TrackingService);
  });

  it('returns map points with coordinates', async () => {
    prisma.load.findMany.mockResolvedValue([
      {
        id: 'l1',
        loadNumber: 'L1',
        status: 'IN_TRANSIT',
        currentLocationLat: 30.1,
        currentLocationLng: -97.7,
        lastTrackingUpdate: new Date(),
        eta: new Date(),
        carrier: { id: 'c1', legalName: 'Carrier' },
        order: { stops: [{ stopType: 'PICKUP', city: 'A', state: 'TX' }] },
      },
      { id: 'l2', currentLocationLat: null, currentLocationLng: null, order: { stops: [] } },
    ]);

    const result = await service.getMapData('t1', {} as any);

    expect(result).toHaveLength(1);
    expect(result[0]?.loadId).toBe('l1');
  });

  it('throws when load missing for history', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.getLocationHistory('t1', 'l1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('returns filtered location history', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.checkCall.findMany.mockResolvedValue([
      { createdAt: new Date(), latitude: 30.1, longitude: -97.7, status: 'PING', notes: 'ok' },
      { createdAt: new Date(), latitude: null, longitude: null },
    ]);

    const result = await service.getLocationHistory('t1', 'l1', { limit: 10 } as any);

    expect(result).toHaveLength(1);
  });
});
