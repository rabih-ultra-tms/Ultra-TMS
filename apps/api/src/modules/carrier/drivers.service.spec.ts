import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { PrismaService } from '../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('DriversService', () => {
  let service: DriversService;
  let prisma: {
    carrier: { findFirst: jest.Mock };
    driver: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    load: { findMany: jest.Mock };
  };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    prisma = {
      carrier: { findFirst: jest.fn() },
      driver: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      load: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(DriversService);
  });

  it('throws when carrier not found on create', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'car-1', 'user-1', { firstName: 'A' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws on duplicate CDL', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.driver.findFirst.mockResolvedValue({ id: 'drv-1' });

    await expect(
      service.create('tenant-1', 'car-1', 'user-1', {
        firstName: 'A',
        licenseNumber: 'X',
        licenseState: 'TX',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when carrier not found for list', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.findAllForCarrier('tenant-1', 'car-1', {}),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when driver not found on delete', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.delete('tenant-1', 'drv-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes driver', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'drv-1' });
    prisma.driver.delete.mockResolvedValue({ id: 'drv-1' });

    const result = await service.delete('tenant-1', 'drv-1');

    expect(result).toEqual({ success: true, message: 'Driver deleted successfully' });
  });

  it('creates driver and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.driver.findFirst.mockResolvedValue(null);
    prisma.driver.create.mockResolvedValue({ id: 'drv-1' });

    const result = await service.create('tenant-1', 'car-1', 'user-1', {
      firstName: 'A',
      lastName: 'B',
      licenseNumber: 'CDL1',
      licenseState: 'TX',
    } as any);

    expect(result.id).toBe('drv-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith('driver.created',
      expect.objectContaining({ driverId: 'drv-1', carrierId: 'car-1', tenantId: 'tenant-1' }),
    );
  });

  it('lists drivers for carrier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.driver.findMany.mockResolvedValue([{ id: 'drv-1' }]);

    const result = await service.findAllForCarrier('tenant-1', 'car-1', { status: 'ACTIVE' });

    expect(result).toEqual([{ id: 'drv-1' }]);
  });

  it('finds driver by id', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'drv-1' });

    const result = await service.findOne('tenant-1', 'drv-1');

    expect(result).toEqual({ id: 'drv-1' });
  });

  it('throws when driver not found', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'drv-1')).rejects.toThrow(NotFoundException);
  });

  it('updates driver and emits status change', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'drv-1', status: 'ACTIVE', carrierId: 'car-1' });
    prisma.driver.update.mockResolvedValue({ id: 'drv-1', status: 'INACTIVE' });

    const result = await service.update('tenant-1', 'drv-1', { status: 'INACTIVE' } as any);

    expect(result.status).toBe('INACTIVE');
    expect(eventEmitter.emit).toHaveBeenCalledWith('driver.status.changed',
      expect.objectContaining({ driverId: 'drv-1', oldStatus: 'ACTIVE', newStatus: 'INACTIVE' }),
    );
  });

  it('throws on duplicate CDL during update', async () => {
    prisma.driver.findFirst
      .mockResolvedValueOnce({ id: 'drv-1', status: 'ACTIVE', carrierId: 'car-1' })
      .mockResolvedValueOnce({ id: 'drv-2' });

    await expect(
      service.update('tenant-1', 'drv-1', { licenseNumber: 'CDL1', licenseState: 'TX' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('lists drivers with filters', async () => {
    prisma.driver.findMany.mockResolvedValue([{ id: 'drv-1' }]);

    const result = await service.findAll('tenant-1', { status: 'ACTIVE', carrierId: 'car-1' });

    expect(result).toEqual([{ id: 'drv-1' }]);
    expect(prisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', status: 'ACTIVE', carrierId: 'car-1' } }),
    );
  });

  it('returns driver loads', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'drv-1', carrierId: 'car-1' });
    prisma.load.findMany.mockResolvedValue([{ id: 'load-1' }]);

    const result = await service.getLoads('tenant-1', 'drv-1');

    expect(result).toEqual([{ id: 'load-1' }]);
  });

  it('throws when getting loads for missing driver', async () => {
    prisma.driver.findFirst.mockResolvedValue(null);

    await expect(service.getLoads('tenant-1', 'drv-1')).rejects.toThrow(NotFoundException);
  });

  it('returns expiring credentials', async () => {
    prisma.driver.findMany.mockResolvedValue([{ id: 'drv-1', cdlExpiration: new Date('2026-02-01') }]);

    const result = await service.getExpiringCredentials('tenant-1', 30);

    expect(result[0]?.expiringCredentials?.[0]?.type).toBe('CDL');
  });
});
