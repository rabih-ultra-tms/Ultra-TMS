import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../../prisma.service';

describe('Rate Intelligence AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      rateQuery: { count: jest.fn(), findFirst: jest.fn() },
      rateAlert: { count: jest.fn() },
      laneAnalytics: { findMany: jest.fn() },
      rateHistory: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('returns dashboard stats', async () => {
    prisma.rateQuery.count.mockResolvedValue(5);
    prisma.rateAlert.count.mockResolvedValue(2);
    prisma.rateQuery.findFirst.mockResolvedValue({ createdAt: new Date('2025-01-01') });

    const result = await service.dashboard('t1');

    expect(result.queryCount).toBe(5);
    expect(result.alertCount).toBe(2);
  });

  it('returns margins', async () => {
    prisma.laneAnalytics.findMany.mockResolvedValue([{ avgRate: 100, avgMargin: 10 }, { avgRate: 200, avgMargin: 20 }]);

    const result = await service.margins('t1');

    expect(result.lanes).toBe(2);
  });

  it('returns competitiveness', async () => {
    prisma.laneAnalytics.findMany.mockResolvedValue([{ vsMarketPercent: 5 }, { vsMarketPercent: 15 }]);

    const result = await service.competitiveness('t1');

    expect(result.avgVsMarketPercent).toBe(10);
  });

  it('returns market overview', async () => {
    prisma.rateHistory.findMany.mockResolvedValue([]);

    const result = await service.marketOverview('t1');

    expect(result.recent).toEqual([]);
  });
});
