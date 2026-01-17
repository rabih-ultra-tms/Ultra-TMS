import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PrismaService } from '../../../prisma.service';

describe('PositionsService', () => {
  let service: PositionsService;
  let prisma: {
    position: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      position: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PositionsService);
  });

  it('lists positions', async () => {
    prisma.position.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.position.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('creates position', async () => {
    prisma.position.create.mockResolvedValue({ id: 'p1' });

    await service.create('tenant-1', { title: 'Driver', code: 'DRV' } as any);

    expect(prisma.position.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 'tenant-1', title: 'Driver' }) }),
    );
  });

  it('throws when position not found', async () => {
    prisma.position.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('updates position', async () => {
    prisma.position.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.position.update.mockResolvedValue({ id: 'p1' });

    await service.update('tenant-1', 'p1', { title: 'Updated' } as any);

    expect(prisma.position.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ title: 'Updated' }) }),
    );
  });

  it('removes position', async () => {
    prisma.position.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.position.delete.mockResolvedValue({ id: 'p1' });

    const result = await service.remove('tenant-1', 'p1');

    expect(result).toEqual({ deleted: true });
  });
});