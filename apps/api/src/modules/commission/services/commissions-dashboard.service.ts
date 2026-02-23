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
}
