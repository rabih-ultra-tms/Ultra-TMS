import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PrismaService } from '../../../prisma.service';

describe('LocationsService', () => {
  let service: LocationsService;
  let prisma: { location: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      location: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(LocationsService);
  });

  it('lists locations for tenant', async () => {
    prisma.location.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' }, orderBy: { name: 'asc' } }),
    );
  });

  it('creates a location', async () => {
    prisma.location.create.mockResolvedValue({ id: 'l1' });

    await service.create('tenant-1', { locationCode: 'HQ', name: 'Main' } as any);

    expect(prisma.location.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isHeadquarters: false }) }),
    );
  });

  it('throws when location missing', async () => {
    prisma.location.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('updates a location', async () => {
    prisma.location.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.location.update.mockResolvedValue({ id: 'l1' });

    await service.update('tenant-1', 'l1', { name: 'Updated' } as any);

    expect(prisma.location.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'l1' } }));
  });

  it('removes a location', async () => {
    prisma.location.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.location.delete.mockResolvedValue({ id: 'l1' });

    const result = await service.remove('tenant-1', 'l1');

    expect(result).toEqual({ deleted: true });
  });
});
