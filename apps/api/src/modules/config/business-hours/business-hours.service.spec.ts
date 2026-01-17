import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BusinessHoursService } from './business-hours.service';
import { PrismaService } from '../../../prisma.service';

describe('BusinessHoursService', () => {
  let service: BusinessHoursService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      businessHours: { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
      holiday: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), delete: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessHoursService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(BusinessHoursService);
  });

  it('gets business hours', async () => {
    prisma.businessHours.findMany.mockResolvedValue([]);

    await service.getHours('tenant-1');

    expect(prisma.businessHours.findMany).toHaveBeenCalled();
  });

  it('updates business hours', async () => {
    prisma.$transaction.mockResolvedValue(undefined);
    prisma.businessHours.findMany.mockResolvedValue([]);

    const result = await service.updateHours('tenant-1', { days: [{ dayOfWeek: 1, openTime: '08:00' }] } as any);

    expect(result).toEqual([]);
  });

  it('adds and removes holidays', async () => {
    prisma.holiday.create.mockResolvedValue({ id: 'h1' });
    prisma.holiday.findFirst.mockResolvedValue({ id: 'h1' });
    prisma.holiday.delete.mockResolvedValue({});

    await service.addHoliday('tenant-1', { name: 'New Year', date: '2025-01-01' } as any);
    const result = await service.removeHoliday('tenant-1', 'h1');

    expect(result.removed).toBe(true);
  });

  it('throws when holiday missing', async () => {
    prisma.holiday.findFirst.mockResolvedValue(null);

    await expect(service.removeHoliday('tenant-1', 'h1')).rejects.toThrow(NotFoundException);
  });
});
