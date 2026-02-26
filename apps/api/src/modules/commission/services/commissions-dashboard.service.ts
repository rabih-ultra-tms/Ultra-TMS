import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CommissionsDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Aggregate commission entries
    const [pendingAgg, paidMTDAgg, paidYTDAgg, allApprovedEntries] =
      await Promise.all([
        this.prisma.commissionEntry.aggregate({
          where: { tenantId, status: 'PENDING' },
          _sum: { commissionAmount: true },
        }),
        this.prisma.commissionEntry.aggregate({
          where: {
            tenantId,
            status: 'PAID',
            paidAt: { gte: startOfMonth },
          },
          _sum: { commissionAmount: true },
        }),
        this.prisma.commissionEntry.aggregate({
          where: {
            tenantId,
            status: 'PAID',
            paidAt: { gte: startOfYear },
          },
          _sum: { commissionAmount: true },
        }),
        this.prisma.commissionEntry.findMany({
          where: {
            tenantId,
            status: { in: ['APPROVED', 'PAID'] },
          },
          select: { rateApplied: true },
        }),
      ]);

    const pendingTotal = Number(pendingAgg._sum.commissionAmount ?? 0);
    const paidMTD = Number(paidMTDAgg._sum.commissionAmount ?? 0);
    const paidYTD = Number(paidYTDAgg._sum.commissionAmount ?? 0);

    const avgCommissionRate =
      allApprovedEntries.length > 0
        ? allApprovedEntries.reduce(
            (sum, e) => sum + Number(e.rateApplied ?? 0),
            0,
          ) / allApprovedEntries.length
        : 0;

    // Top reps: users with commission assignments, ranked by YTD paid
    const topReps = await this.getTopReps(tenantId, startOfYear, startOfMonth);

    return {
      pendingTotal,
      paidMTD,
      paidYTD,
      avgCommissionRate: Math.round(avgCommissionRate * 100) / 100,
      topReps,
    };
  }

  private async getTopReps(
    tenantId: string,
    startOfYear: Date,
    startOfMonth: Date,
  ) {
    // Get users with active commission assignments
    const assignments = await this.prisma.userCommissionAssignment.findMany({
      where: { tenantId, status: 'ACTIVE', deletedAt: null },
      select: {
        userId: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      distinct: ['userId'],
    });

    const reps = await Promise.all(
      assignments.map(async (a) => {
        if (!a.user) return null;

        const [pendingAgg, paidMTDAgg, paidYTDAgg, loadCount] =
          await Promise.all([
            this.prisma.commissionEntry.aggregate({
              where: { tenantId, userId: a.userId, status: 'PENDING' },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.aggregate({
              where: {
                tenantId,
                userId: a.userId,
                status: 'PAID',
                paidAt: { gte: startOfMonth },
              },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.aggregate({
              where: {
                tenantId,
                userId: a.userId,
                status: 'PAID',
                paidAt: { gte: startOfYear },
              },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.count({
              where: {
                tenantId,
                userId: a.userId,
                loadId: { not: null },
                status: { in: ['APPROVED', 'PAID'] },
              },
            }),
          ]);

        return {
          id: a.user.id,
          name: `${a.user.firstName} ${a.user.lastName}`,
          email: a.user.email,
          pendingAmount: Number(pendingAgg._sum.commissionAmount ?? 0),
          paidMTD: Number(paidMTDAgg._sum.commissionAmount ?? 0),
          paidYTD: Number(paidYTDAgg._sum.commissionAmount ?? 0),
          loadCount,
        };
      }),
    );

    return reps
      .filter(Boolean)
      .sort((a, b) => b!.paidYTD - a!.paidYTD)
      .slice(0, 10);
  }

  async listReps(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Build user filter
    const userWhere: any = { tenantId, deletedAt: null };
    if (options.search) {
      userWhere.OR = [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    // Get users that have commission assignments
    const assignmentWhere: any = { tenantId, deletedAt: null };
    if (options.status && options.status !== 'all') {
      assignmentWhere.status = options.status.toUpperCase();
    }

    const [assignments, total] = await Promise.all([
      this.prisma.userCommissionAssignment.findMany({
        where: {
          ...assignmentWhere,
          user: userWhere,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              createdAt: true,
            },
          },
          plan: { select: { id: true, name: true } },
        },
        distinct: ['userId'],
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userCommissionAssignment.groupBy({
        by: ['userId'],
        where: {
          ...assignmentWhere,
          user: userWhere,
        },
      }).then((groups) => groups.length),
    ]);

    const data = await Promise.all(
      assignments.map(async (a) => {
        if (!a.user) return null;

        const [pendingAgg, paidMTDAgg, paidYTDAgg, loadCount] =
          await Promise.all([
            this.prisma.commissionEntry.aggregate({
              where: { tenantId, userId: a.userId, status: 'PENDING' },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.aggregate({
              where: {
                tenantId,
                userId: a.userId,
                status: 'PAID',
                paidAt: { gte: startOfMonth },
              },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.aggregate({
              where: {
                tenantId,
                userId: a.userId,
                status: 'PAID',
                paidAt: { gte: startOfYear },
              },
              _sum: { commissionAmount: true },
            }),
            this.prisma.commissionEntry.count({
              where: {
                tenantId,
                userId: a.userId,
                loadId: { not: null },
                status: { in: ['APPROVED', 'PAID'] },
              },
            }),
          ]);

        return {
          id: a.user.id,
          name: `${a.user.firstName} ${a.user.lastName}`,
          email: a.user.email,
          planId: a.plan?.id ?? null,
          planName: a.plan?.name ?? null,
          pendingAmount: Number(pendingAgg._sum.commissionAmount ?? 0),
          paidMTD: Number(paidMTDAgg._sum.commissionAmount ?? 0),
          paidYTD: Number(paidYTDAgg._sum.commissionAmount ?? 0),
          loadCount,
          status: a.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          createdAt: a.user.createdAt.toISOString(),
        };
      }),
    );

    return {
      data: data.filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRep(tenantId: string, userId: string) {
    const assignment = await this.prisma.userCommissionAssignment.findFirst({
      where: { tenantId, userId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
        plan: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!assignment?.user) {
      throw new NotFoundException('Commission rep not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [pendingAgg, paidMTDAgg, paidYTDAgg, loadCount] = await Promise.all([
      this.prisma.commissionEntry.aggregate({
        where: { tenantId, userId, status: 'PENDING' },
        _sum: { commissionAmount: true },
      }),
      this.prisma.commissionEntry.aggregate({
        where: {
          tenantId,
          userId,
          status: 'PAID',
          paidAt: { gte: startOfMonth },
        },
        _sum: { commissionAmount: true },
      }),
      this.prisma.commissionEntry.aggregate({
        where: {
          tenantId,
          userId,
          status: 'PAID',
          paidAt: { gte: startOfYear },
        },
        _sum: { commissionAmount: true },
      }),
      this.prisma.commissionEntry.count({
        where: {
          tenantId,
          userId,
          loadId: { not: null },
          status: { in: ['APPROVED', 'PAID'] },
        },
      }),
    ]);

    return {
      id: assignment.user.id,
      name: `${assignment.user.firstName} ${assignment.user.lastName}`,
      email: assignment.user.email,
      planId: assignment.plan?.id ?? null,
      planName: assignment.plan?.name ?? null,
      pendingAmount: Number(pendingAgg._sum.commissionAmount ?? 0),
      paidMTD: Number(paidMTDAgg._sum.commissionAmount ?? 0),
      paidYTD: Number(paidYTDAgg._sum.commissionAmount ?? 0),
      loadCount,
      status: assignment.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      createdAt: assignment.user.createdAt.toISOString(),
    };
  }

  async getRepTransactions(
    tenantId: string,
    userId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      this.prisma.commissionEntry.findMany({
        where: { tenantId, userId },
        include: {
          load: { select: { id: true, loadNumber: true } },
          order: { select: { id: true, orderNumber: true } },
          plan: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.commissionEntry.count({ where: { tenantId, userId } }),
    ]);

    const data = entries.map((e) => ({
      id: e.id,
      date: e.commissionPeriod.toISOString(),
      loadId: e.loadId ?? '',
      loadNumber: e.load?.loadNumber ?? '-',
      orderNumber: e.order?.orderNumber ?? '-',
      amount: Number(e.commissionAmount),
      rate: Number(e.rateApplied ?? 0),
      planName: e.plan?.name ?? '-',
      status: e.status as 'PENDING' | 'APPROVED' | 'PAID' | 'VOID',
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listTransactions(
    tenantId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options.status && options.status !== 'all') {
      where.status = options.status.toUpperCase();
    }

    if (options.startDate || options.endDate) {
      where.commissionPeriod = {};
      if (options.startDate) where.commissionPeriod.gte = new Date(options.startDate);
      if (options.endDate) where.commissionPeriod.lte = new Date(options.endDate);
    }

    if (options.search) {
      where.OR = [
        { user: { firstName: { contains: options.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: options.search, mode: 'insensitive' } } },
        { load: { loadNumber: { contains: options.search, mode: 'insensitive' } } },
        { order: { orderNumber: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy: any = {};
    if (options.sortBy) {
      orderBy[options.sortBy] = options.sortOrder ?? 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [entries, total] = await Promise.all([
      this.prisma.commissionEntry.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          load: { select: { id: true, loadNumber: true } },
          order: { select: { id: true, orderNumber: true, totalCharges: true } },
          plan: { select: { name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.commissionEntry.count({ where }),
    ]);

    const data = entries.map((e) => ({
      id: e.id,
      commissionPeriod: e.commissionPeriod?.toISOString() ?? null,
      userId: e.userId,
      user: e.user,
      loadId: e.loadId,
      load: e.load,
      order: e.order
        ? {
            id: e.order.id,
            orderNumber: e.order.orderNumber,
            totalCharges: e.order.totalCharges != null ? Number(e.order.totalCharges) : 0,
          }
        : null,
      commissionAmount: Number(e.commissionAmount),
      rateApplied: e.rateApplied != null ? Number(e.rateApplied) : null,
      plan: e.plan,
      status: e.status,
      reversalReason: e.reversalReason ?? null,
      createdAt: e.createdAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async assignPlan(tenantId: string, userId: string, planId: string) {
    // Verify plan exists
    const plan = await this.prisma.commissionPlan.findFirst({
      where: { id: planId, tenantId, deletedAt: null },
    });
    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }

    // Deactivate existing assignments
    await this.prisma.userCommissionAssignment.updateMany({
      where: { tenantId, userId, status: 'ACTIVE' },
      data: { status: 'INACTIVE', endDate: new Date() },
    });

    // Create new assignment
    await this.prisma.userCommissionAssignment.create({
      data: {
        tenantId,
        userId,
        planId,
        effectiveDate: new Date(),
        status: 'ACTIVE',
      },
    });

    return this.getRep(tenantId, userId);
  }

  // ── Reports endpoint data ──────────────────────────────────────────

  async getReports(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    const hasDates = Object.keys(dateFilter).length > 0;

    const [earnings, planUsage, payoutSummary] = await Promise.all([
      this.getEarningsByRep(tenantId, hasDates ? dateFilter : undefined),
      this.getPlanUsage(tenantId),
      this.getPayoutSummary(tenantId, hasDates ? dateFilter : undefined),
    ]);

    return { earnings, planUsage, payoutSummary };
  }

  private async getEarningsByRep(
    tenantId: string,
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const where: any = {
      tenantId,
      status: { in: ['APPROVED', 'PAID'] },
    };
    if (dateFilter) where.commissionPeriod = dateFilter;

    const entries = await this.prisma.commissionEntry.findMany({
      where,
      select: {
        userId: true,
        commissionAmount: true,
        status: true,
        commissionPeriod: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });

    // Group by rep + month
    const map = new Map<string, { repName: string; month: string; earned: number; paid: number }>();
    for (const e of entries) {
      const repName = e.user
        ? `${e.user.firstName} ${e.user.lastName}`
        : 'Unknown';
      const month = e.commissionPeriod.toISOString().slice(0, 7); // YYYY-MM
      const key = `${e.userId}|${month}`;
      const existing = map.get(key) ?? { repName, month, earned: 0, paid: 0 };
      const amt = Number(e.commissionAmount);
      existing.earned += amt;
      if (e.status === 'PAID') existing.paid += amt;
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month) || a.repName.localeCompare(b.repName),
    );
  }

  private async getPlanUsage(tenantId: string) {
    const assignments = await this.prisma.userCommissionAssignment.findMany({
      where: { tenantId, status: 'ACTIVE', deletedAt: null },
      select: {
        planId: true,
        userId: true,
        plan: { select: { name: true } },
      },
    });

    // Group by plan
    const planMap = new Map<string, { planName: string; reps: Set<string> }>();
    for (const a of assignments) {
      if (!a.planId) continue;
      const existing = planMap.get(a.planId) ?? {
        planName: a.plan?.name ?? 'Unknown',
        reps: new Set<string>(),
      };
      existing.reps.add(a.userId);
      planMap.set(a.planId, existing);
    }

    // Get total earned per plan
    const result = await Promise.all(
      Array.from(planMap.entries()).map(async ([planId, info]) => {
        const agg = await this.prisma.commissionEntry.aggregate({
          where: {
            tenantId,
            planId,
            status: { in: ['APPROVED', 'PAID'] },
          },
          _sum: { commissionAmount: true },
        });
        return {
          planName: info.planName,
          repCount: info.reps.size,
          totalEarned: Number(agg._sum.commissionAmount ?? 0),
        };
      }),
    );

    return result.sort((a, b) => b.repCount - a.repCount);
  }

  private async getPayoutSummary(
    tenantId: string,
    dateFilter?: { gte?: Date; lte?: Date },
  ) {
    const where: any = {
      tenantId,
      status: 'PAID',
      deletedAt: null,
    };
    if (dateFilter) where.paidAt = dateFilter;

    const payouts = await this.prisma.commissionPayout.findMany({
      where,
      select: {
        netPayout: true,
        paymentMethod: true,
        paidAt: true,
      },
    });

    // Group by month
    const monthMap = new Map<
      string,
      { totalPaid: number; achCount: number; checkCount: number; wireCount: number }
    >();

    for (const p of payouts) {
      if (!p.paidAt) continue;
      const month = p.paidAt.toISOString().slice(0, 7);
      const existing = monthMap.get(month) ?? {
        totalPaid: 0,
        achCount: 0,
        checkCount: 0,
        wireCount: 0,
      };
      existing.totalPaid += Number(p.netPayout);
      const method = (p.paymentMethod ?? '').toUpperCase();
      if (method === 'ACH') existing.achCount++;
      else if (method === 'CHECK') existing.checkCount++;
      else if (method === 'WIRE') existing.wireCount++;
      monthMap.set(month, existing);
    }

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
