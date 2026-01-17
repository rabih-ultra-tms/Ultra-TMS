import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackAnalyticsService } from './feedback-analytics.service';
import { PrismaService } from '../../../prisma.service';
import { NpsScoreService } from '../nps/nps-score.service';

describe('FeedbackAnalyticsService', () => {
  let service: FeedbackAnalyticsService;
  let prisma: any;
  let npsScore: { calculateNpsScore: jest.Mock };

  beforeEach(async () => {
    prisma = {
      nPSResponse: { findMany: jest.fn(), groupBy: jest.fn() },
      featureRequest: { groupBy: jest.fn() },
    };
    npsScore = { calculateNpsScore: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackAnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: NpsScoreService, useValue: npsScore },
      ],
    }).compile();

    service = module.get(FeedbackAnalyticsService);
  });

  it('lists NPS responses', async () => {
    prisma.nPSResponse.findMany.mockResolvedValue([]);

    await service.listNpsResponses('tenant-1');

    expect(prisma.nPSResponse.findMany).toHaveBeenCalled();
  });

  it('returns NPS score', async () => {
    npsScore.calculateNpsScore.mockResolvedValue(42);

    const result = await service.getNpsScore('tenant-1');

    expect(result).toBe(42);
  });

  it('builds feedback summary', async () => {
    prisma.nPSResponse.groupBy.mockResolvedValue([{ category: 'PROMOTER', _count: { _all: 2 } }]);
    prisma.featureRequest.groupBy.mockResolvedValue([{ status: 'OPEN', _count: { _all: 3 } }]);

    const result = await service.feedbackSummary('tenant-1');

    expect(result.npsResponsesByCategory.PROMOTER).toBe(2);
    expect(result.featureRequestsByStatus.OPEN).toBe(3);
  });
});
