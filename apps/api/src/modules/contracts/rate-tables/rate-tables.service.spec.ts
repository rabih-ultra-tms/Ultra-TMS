import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RateTablesService } from './rate-tables.service';
import { PrismaService } from '../../../prisma.service';

describe('RateTablesService', () => {
  let service: RateTablesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      contractRateTable: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      contractRateLane: { createMany: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateTablesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RateTablesService);
  });

  it('lists rate tables', async () => {
    prisma.contractRateTable.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1', 'c1');

    expect(result).toEqual([]);
  });

  it('throws when rate table missing', async () => {
    prisma.contractRateTable.findFirst.mockResolvedValue(null);

    await expect(service.detail('rt1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('imports csv rows', async () => {
    prisma.contractRateTable.findFirst.mockResolvedValue({ id: 'rt1' });
    prisma.contractRateLane.createMany.mockResolvedValue({});

    const result = await service.importCsv('rt1', 'tenant-1', [
      { originCity: 'A', originState: 'TX', destCity: 'B', destState: 'CA', equipmentType: 'VAN', rateType: 'FLAT', rateAmount: 100 },
    ]);

    expect(result.imported).toBe(1);
  });

  it('exports csv raw', async () => {
    prisma.contractRateLane.findMany.mockResolvedValue([{ originCity: 'A', originState: 'TX', destCity: 'B', destState: 'CA', equipmentType: 'VAN', rateType: 'FLAT', rateAmount: 100, currency: 'USD' }]);

    const result = await service.exportCsv('rt1', 'tenant-1', 'raw');

    expect(typeof result).toBe('string');
  });
});
