import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PortalShipmentsService } from './portal-shipments.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalShipmentsService', () => {
  let service: PortalShipmentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: { findMany: jest.fn(), findFirst: jest.fn() },
      statusHistory: { findMany: jest.fn() },
      document: { findMany: jest.fn() },
      portalActivityLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalShipmentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalShipmentsService);
  });

  it('lists shipments', async () => {
    prisma.load.findMany.mockResolvedValue([]);

    const result = await service.list('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('throws when shipment missing', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'c1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('returns tracking info', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'l1',
      status: 'IN_TRANSIT',
      currentCity: 'A',
      currentState: 'TX',
      eta: new Date(),
      lastTrackingUpdate: new Date(),
      currentLocationLat: 1,
      currentLocationLng: 2,
    });

    const result = await service.tracking('t1', 'c1', 'l1');

    expect(result.loadId).toBe('l1');
  });

  it('returns events', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.statusHistory.findMany.mockResolvedValue([]);

    const result = await service.events('t1', 'c1', 'l1');

    expect(result).toEqual([]);
  });

  it('returns documents', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.document.findMany.mockResolvedValue([]);

    const result = await service.documents('t1', 'c1', 'l1');

    expect(result).toEqual([]);
  });

  it('logs contact message', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.portalActivityLog.create.mockResolvedValue({ id: 'p1' });

    const result = await service.contact('t1', 'c1', 'l1', 'hello', 'u1');

    expect(result.success).toBe(true);
  });
});
