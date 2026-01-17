import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RateLanesService } from './rate-lanes.service';
import { PrismaService } from '../../../prisma.service';

describe('RateLanesService', () => {
  let service: RateLanesService;
  let prisma: {
    contractRateTable: {
      findFirst: jest.Mock;
    };
    contractRateLane: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      contractRateTable: {
        findFirst: jest.fn(),
      },
      contractRateLane: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLanesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(RateLanesService);
  });

  it('lists rate lanes excluding deleted', async () => {
    prisma.contractRateTable.findFirst.mockResolvedValue({ id: 'rt-1' });
    prisma.contractRateLane.findMany.mockResolvedValue([{ id: 'lane-1' }]);

    await service.list('tenant-1', 'rt-1');

    expect(prisma.contractRateTable.findFirst).toHaveBeenCalledWith({
      where: { id: 'rt-1', tenantId: 'tenant-1', deletedAt: null },
    });
    expect(prisma.contractRateLane.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', rateTableId: 'rt-1', deletedAt: null },
      orderBy: { originCity: 'asc' },
    });
  });

  it('throws when lane not found', async () => {
    prisma.contractRateLane.findFirst.mockResolvedValue(null);

    await expect(service.detail('lane-1', 'tenant-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('soft deletes rate lane', async () => {
    prisma.contractRateLane.findFirst.mockResolvedValue({ id: 'lane-1' });
    prisma.contractRateLane.update.mockResolvedValue({ id: 'lane-1' });

    await service.delete('lane-1', 'tenant-1');

    expect(prisma.contractRateLane.update).toHaveBeenCalledWith({
      where: { id: 'lane-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
