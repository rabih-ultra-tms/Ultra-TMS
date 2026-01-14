import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { NPSResponse } from '@prisma/client';

export interface NpsScoreResult {
  score: number | null;
  responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promoterPercentage: number;
  detractorPercentage: number;
}

@Injectable()
export class NpsScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getResponses(tenantId: string, surveyId?: string): Promise<NPSResponse[]> {
    return this.prisma.nPSResponse.findMany({
      where: {
        tenantId,
        ...(surveyId ? { surveyId } : {}),
      },
    });
  }

  async calculateNpsScore(tenantId: string, surveyId?: string): Promise<NpsScoreResult> {
    const responses = await this.getResponses(tenantId, surveyId);

    const total = responses.length;
    if (total === 0) {
      return {
        score: null,
        responses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        promoterPercentage: 0,
        detractorPercentage: 0,
      };
    }

    const promoters = responses.filter((r: NPSResponse) => r.score >= 9).length;
    const detractors = responses.filter((r: NPSResponse) => r.score <= 6).length;
    const passives = total - promoters - detractors;

    const score = Math.round(((promoters - detractors) / total) * 100);

    return {
      score,
      responses: total,
      promoters,
      passives,
      detractors,
      promoterPercentage: (promoters / total) * 100,
      detractorPercentage: (detractors / total) * 100,
    };
  }

  categorizeScore(score: number): 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' {
    if (score >= 9) return 'PROMOTER';
    if (score >= 7) return 'PASSIVE';
    return 'DETRACTOR';
  }
}
