import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CapacityService } from './capacity.service';
import { PrismaService } from '../../../prisma.service';
import { GeocodingService } from '../services/geocoding.service';

describe('CapacityService', () => {
  let service: CapacityService;
  let prisma: any;
  let geocoding: { getCoordinates: jest.Mock };

  beforeEach(async () => {
    prisma = {
      loadBoardAccount: { findFirst: jest.fn() },
      capacitySearch: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
      carrierCapacity: { findMany: jest.fn() },
      load: { findFirst: jest.fn() },
      capacityResult: { findFirst: jest.fn(), update: jest.fn() },
    };
    geocoding = { getCoordinates: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapacityService,
        { provide: PrismaService, useValue: prisma },
        { provide: GeocodingService, useValue: geocoding },
      ],
    }).compile();

    service = module.get(CapacityService);
  });

  it('throws when account missing', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue(null);

    await expect(service.search('tenant-1', 'user-1', { accountId: 'a1' } as any)).rejects.toThrow(NotFoundException);
  });

  it('requires origin and destination states', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });

    await expect(service.search('tenant-1', 'user-1', { accountId: 'a1', equipmentTypes: ['VAN'] } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('requires equipment types when not derived from load', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });

    await expect(
      service.search('tenant-1', 'user-1', { accountId: 'a1', originState: 'TX', destinationState: 'CA' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates capacity search and returns results', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.capacitySearch.create.mockResolvedValue({ id: 's1' });
    prisma.capacitySearch.update.mockResolvedValue({ id: 's1' });
    prisma.carrierCapacity.findMany.mockResolvedValue([]);

    const result = await service.search('tenant-1', 'user-1', {
      accountId: 'a1',
      originState: 'TX',
      destinationState: 'CA',
      equipmentTypes: ['VAN'],
    } as any);

    expect(result.results).toEqual([]);
    expect(prisma.capacitySearch.update).toHaveBeenCalled();
  });

  it('derives criteria from related load and coordinates', async () => {
    prisma.loadBoardAccount.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.load.findFirst.mockResolvedValue({
      id: 'load-1',
      equipmentType: 'REEFER',
      order: {
        stops: [
          { stopType: 'PICKUP', state: 'TX', latitude: 30, longitude: -97 },
          { stopType: 'DELIVERY', state: 'CA', latitude: 34, longitude: -118 },
        ],
      },
    });
    prisma.capacitySearch.create.mockResolvedValue({ id: 's1' });
    prisma.capacitySearch.update.mockResolvedValue({ id: 's1' });
    prisma.carrierCapacity.findMany.mockResolvedValue([
      { id: 'c1', lat: 30.01, lng: -97.01, status: 'AVAILABLE' },
    ]);

    const result = await service.search('tenant-1', 'user-1', {
      accountId: 'a1',
      relatedLoadId: 'load-1',
    } as any);

    expect(result.results.length).toBe(1);
    expect(prisma.capacitySearch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ originState: 'TX', destState: 'CA', equipmentType: 'REEFER' }),
      }),
    );
  });

  it('updates capacity result contact info', async () => {
    prisma.capacityResult.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.capacityResult.update.mockResolvedValue({ id: 'r1' });

    await service.contactResult('tenant-1', 'r1', { contacted: true } as any);

    expect(prisma.capacityResult.update).toHaveBeenCalled();
  });

  it('throws when capacity result not found', async () => {
    prisma.capacityResult.findFirst.mockResolvedValue(null);

    await expect(service.contactResult('tenant-1', 'r1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns paginated history', async () => {
    prisma.capacitySearch.findMany.mockResolvedValue([{ id: 's1' }]);
    prisma.capacitySearch.count.mockResolvedValue(1);

    const result = await service.list('tenant-1', { page: 1, limit: 5 } as any);

    expect(result.data).toEqual([{ id: 's1' }]);
    expect(result.total).toBe(1);
  });

  it('throws when capacity search not found', async () => {
    prisma.capacitySearch.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 's1')).rejects.toThrow(NotFoundException);
  });
});
