import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const [queryCount, alertCount, latestQuery] = await Promise.all([
      this.prisma.rateQuery.count({ where: { tenantId, deletedAt: null } as any }),
      this.prisma.rateAlert.count({ where: { tenantId, deletedAt: null } } as any),
      this.prisma.rateQuery.findFirst({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return {
      queryCount,
      alertCount,
      lastQueriedAt: latestQuery?.createdAt ?? null,
    };
  }

  async margins(tenantId: string) {
    const lanes = await this.prisma.laneAnalytics.findMany({ where: { tenantId, deletedAt: null } });
    const avgMarginPercent = lanes.length
      ? lanes.reduce((sum, lane) => sum + Number(lane.avgMargin), 0) / lanes.length
      : 0;
    const avgMarginAmount = lanes.length
      ? lanes.reduce((sum, lane) => sum + Number(lane.avgRate) * (Number(lane.avgMargin) / 100), 0) /
        lanes.length
      : 0;

    return { avgMarginPercent, avgMarginAmount, lanes: lanes.length };
  }

  async competitiveness(tenantId: string) {
    const lanes = await this.prisma.laneAnalytics.findMany({ where: { tenantId, deletedAt: null } });
    const avgVsMarket = lanes.length
      ? lanes.reduce((sum, lane) => sum + Number(lane.vsMarketPercent ?? 0), 0) / lanes.length
      : 0;
    return { avgVsMarketPercent: avgVsMarket };
  }

  async marketOverview(tenantId: string) {
    const history = await this.prisma.rateHistory.findMany({ where: { tenantId }, take: 50, orderBy: { createdAt: 'desc' } });
    return { recent: history };
  }
}
