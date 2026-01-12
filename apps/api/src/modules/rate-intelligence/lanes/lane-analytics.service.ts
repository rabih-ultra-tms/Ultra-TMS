import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RateHistoryService } from '../history/rate-history.service';

@Injectable()
export class LaneAnalyticsService {
  constructor(private readonly prisma: PrismaService, private readonly history: RateHistoryService) {}

  async list(tenantId: string) {
    return this.prisma.laneAnalytics.findMany({ where: { tenantId, deletedAt: null } });
  }

  async findOne(tenantId: string, id: string) {
    const lane = await this.prisma.laneAnalytics.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!lane) {
      throw new NotFoundException('Lane analytics not found');
    }
    return lane;
  }

  async historyForLane(tenantId: string, id: string) {
    return this.history.laneHistoryById(tenantId, id);
  }

  async forecast(tenantId: string, id: string) {
    const { lane, history } = await this.historyForLane(tenantId, id);
    const avg = history.length
      ? history.reduce((sum, item) => sum + Number(item.avgRate), 0) / history.length
      : 0;

    return {
      lane,
      forecast: {
        nextWeek: avg,
        nextMonth: avg,
      },
    };
  }
}
