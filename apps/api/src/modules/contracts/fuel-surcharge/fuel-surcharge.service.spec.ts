import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FuelSurchargeService } from './fuel-surcharge.service';
import { PrismaService } from '../../../prisma.service';

describe('FuelSurchargeService', () => {
  let service: FuelSurchargeService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      fuelSurchargeTable: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      fuelSurchargeTier: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FuelSurchargeService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(FuelSurchargeService);
  });

  it('lists fuel tables', async () => {
    prisma.fuelSurchargeTable.findMany.mockResolvedValue([{ id: 't1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 't1' }]);
  });

  it('creates fuel table', async () => {
    prisma.fuelSurchargeTable.create.mockResolvedValue({ id: 't1' });

    const result = await service.create('t1', 'u1', {
      name: 'Fuel',
      basePrice: 3.5,
      effectiveDate: '2024-01-01',
    } as any);

    expect(result.id).toBe('t1');
  });

  it('throws when table missing', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 't1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates fuel table', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue({ id: 't1' });
    prisma.fuelSurchargeTable.update.mockResolvedValue({ id: 't1', name: 'Updated' });

    const result = await service.update('t1', 't1', { name: 'Updated' } as any);

    expect(result.name).toBe('Updated');
  });

  it('deletes fuel table', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue({ id: 't1' });

    const result = await service.delete('t1', 't1');

    expect(result).toEqual({ success: true });
  });

  it('lists tiers for table', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue({ id: 't1', tiers: [] });
    prisma.fuelSurchargeTier.findMany.mockResolvedValue([{ id: 'tier1' }]);

    const result = await service.listTiers('t1', 't1');

    expect(result).toEqual([{ id: 'tier1' }]);
  });

  it('adds tier', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue({ id: 't1', tiers: [] });
    prisma.fuelSurchargeTier.create.mockResolvedValue({ id: 'tier1' });

    const result = await service.addTier('t1', 't1', 'u1', {
      tierNumber: 1,
      priceMin: 3.0,
      priceMax: 3.5,
      surchargePercent: 5,
    } as any);

    expect(result.id).toBe('tier1');
  });

  it('throws when tier missing on update', async () => {
    prisma.fuelSurchargeTier.findFirst.mockResolvedValue(null);

    await expect(service.updateTier('t1', 'tier1', { surchargePercent: 7 } as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('calculates fuel surcharge from tier', async () => {
    prisma.fuelSurchargeTable.findFirst.mockResolvedValue({
      id: 't1',
      tiers: [{ priceMin: 3.0, priceMax: 3.5, surchargePercent: 10 }],
    });

    const result = await service.calculate('t1', {
      fuelTableId: 't1',
      currentFuelPrice: 3.25,
      lineHaulAmount: 1000,
    } as any);

    expect(result.surchargePercent).toBe(10);
    expect(result.surchargeAmount).toBe(100);
  });
});
