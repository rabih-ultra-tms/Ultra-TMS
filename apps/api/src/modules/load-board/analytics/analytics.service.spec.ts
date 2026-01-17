import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../../prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      loadPost: { count: jest.fn() },
      postLead: { count: jest.fn() },
      loadBoardAccount: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('returns post metrics', async () => {
    prisma.loadPost.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);

    const result = await service.postMetrics('t1');

    expect(result.total).toBe(10);
    expect(result.covered).toBe(1);
  });

  it('returns lead metrics', async () => {
    prisma.postLead.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    const result = await service.leadMetrics('t1');

    expect(result.total).toBe(5);
  });

  it('returns board comparison', async () => {
    prisma.loadBoardAccount.findMany.mockResolvedValue([
      { id: 'a1', accountName: 'A', posts: [{ status: 'POSTED', views: 2, clicks: 1, leadCount: 1 }] },
    ]);

    const result = await service.boardComparison('t1');

    expect(result[0]?.posts).toBe(1);
  });
});
