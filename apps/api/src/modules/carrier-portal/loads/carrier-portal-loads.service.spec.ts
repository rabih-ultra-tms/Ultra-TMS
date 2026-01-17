import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CarrierPortalLoadsService } from './carrier-portal-loads.service';
import { PrismaService } from '../../../prisma.service';
import { LoadStatusEnum } from '../../tms/dto/load-query.dto';

describe('CarrierPortalLoadsService', () => {
  let service: CarrierPortalLoadsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      carrierSavedLoad: { create: jest.fn(), findFirst: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
      carrierPortalActivityLog: { create: jest.fn() },
      statusHistory: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalLoadsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalLoadsService);
  });

  it('returns available loads', async () => {
    prisma.load.findMany.mockResolvedValue([]);

    const result = await service.available('t1', 'c1', 'u1');

    expect(result).toEqual([]);
  });

  it('throws when available detail missing', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.availableDetail('t1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('saves load', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.carrierSavedLoad.create.mockResolvedValue({ id: 's1' });

    const result = await service.saveLoad('t1', 'u1', 'l1');

    expect(result.id).toBe('s1');
  });

  it('removes saved load', async () => {
    prisma.carrierSavedLoad.findFirst.mockResolvedValue({ id: 's1' });
    prisma.carrierSavedLoad.delete.mockResolvedValue({ id: 's1' });

    const result = await service.removeSaved('t1', 'u1', 's1');

    expect(result.success).toBe(true);
  });

  it('creates bid activity', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.carrierPortalActivityLog.create.mockResolvedValue({ id: 'a1' });

    const result = await service.bid('t1', 'c1', 'u1', 'l1', { bidAmount: 100 } as any);

    expect(result.id).toBe('a1');
  });

  it('throws when my load missing', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.myLoadDetail('t1', 'c1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('accepts load', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.load.update.mockResolvedValue({ id: 'l1', status: LoadStatusEnum.ACCEPTED });

    const result = await service.accept('t1', 'c1', 'l1');

    expect(result.status).toBe(LoadStatusEnum.ACCEPTED);
  });

  it('updates status with history', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1', carrierId: 'c1' });
    prisma.statusHistory.create.mockResolvedValue({ id: 'h1' });
    prisma.load.update.mockResolvedValue({ id: 'l1', status: 'IN_TRANSIT' });

    const result = await service.updateStatus('t1', 'c1', 'l1', { status: 'IN_TRANSIT' } as any);

    expect(result.status).toBe('IN_TRANSIT');
  });

  it('updates location', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.load.update.mockResolvedValue({ id: 'l1' });

    const result = await service.updateLocation('t1', 'c1', 'l1', { latitude: 1, longitude: 2 } as any);

    expect(result.id).toBe('l1');
  });

  it('updates eta', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.load.update.mockResolvedValue({ id: 'l1' });

    const result = await service.updateEta('t1', 'c1', 'l1', new Date().toISOString());

    expect(result.id).toBe('l1');
  });

  it('logs message activity', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.carrierPortalActivityLog.create.mockResolvedValue({ id: 'a1' });

    const result = await service.message('t1', 'c1', 'u1', 'l1', 'hi');

    expect(result.id).toBe('a1');
  });
});
