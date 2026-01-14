import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { NpsScoreService } from '../nps/nps-score.service';

@Injectable()
export class FeedbackAnalyticsService {
  constructor(private readonly prisma: PrismaService, private readonly npsScore: NpsScoreService) {}

  async listNpsResponses(tenantId: string, surveyId?: string) {
    return this.prisma.nPSResponse.findMany({
      where: {
        tenantId,
        ...(surveyId ? { surveyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getNpsScore(tenantId: string, surveyId?: string) {
    return this.npsScore.calculateNpsScore(tenantId, surveyId);
  }

  async feedbackSummary(tenantId: string) {
    const [responses, requests] = await Promise.all([
      this.prisma.nPSResponse.groupBy({
        by: ['category'],
        where: { tenantId },
        _count: { _all: true },
      }),
      this.prisma.featureRequest.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { _all: true },
      }),
    ]);

    return {
      npsResponsesByCategory: responses.reduce<Record<string, number>>(
        (acc: Record<string, number>, row: { category: string; _count: { _all: number } }) => {
        acc[row.category] = row._count._all;
        return acc;
        },
        {},
      ),
      featureRequestsByStatus: requests.reduce<Record<string, number>>(
        (acc: Record<string, number>, row: { status: string; _count: { _all: number } }) => {
        acc[row.status] = row._count._all;
        return acc;
        },
        {},
      ),
    };
  }
}
