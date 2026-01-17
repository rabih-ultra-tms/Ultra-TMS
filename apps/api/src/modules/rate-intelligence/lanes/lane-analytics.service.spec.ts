import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LaneAnalyticsService } from './lane-analytics.service';
import { PrismaService } from '../../../prisma.service';
import { RateHistoryService } from '../history/rate-history.service';

describe('LaneAnalyticsService', () => {
  let service: LaneAnalyticsService;
  let prisma: any;
  const history = { laneHistoryById: jest.fn() };

  beforeEach(async () => {
    prisma = { laneAnalytics: { findMany: jest.fn(), findFirst: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LaneAnalyticsService, { provide: PrismaService, useValue: prisma }, { provide: RateHistoryService, useValue: history }],
    }).compile();

    service = module.get(LaneAnalyticsService);
  });

  it('lists lanes', async () => {
    prisma.laneAnalytics.findMany.mockResolvedValue([]);

    const result = await service.list('t1');

    expect(result).toEqual([]);
  });

  it('throws when lane missing', async () => {
    prisma.laneAnalytics.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'lane1')).rejects.toThrow(NotFoundException);
  });

  it('forecasts using history average', async () => {
    history.laneHistoryById.mockResolvedValue({ lane: { id: 'lane1' }, history: [{ avgRate: 100 }, { avgRate: 200 }] });

    const result = await service.forecast('t1', 'lane1');

    expect(result.forecast.nextWeek).toBe(150);
  });
});
