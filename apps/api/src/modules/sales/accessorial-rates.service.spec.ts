import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccessorialRatesService } from './accessorial-rates.service';
import { PrismaService } from '../../prisma.service';

describe('AccessorialRatesService', () => {
  let service: AccessorialRatesService;
  let prisma: {
    accessorialRate: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      accessorialRate: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessorialRatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AccessorialRatesService);
  });

  it('findAll returns paginated results', async () => {
    prisma.accessorialRate.findMany.mockResolvedValue([{ id: 'rate-1' }]);
    prisma.accessorialRate.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', { page: 1, limit: 10 });

    expect(result.total).toBe(1);
    expect(prisma.accessorialRate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1' },
      }),
    );
  });

  it('throws when rate not found', async () => {
    prisma.accessorialRate.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'rate-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deletes rate after existence check', async () => {
    prisma.accessorialRate.findFirst.mockResolvedValue({ id: 'rate-1' });

    await service.delete('tenant-1', 'rate-1', 'user-1');

    expect(prisma.accessorialRate.delete).toHaveBeenCalledWith({
      where: { id: 'rate-1' },
    });
  });

  it('creates accessorial rate', async () => {
    prisma.accessorialRate.create.mockResolvedValue({ id: 'rate-1' });

    const result = await service.create('tenant-1', 'user-1', {
      contractId: 'rc-1',
      accessorialType: 'DETENTION',
      name: 'Detention',
      rateType: 'PER_HOUR',
      rateAmount: 75,
    } as any);

    expect(result.id).toBe('rate-1');
  });

  it('updates accessorial rate', async () => {
    prisma.accessorialRate.findFirst.mockResolvedValue({ id: 'rate-1' });
    prisma.accessorialRate.update.mockResolvedValue({ id: 'rate-1', name: 'Updated' });

    const result = await service.update('tenant-1', 'rate-1', 'user-1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });

  it('seeds default accessorials when missing', async () => {
    prisma.accessorialRate.findFirst.mockResolvedValue(null);
    prisma.accessorialRate.create.mockResolvedValue({ id: 'rate-1' });

    const result = await service.seedDefaultAccessorials('tenant-1', 'user-1');

    expect(result.length).toBeGreaterThan(0);
    expect(prisma.accessorialRate.create).toHaveBeenCalled();
  });
});
