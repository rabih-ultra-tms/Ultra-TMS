import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RateHistoryQueryDto } from './dto/rate-history-query.dto';

@Injectable()
export class RateHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async history(tenantId: string, query: RateHistoryQueryDto) {
    const { originMarket, destMarket, equipmentType, startDate, endDate, dataSource } = query;

    const where: any = {
      tenantId,
      originState: originMarket,
      destState: destMarket,
      equipmentType,
      weekStartDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (dataSource) {
      where.provider = dataSource.toUpperCase();
    }

    const results = await this.prisma.rateHistory.findMany({
      where,
      orderBy: { weekStartDate: 'asc' },
    });

    return { count: results.length, data: results };
  }

  async trends(tenantId: string, query: RateHistoryQueryDto) {
    const data = await this.history(tenantId, query);

    const trend = data.data.map((item) => ({
      date: item.weekStartDate,
      avgRate: item.avgRate,
      lowRate: item.lowRate,
      highRate: item.highRate,
    }));

    return { ...data, trend };
  }

  async laneHistoryById(tenantId: string, id: string) {
    const lane = await this.prisma.laneAnalytics.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!lane) {
      throw new NotFoundException('Lane not found');
    }

    const results = await this.prisma.rateHistory.findMany({
      where: {
        tenantId,
        originState: lane.originState,
        destState: lane.destState,
        equipmentType: lane.equipmentType,
      },
      orderBy: { weekStartDate: 'asc' },
    });

    return { lane, history: results };
  }
}
