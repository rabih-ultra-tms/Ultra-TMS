import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RateHistoryService } from './rate-history.service';
import { PrismaService } from '../../../prisma.service';

describe('RateHistoryService', () => {
  let service: RateHistoryService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      rateHistory: { findMany: jest.fn() },
      laneAnalytics: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateHistoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RateHistoryService);
  });

  it('returns history', async () => {
    prisma.rateHistory.findMany.mockResolvedValue([{ id: 'h1' }]);

    const result = await service.history('t1', {
      originMarket: 'TX',
      destMarket: 'CA',
      equipmentType: 'VAN',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    } as any);

    expect(result.count).toBe(1);
  });

  it('returns trends', async () => {
    prisma.rateHistory.findMany.mockResolvedValue([{ weekStartDate: new Date('2025-01-01'), avgRate: 100, lowRate: 90, highRate: 110 }]);

    const result = await service.trends('t1', {
      originMarket: 'TX',
      destMarket: 'CA',
      equipmentType: 'VAN',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    } as any);

    expect(result.trend.length).toBe(1);
  });

  it('throws when lane missing', async () => {
    prisma.laneAnalytics.findFirst.mockResolvedValue(null);

    await expect(service.laneHistoryById('t1', 'lane1')).rejects.toThrow(NotFoundException);
  });
});
