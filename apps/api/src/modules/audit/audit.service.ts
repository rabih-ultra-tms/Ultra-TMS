import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';
import { AdvancedSearchDto, ComplianceReportDto, UserActivityReportDto } from './dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async complianceReport(tenantId: string, query: ComplianceReportDto) {
    const fromDate = new Date(query.fromDate);
    const toDate = new Date(query.toDate);

    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      createdAt: { gte: fromDate, lte: toDate },
      ...(query.includeCategories?.length && {
        category: { in: query.includeCategories as any },
      }),
    };

    const [total, byAction, byCategory, bySeverity] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({ where, by: ['action'], _count: { _all: true } }),
      this.prisma.auditLog.groupBy({ where, by: ['category'], _count: { _all: true } }),
      this.prisma.auditLog.groupBy({ where, by: ['severity'], _count: { _all: true } }),
    ]);

    const loginStats = await this.prisma.loginAudit.groupBy({
      where: { tenantId, timestamp: { gte: fromDate, lte: toDate } },
      by: ['success'],
      _count: { _all: true },
    });

    const apiErrors = await this.prisma.aPIAuditLog.count({
      where: { tenantId, timestamp: { gte: fromDate, lte: toDate }, responseStatus: { gte: 400 } },
    });

    return {
      range: { fromDate, toDate },
      totalLogs: total,
      byAction: byAction.reduce(
        (acc, curr) => ({ ...acc, [curr.action]: curr._count._all }),
        {} as Record<string, number>,
      ),
      byCategory: byCategory.reduce(
        (acc, curr) => ({ ...acc, [curr.category]: curr._count._all }),
        {} as Record<string, number>,
      ),
      bySeverity: bySeverity.reduce(
        (acc, curr) => ({ ...acc, [curr.severity]: curr._count._all }),
        {} as Record<string, number>,
      ),
      loginStats: loginStats.reduce(
        (acc, curr) => ({ ...acc, [curr.success ? 'success' : 'failed']: curr._count._all }),
        { success: 0, failed: 0 } as Record<string, number>,
      ),
      apiErrors,
    };
  }

  async userActivityReport(tenantId: string, query: UserActivityReportDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 30 * 86400000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const activity = await this.prisma.auditLog.groupBy({
      where: { tenantId, createdAt: { gte: fromDate, lte: toDate } },
      by: ['userId'],
      _count: { _all: true },
      _max: { createdAt: true },
    });

    const userIds = activity.map(item => item.userId).filter((id): id is string => Boolean(id));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map(
      users.map(user => [
        user.id,
        { ...user, name: `${user.firstName} ${user.lastName}`.trim() },
      ]),
    );

    return {
      range: { fromDate, toDate },
      users: activity.map(item => ({
        userId: item.userId,
        user: item.userId ? userMap.get(item.userId) ?? null : null,
        activityCount: item._count._all,
        lastActivityAt: item._max.createdAt,
      })),
    };
  }

  async advancedSearch(tenantId: string, query: AdvancedSearchDto) {
    const page = query.page ?? 1;
    const take = query.limit ?? 50;
    const skip = (page - 1) * take;

    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      ...(query.actions?.length && { action: { in: query.actions } }),
      ...(query.entityTypes?.length && { entityType: { in: query.entityTypes } }),
      ...(query.userIds?.length && { userId: { in: query.userIds } }),
    };

    if (query.fromDate || query.toDate) {
      where.createdAt = {
        gte: query.fromDate ? new Date(query.fromDate) : undefined,
        lte: query.toDate ? new Date(query.toDate) : undefined,
      };
    }

    if (query.searchText) {
      where.OR = [
        { description: { contains: query.searchText, mode: 'insensitive' } },
        { entityType: { contains: query.searchText, mode: 'insensitive' } },
        { entityId: { contains: query.searchText, mode: 'insensitive' } },
      ];
    }

    const [results, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: results,
      total,
      page,
      limit: take,
    };
  }
}
