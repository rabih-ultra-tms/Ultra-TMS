import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

// Active load statuses (not terminal)
const ACTIVE_STATUSES = [
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

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#94a3b8',
  PLANNING: '#a78bfa',
  TENDERED: '#fbbf24',
  ACCEPTED: '#60a5fa',
  DISPATCHED: '#38bdf8',
  AT_PICKUP: '#818cf8',
  PICKED_UP: '#34d399',
  IN_TRANSIT: '#22d3ee',
  AT_DELIVERY: '#f97316',
  DELIVERED: '#10b981',
  COMPLETED: '#6ee7b7',
  CANCELLED: '#ef4444',
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ===========================================================================
  // KPIs
  // ===========================================================================

  async getKPIs(
    tenantId: string,
    period: string,
    scope: string,
    comparisonPeriod: string,
    userId?: string,
  ) {
    const { start, end } = this.getPeriodRange(period);
    const { start: compStart, end: compEnd } = this.getComparisonRange(
      comparisonPeriod,
      start,
    );
    const scopeFilter =
      scope === 'personal' && userId ? { createdById: userId } : {};

    // Current period queries
    const [
      activeLoads,
      dispatchedToday,
      deliveredToday,
      periodLoads,
      compActiveLoads,
      compDispatchedToday,
      compDeliveredToday,
      compPeriodLoads,
    ] = await Promise.all([
      // Active loads (current)
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ACTIVE_STATUSES },
          ...scopeFilter,
        },
      }),
      // Dispatched in period
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          dispatchedAt: { gte: start, lte: end },
          ...scopeFilter,
        },
      }),
      // Delivered in period
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          deliveredAt: { gte: start, lte: end },
          ...scopeFilter,
        },
      }),
      // Period loads for margin/revenue
      this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: start, lte: end },
          ...scopeFilter,
        },
        select: { totalCost: true, order: { select: { totalCharges: true } } },
      }),

      // Comparison period queries
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ACTIVE_STATUSES },
          createdAt: { gte: compStart, lte: compEnd },
          ...scopeFilter,
        },
      }),
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          dispatchedAt: { gte: compStart, lte: compEnd },
          ...scopeFilter,
        },
      }),
      this.prisma.load.count({
        where: {
          tenantId,
          deletedAt: null,
          deliveredAt: { gte: compStart, lte: compEnd },
          ...scopeFilter,
        },
      }),
      this.prisma.load.findMany({
        where: {
          tenantId,
          deletedAt: null,
          createdAt: { gte: compStart, lte: compEnd },
          ...scopeFilter,
        },
        select: { totalCost: true, order: { select: { totalCharges: true } } },
      }),
    ]);

    // Calculate revenue + margin
    const revenue = periodLoads.reduce(
      (sum, l) => sum + Number(l.order?.totalCharges ?? 0),
      0,
    );
    const cost = periodLoads.reduce(
      (sum, l) => sum + Number(l.totalCost ?? 0),
      0,
    );
    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

    const compRevenue = compPeriodLoads.reduce(
      (sum, l) => sum + Number(l.order?.totalCharges ?? 0),
      0,
    );
    const compCost = compPeriodLoads.reduce(
      (sum, l) => sum + Number(l.totalCost ?? 0),
      0,
    );
    const compMargin =
      compRevenue > 0 ? ((compRevenue - compCost) / compRevenue) * 100 : 0;

    // On-time: delivered loads where deliveredAt <= requiredDeliveryDate
    const deliveredLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        deliveredAt: { gte: start, lte: end, not: null },
        ...scopeFilter,
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
        l.deliveredAt <= l.order.requiredDeliveryDate,
    ).length;
    const onTimePct =
      deliveredLoads.length > 0
        ? (onTimeCount / deliveredLoads.length) * 100
        : 100;

    return {
      data: {
        activeLoads,
        activeLoadsChange: this.calcChange(activeLoads, compActiveLoads),
        dispatchedToday,
        dispatchedTodayChange: this.calcChange(
          dispatchedToday,
          compDispatchedToday,
        ),
        deliveredToday,
        deliveredTodayChange: this.calcChange(
          deliveredToday,
          compDeliveredToday,
        ),
        onTimePercentage: Math.round(onTimePct * 10) / 10,
        onTimePercentageChange: 0,
        averageMargin: Math.round(margin * 10) / 10,
        averageMarginChange: Math.round((margin - compMargin) * 10) / 10,
        revenueMTD: Math.round(revenue * 100) / 100,
        revenueMTDChange: this.calcChange(revenue, compRevenue),
        sparklines: {
          activeLoads: [],
          dispatchedToday: [],
          deliveredToday: [],
          onTimePercentage: [],
          averageMargin: [],
          revenueMTD: [],
        },
      },
    };
  }

  // ===========================================================================
  // Charts
  // ===========================================================================

  async getCharts(tenantId: string, period: string) {
    // Loads by status
    const loads = await this.prisma.load.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { id: true },
    });

    const loadsByStatus = loads.map((l) => ({
      status: l.status,
      count: l._count.id,
      color: STATUS_COLORS[l.status] ?? '#94a3b8',
    }));

    // Revenue trend (last 7/30 days depending on period)
    const days = period === 'thisMonth' ? 30 : period === 'thisWeek' ? 7 : 7;
    const trendStart = new Date();
    trendStart.setDate(trendStart.getDate() - days);
    trendStart.setHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        deletedAt: null,
        orderDate: { gte: trendStart },
      },
      select: { orderDate: true, totalCharges: true },
      orderBy: { orderDate: 'asc' },
    });

    // Group by date
    const revenueByDate = new Map<string, number>();
    for (const order of orders) {
      const dateKey = order.orderDate.toISOString().split('T')[0]!;
      revenueByDate.set(
        dateKey,
        (revenueByDate.get(dateKey) ?? 0) + Number(order.totalCharges ?? 0),
      );
    }
    const revenueTrend = Array.from(revenueByDate.entries()).map(
      ([date, revenue]) => ({ date, revenue }),
    );

    return { data: { loadsByStatus, revenueTrend } };
  }

  // ===========================================================================
  // Alerts
  // ===========================================================================

  async getAlerts(tenantId: string) {
    const now = new Date();
    const alerts: Array<{
      id: string;
      severity: string;
      entityType: string;
      entityId: string;
      entityNumber: string;
      message: string;
      createdAt: string;
      actionType?: string;
    }> = [];

    // Loads with ETA past due
    const pastDueLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['IN_TRANSIT', 'AT_PICKUP', 'PICKED_UP'] },
        eta: { lt: now },
      },
      select: { id: true, loadNumber: true, eta: true, createdAt: true },
      take: 20,
    });
    for (const load of pastDueLoads) {
      alerts.push({
        id: `alert-eta-${load.id}`,
        severity: 'warning',
        entityType: 'load',
        entityId: load.id,
        entityNumber: load.loadNumber,
        message: `ETA past due (was ${load.eta?.toLocaleDateString() ?? 'unknown'})`,
        createdAt: load.createdAt.toISOString(),
        actionType: 'update',
      });
    }

    // Loads in transit with no check call in 4+ hours
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const inTransitLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['IN_TRANSIT', 'PICKED_UP'] },
        lastTrackingUpdate: { lt: fourHoursAgo },
      },
      select: {
        id: true,
        loadNumber: true,
        lastTrackingUpdate: true,
        createdAt: true,
      },
      take: 20,
    });
    for (const load of inTransitLoads) {
      alerts.push({
        id: `alert-checkcall-${load.id}`,
        severity: 'critical',
        entityType: 'load',
        entityId: load.id,
        entityNumber: load.loadNumber,
        message: 'No check call in 4+ hours',
        createdAt: load.createdAt.toISOString(),
        actionType: 'call',
      });
    }

    // Dispatched loads with no carrier
    const noCarrierLoads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['PENDING', 'PLANNING', 'TENDERED'] },
        carrierId: null,
        createdAt: { lt: fourHoursAgo },
      },
      select: { id: true, loadNumber: true, createdAt: true },
      take: 10,
    });
    for (const load of noCarrierLoads) {
      alerts.push({
        id: `alert-nocarrier-${load.id}`,
        severity: 'warning',
        entityType: 'load',
        entityId: load.id,
        entityNumber: load.loadNumber,
        message: 'No carrier assigned',
        createdAt: load.createdAt.toISOString(),
        actionType: 'update',
      });
    }

    return { data: alerts };
  }

  // ===========================================================================
  // Activity Feed
  // ===========================================================================

  async getActivity(tenantId: string, period: string) {
    const { start, end } = this.getPeriodRange(period);

    const history = await this.prisma.statusHistory.findMany({
      where: {
        tenantId,
        deletedAt: null,
        createdAt: { gte: start, lte: end },
        entityType: { in: ['load', 'order', 'LOAD', 'ORDER'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        load: { select: { loadNumber: true } },
        order: { select: { orderNumber: true } },
      },
    });

    const activity = history.map((h) => {
      const entityType = h.entityType.toLowerCase() as 'load' | 'order';
      const entityNumber =
        entityType === 'load'
          ? (h.load?.loadNumber ?? h.entityId)
          : (h.order?.orderNumber ?? h.entityId);
      return {
        id: h.id,
        timestamp: h.createdAt.toISOString(),
        userName: h.createdById ?? 'System',
        userId: h.createdById ?? '',
        entityType,
        entityId: h.entityId,
        entityNumber,
        action: `${h.oldStatus ?? 'NEW'} → ${h.newStatus}`,
        description: h.notes ?? `Status changed to ${h.newStatus}`,
      };
    });

    return { data: activity };
  }

  // ===========================================================================
  // Needs Attention
  // ===========================================================================

  async getNeedsAttention(tenantId: string) {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const items: Array<{
      id: string;
      loadNumber: string;
      origin: string;
      destination: string;
      issue: string;
      severity: string;
      issueType: string;
      timeSinceIssue?: string;
    }> = [];

    // Loads needing attention: no check call, ETA past, no carrier
    const loads = await this.prisma.load.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ACTIVE_STATUSES },
        OR: [
          // ETA past due
          { eta: { lt: now }, status: { in: ['IN_TRANSIT', 'PICKED_UP'] } },
          // No tracking update in 4h
          {
            lastTrackingUpdate: { lt: fourHoursAgo },
            status: { in: ['IN_TRANSIT', 'PICKED_UP'] },
          },
          // No carrier on pending loads older than 4h
          {
            carrierId: null,
            status: { in: ['PENDING', 'PLANNING'] },
            createdAt: { lt: fourHoursAgo },
          },
        ],
      },
      select: {
        id: true,
        loadNumber: true,
        status: true,
        eta: true,
        lastTrackingUpdate: true,
        carrierId: true,
        createdAt: true,
        stops: {
          where: { deletedAt: null },
          select: { city: true, state: true, stopType: true, stopSequence: true },
          orderBy: { stopSequence: 'asc' },
        },
      },
      take: 20,
    });

    for (const load of loads) {
      const pickup = load.stops.find(
        (s) => s.stopType === 'PICKUP' || s.stopSequence === 1,
      );
      const delivery = load.stops.find(
        (s) =>
          s.stopType === 'DELIVERY' ||
          s.stopSequence === load.stops.length,
      );
      const origin = pickup
        ? `${pickup.city}, ${pickup.state}`
        : 'Unknown';
      const destination = delivery
        ? `${delivery.city}, ${delivery.state}`
        : 'Unknown';

      if (load.eta && load.eta < now && ['IN_TRANSIT', 'PICKED_UP'].includes(load.status)) {
        items.push({
          id: load.id,
          loadNumber: load.loadNumber,
          origin,
          destination,
          issue: 'ETA past due',
          severity: 'critical',
          issueType: 'eta_past_due',
          timeSinceIssue: this.timeSince(load.eta),
        });
      } else if (
        load.lastTrackingUpdate &&
        load.lastTrackingUpdate < fourHoursAgo &&
        ['IN_TRANSIT', 'PICKED_UP'].includes(load.status)
      ) {
        items.push({
          id: load.id,
          loadNumber: load.loadNumber,
          origin,
          destination,
          issue: 'No check call in 4+ hours',
          severity: 'critical',
          issueType: 'no_check_call',
          timeSinceIssue: this.timeSince(load.lastTrackingUpdate),
        });
      } else if (!load.carrierId) {
        items.push({
          id: load.id,
          loadNumber: load.loadNumber,
          origin,
          destination,
          issue: 'No carrier assigned',
          severity: 'warning',
          issueType: 'no_carrier',
          timeSinceIssue: this.timeSince(load.createdAt),
        });
      }
    }

    return { data: items };
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private getPeriodRange(period: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);
    switch (period) {
      case 'thisWeek': {
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        break;
      }
      case 'thisMonth':
        start.setDate(1);
        break;
      default: // 'today'
        break;
    }
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  private getComparisonRange(
    comparisonPeriod: string,
    currentStart: Date,
  ): { start: Date; end: Date } {
    const start = new Date(currentStart);
    const end = new Date(currentStart);

    switch (comparisonPeriod) {
      case 'lastWeek':
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() - 1);
        break;
      case 'lastMonth':
        start.setMonth(start.getMonth() - 1);
        end.setDate(end.getDate() - 1);
        break;
      default: // 'yesterday'
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        break;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  private timeSince(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}
