import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

const ACTIVE_LOAD_STATUSES = [
  'PLANNING',
  'PENDING',
  'TENDERED',
  'ACCEPTED',
  'DISPATCHED',
  'AT_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'AT_DELIVERY',
];

const IN_TRANSIT_STATUSES = [
  'DISPATCHED',
  'AT_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'AT_DELIVERY',
];

@Injectable()
export class CommandCenterService {
  constructor(private prisma: PrismaService) {}

  async getKPIs(tenantId: string, period: string) {
    const { start, end } = this.getPeriodRange(period);

    const [
      activeLoads,
      pendingLoads,
      inTransitLoads,
      deliveredToday,
      atRiskLoads,
      periodLoads,
      activeQuotes,
      pendingQuotes,
      availableCarriers,
      onLoadCarriers,
    ] = await Promise.all([
      // Active loads
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ACTIVE_LOAD_STATUSES },
        },
      }),
      // Pending (unassigned)
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['PLANNING', 'PENDING'] },
        },
      }),
      // In Transit
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: IN_TRANSIT_STATUSES },
        },
      }),
      // Delivered today
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          deliveredAt: { gte: start, lte: end },
        },
      }),
      // At-risk: in-transit loads with no check call at all, or latest check call > 4h ago
      this.countStaleLoads(tenantId),
      // Period loads for revenue/margin
      this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: start, lte: end },
        },
        select: { totalCost: true, order: { select: { totalCharges: true } } },
      }),
      // Active quotes
      this.prisma.quote.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['DRAFT', 'PENDING', 'SENT'] },
        },
      }),
      // Pending approval quotes
      this.prisma.quote.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'PENDING',
        },
      }),
      // Available carriers
      this.prisma.carrier.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'ACTIVE',
        },
      }),
      // Carriers currently on a load
      this.prisma.load.groupBy({
        by: ['carrierId'],
        where: {
          tenantId,
          deletedAt: null,
          carrierId: { not: null },
          status: { in: IN_TRANSIT_STATUSES },
        },
      }),
    ]);

    // Revenue + margin
    const revenue = periodLoads.reduce(
      (sum, l) => sum + Number(l.order?.totalCharges ?? 0),
      0
    );
    const cost = periodLoads.reduce(
      (sum, l) => sum + Number(l.totalCost ?? 0),
      0
    );
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

    // On-time percentage
    const deliveredLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        deliveredAt: { gte: start, lte: end, not: null },
      },
      select: {
        deliveredAt: true,
        order: { select: { requiredDeliveryDate: true } },
      },
    });
    const onTimeCount = deliveredLoads.filter(
      (l) =>
        l.order?.requiredDeliveryDate &&
        l.deliveredAt &&
        l.deliveredAt <= l.order.requiredDeliveryDate
    ).length;
    const onTimePct =
      deliveredLoads.length > 0
        ? (onTimeCount / deliveredLoads.length) * 100
        : 100;

    return {
      data: {
        loads: {
          today: activeLoads,
          pending: pendingLoads,
          inTransit: inTransitLoads,
          delivered: deliveredToday,
          atRisk: atRiskLoads,
        },
        quotes: {
          active: activeQuotes,
          pendingApproval: pendingQuotes,
        },
        carriers: {
          available: availableCarriers,
          onLoad: onLoadCarriers.length,
        },
        revenue: {
          today: Math.round(revenue * 100) / 100,
          margin: Math.round(margin * 10) / 10,
        },
        performance: {
          onTimePercent: Math.round(onTimePct * 10) / 10,
        },
      },
    };
  }

  async getAlerts(tenantId: string, severity: string, limit: number) {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    const alerts: Array<{
      id: string;
      type: string;
      severity: 'critical' | 'warning' | 'info';
      title: string;
      description: string;
      entityType: string;
      entityId: string;
      createdAt: Date;
      acknowledged: boolean;
    }> = [];

    // 1. Critical: Stale check calls (in-transit loads, no check call in 4h)
    if (severity === 'all' || severity === 'critical') {
      // Load model has no lastCheckCallAt field — query via CheckCall relation
      const inTransitLoads = await this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: IN_TRANSIT_STATUSES },
        },
        select: {
          id: true,
          loadNumber: true,
          carrier: { select: { legalName: true } },
          checkCalls: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        take: limit * 2, // over-fetch since we filter in memory
      });

      for (const load of inTransitLoads) {
        const lastCall = load.checkCalls[0]?.createdAt;
        if (!lastCall || lastCall < fourHoursAgo) {
          alerts.push({
            id: `stale-checkcall-${load.id}`,
            type: 'STALE_CHECK_CALL',
            severity: 'critical',
            title: `No check call: ${load.loadNumber}`,
            description: `Last check call was ${lastCall ? this.timeAgo(lastCall) : 'never'}. Carrier: ${load.carrier?.legalName ?? 'Unassigned'}`,
            entityType: 'load',
            entityId: String(load.id),
            createdAt: lastCall ?? now,
            acknowledged: false,
          });
        }
      }
    }

    // 1b. Critical: Expired insurance on active carriers
    if (severity === 'all' || severity === 'critical') {
      const expiredInsurance = await this.prisma.carrierInsurance.findMany({
        where: {
          carrier: { tenantId, deletedAt: null, status: 'ACTIVE' },
          expirationDate: { lt: now },
        },
        select: {
          id: true,
          insuranceType: true,
          expirationDate: true,
          carrier: { select: { id: true, legalName: true } },
        },
        take: limit,
      });

      for (const ins of expiredInsurance) {
        if (!ins.carrier) continue;
        alerts.push({
          id: `expired-insurance-${ins.id}`,
          type: 'EXPIRED_INSURANCE',
          severity: 'critical',
          title: `Insurance expired: ${ins.carrier.legalName}`,
          description: `${ins.insuranceType} insurance expired ${ins.expirationDate.toISOString().split('T')[0]}`,
          entityType: 'carrier',
          entityId: String(ins.carrier.id),
          createdAt: ins.expirationDate,
          acknowledged: false,
        });
      }
    }

    // 2. Warning: Unassigned loads older than 6 hours
    if (severity === 'all' || severity === 'warning') {
      const unassignedLoads = await this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['PLANNING', 'PENDING'] },
          carrierId: null,
          createdAt: { lt: sixHoursAgo },
        },
        select: { id: true, loadNumber: true, createdAt: true },
        take: limit,
      });

      for (const load of unassignedLoads) {
        alerts.push({
          id: `unassigned-${load.id}`,
          type: 'UNASSIGNED_LOAD',
          severity: 'warning',
          title: `Unassigned: ${load.loadNumber}`,
          description: `Created ${this.timeAgo(load.createdAt)} with no carrier assigned`,
          entityType: 'load',
          entityId: String(load.id),
          createdAt: load.createdAt,
          acknowledged: false,
        });
      }
    }

    // 3. Warning: Expiring carrier insurance (next 30 days)
    if (severity === 'all' || severity === 'warning') {
      const expiringInsurance = await this.prisma.carrierInsurance.findMany({
        where: {
          carrier: { tenantId, deletedAt: null, status: 'ACTIVE' },
          expirationDate: { gte: now, lte: thirtyDaysFromNow },
        },
        select: {
          id: true,
          insuranceType: true,
          expirationDate: true,
          carrier: { select: { id: true, legalName: true } },
        },
        take: limit,
      });

      for (const ins of expiringInsurance) {
        if (!ins.carrier) continue;
        alerts.push({
          id: `insurance-${ins.id}`,
          type: 'EXPIRING_INSURANCE',
          severity: 'warning',
          title: `Insurance expiring: ${ins.carrier.legalName}`,
          description: `${ins.insuranceType} insurance expires ${ins.expirationDate.toISOString().split('T')[0]}`,
          entityType: 'carrier',
          entityId: String(ins.carrier.id),
          createdAt: now,
          acknowledged: false,
        });
      }
    }

    // 4. Info: Loads with delivery due within 4 hours (tight deadline)
    if (severity === 'all' || severity === 'info') {
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const nearDeadlineLoads = await this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: IN_TRANSIT_STATUSES },
          deliveredAt: null,
          order: {
            requiredDeliveryDate: { gte: now, lte: fourHoursFromNow },
          },
        },
        select: {
          id: true,
          loadNumber: true,
          order: { select: { requiredDeliveryDate: true } },
          carrier: { select: { legalName: true } },
        },
        take: limit,
      });

      for (const load of nearDeadlineLoads) {
        const deadline = load.order?.requiredDeliveryDate;
        alerts.push({
          id: `deadline-${load.id}`,
          type: 'DELIVERY_DEADLINE',
          severity: 'info',
          title: `Delivery due soon: ${load.loadNumber}`,
          description: `Due ${deadline ? this.timeUntil(deadline) : 'soon'}. Carrier: ${load.carrier?.legalName ?? 'Unassigned'}`,
          entityType: 'load',
          entityId: String(load.id),
          createdAt: now,
          acknowledged: false,
        });
      }
    }

    // Sort by severity (critical first), then by createdAt (newest first)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      data: alerts.slice(0, limit),
      total: alerts.length,
    };
  }

  async autoMatch(_tenantId: string, _loadId: string) {
    // Stub: will implement carrier matching algorithm in MP-05-012
    return {
      data: {
        loadId: _loadId,
        suggestions: [],
        message:
          'Auto-match engine not yet implemented. Coming in a future sprint.',
      },
    };
  }

  /**
   * Recent activity feed — last N audit log entries for the tenant.
   */
  async getActivity(tenantId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          userId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Carrier availability — active carriers with their current load count.
   */
  async getCarrierAvailability(tenantId: string) {
    const carriers = await this.prisma.carrier.findMany({
      where: { tenantId, deletedAt: null, status: 'ACTIVE' },
      orderBy: { legalName: 'asc' },
      take: 100,
    });

    // Count active loads per carrier in a single query
    const carrierIds = carriers.map((c) => c.id);
    const loadCounts = await this.prisma.load.groupBy({
      by: ['carrierId'],
      where: {
        carrierId: { in: carrierIds },
        status: { in: IN_TRANSIT_STATUSES },
        deletedAt: null,
      },
      _count: true,
    });
    const countMap = new Map(
      loadCounts.map((lc) => [lc.carrierId, lc._count])
    );

    return {
      data: carriers.map((c) => ({
        id: c.id,
        legalName: c.legalName,
        mcNumber: c.mcNumber,
        dotNumber: c.dotNumber,
        status: c.status,
        overallScore: (c as Record<string, unknown>).performanceScore
          ? Number((c as Record<string, unknown>).performanceScore)
          : null,
        activeLoadCount: countMap.get(c.id) ?? 0,
      })),
    };
  }

  private getPeriodRange(period: string) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (period === 'thisWeek') {
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
    } else if (period === 'thisMonth') {
      start.setDate(1);
    }

    return { start, end };
  }

  /**
   * Count in-transit loads with no check call or latest check call > 4h ago.
   */
  private async countStaleLoads(tenantId: string): Promise<number> {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const inTransitLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: IN_TRANSIT_STATUSES },
      },
      select: {
        checkCalls: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
      },
    });
    return inTransitLoads.filter((load) => {
      const lastCall = load.checkCalls[0]?.createdAt;
      return !lastCall || lastCall < fourHoursAgo;
    }).length;
  }

  private timeUntil(date: Date): string {
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    if (seconds < 60) return 'in less than a minute';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainMin = minutes % 60;
    return remainMin > 0 ? `in ${hours}h ${remainMin}m` : `in ${hours}h`;
  }

  private timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
