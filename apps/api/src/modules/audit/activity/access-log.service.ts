import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { AccessLogQueryDto } from '../dto';

@Injectable()
export class AccessLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: AccessLogQueryDto) {
    const where: Prisma.AccessLogWhereInput = { tenantId };

    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.userId) where.userId = query.userId;
    if (query.granted !== undefined) where.granted = query.granted === 'true';
    if (query.startDate || query.endDate) {
      where.timestamp = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [logs, total] = await Promise.all([
      this.prisma.accessLog.findMany({ where, take, skip, orderBy: { timestamp: 'desc' } }),
      this.prisma.accessLog.count({ where }),
    ]);

    return { data: logs, total, limit: take, offset: skip };
  }

  async recentForUser(tenantId: string, userId: string, limit = 20) {
    return this.prisma.accessLog.findMany({
      where: { tenantId, userId },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  }
}
