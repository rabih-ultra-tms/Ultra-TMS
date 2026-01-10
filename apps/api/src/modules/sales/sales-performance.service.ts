import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSalesQuotaDto, UpdateSalesQuotaDto, PerformanceQueryDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalesPerformanceService {
  constructor(private prisma: PrismaService) {}

  async findAllQuotas(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      userId?: string;
      periodType?: string;
      status?: string;
    },
  ) {
    const { page = 1, limit = 20, userId, periodType, status } = options || {};
    const skip = (page - 1) * limit;

    const where: Prisma.SalesQuotaWhereInput = { tenantId };
    if (userId) where.userId = userId;
    if (periodType) where.periodType = periodType;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.salesQuota.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.salesQuota.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneQuota(tenantId: string, id: string) {
    const quota = await this.prisma.salesQuota.findFirst({
      where: { id, tenantId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!quota) {
      throw new NotFoundException(`Sales quota with ID ${id} not found`);
    }

    // Calculate progress
    const revenueProgress = quota.revenueTarget
      ? ((Number(quota.revenueActual || 0)) / Number(quota.revenueTarget)) * 100
      : 0;
    const loadsProgress = quota.loadsTarget
      ? ((quota.loadsActual || 0) / quota.loadsTarget) * 100
      : 0;
    const customersProgress = quota.newCustomersTarget
      ? ((quota.newCustomersActual || 0) / quota.newCustomersTarget) * 100
      : 0;

    return {
      ...quota,
      progress: {
        revenue: revenueProgress,
        loads: loadsProgress,
        customers: customersProgress,
        overall: (revenueProgress + loadsProgress + customersProgress) / 3,
      },
    };
  }

  async createQuota(tenantId: string, userId: string, dto: CreateSalesQuotaDto) {
    // Check for existing quota in the same period
    const existing = await this.prisma.salesQuota.findFirst({
      where: {
        tenantId,
        userId: dto.userId,
        periodStart: new Date(dto.periodStart),
      },
    });

    if (existing) {
      throw new BadRequestException('A quota already exists for this user in this period');
    }

    return this.prisma.salesQuota.create({
      data: {
        tenantId,
        userId: dto.userId,
        periodType: dto.periodType,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        revenueTarget: dto.revenueTarget,
        loadsTarget: dto.loadsTarget,
        newCustomersTarget: dto.newCustomersTarget,
        status: dto.status || 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateQuota(tenantId: string, id: string, userId: string, dto: UpdateSalesQuotaDto) {
    await this.findOneQuota(tenantId, id);

    return this.prisma.salesQuota.update({
      where: { id },
      data: {
        periodStart: dto.periodStart ? new Date(dto.periodStart) : undefined,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : undefined,
        revenueTarget: dto.revenueTarget,
        loadsTarget: dto.loadsTarget,
        newCustomersTarget: dto.newCustomersTarget,
        status: dto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getPerformance(tenantId: string, query: PerformanceQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const where: Prisma.QuoteWhereInput = {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.userId) {
      where.salesRepId = query.userId;
    }

    // Get quote statistics
    const quotes = await this.prisma.quote.findMany({
      where,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        convertedAt: true,
      },
    });

    const totalQuotes = quotes.length;
    const sentQuotes = quotes.filter((q) => ['SENT', 'VIEWED', 'ACCEPTED', 'CONVERTED'].includes(q.status)).length;
    const convertedQuotes = quotes.filter((q) => q.status === 'CONVERTED').length;
    const totalRevenue = quotes
      .filter((q) => q.status === 'CONVERTED')
      .reduce((sum, q) => sum + Number(q.totalAmount || 0), 0);

    const conversionRate = sentQuotes > 0 ? (convertedQuotes / sentQuotes) * 100 : 0;

    // Calculate average time to convert
    const convertedWithTime = quotes.filter((q) => q.convertedAt && q.createdAt);
    const avgTimeToConvert =
      convertedWithTime.length > 0
        ? convertedWithTime.reduce((sum, q) => {
            const days = Math.floor(
              (new Date(q.convertedAt!).getTime() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / convertedWithTime.length
        : 0;

    return {
      period: {
        startDate,
        endDate,
      },
      metrics: {
        totalQuotes,
        sentQuotes,
        convertedQuotes,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue,
        avgTimeToConvertDays: Math.round(avgTimeToConvert * 10) / 10,
      },
    };
  }

  async getLeaderboard(tenantId: string, query: PerformanceQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    // Get all sales reps with their quote stats
    const salesReps = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: {
          name: {
            in: ['Sales Rep', 'Sales Manager'],
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const leaderboard = await Promise.all(
      salesReps.map(async (rep) => {
        const quotes = await this.prisma.quote.findMany({
          where: {
            tenantId,
            salesRepId: rep.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
            totalAmount: true,
          },
        });

        const convertedQuotes = quotes.filter((q) => q.status === 'CONVERTED');
        const revenue = convertedQuotes.reduce((sum, q) => sum + Number(q.totalAmount || 0), 0);

        return {
          user: rep,
          totalQuotes: quotes.length,
          convertedQuotes: convertedQuotes.length,
          revenue,
          conversionRate: quotes.length > 0 ? (convertedQuotes.length / quotes.length) * 100 : 0,
        };
      }),
    );

    // Sort by revenue
    leaderboard.sort((a, b) => b.revenue - a.revenue);

    return {
      period: {
        startDate,
        endDate,
      },
      leaderboard,
    };
  }

  async getConversionMetrics(tenantId: string, query: PerformanceQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const where: Prisma.QuoteWhereInput = {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.userId) {
      where.salesRepId = query.userId;
    }

    const quotes = await this.prisma.quote.findMany({
      where,
      select: {
        status: true,
        createdAt: true,
        sentAt: true,
        convertedAt: true,
      },
    });

    const byStatus = quotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentQuotes = quotes.filter((q) => q.sentAt);
    const convertedQuotes = quotes.filter((q) => q.status === 'CONVERTED');

    const avgTimeToSend =
      sentQuotes.length > 0
        ? sentQuotes.reduce((sum, q) => {
            const days = Math.floor(
              (new Date(q.sentAt!).getTime() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / sentQuotes.length
        : 0;

    const avgTimeToConvert =
      convertedQuotes.length > 0
        ? convertedQuotes.reduce((sum, q) => {
            const days = Math.floor(
              (new Date(q.convertedAt!).getTime() - new Date(q.createdAt).getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / convertedQuotes.length
        : 0;

    return {
      period: {
        startDate,
        endDate,
      },
      byStatus,
      metrics: {
        totalQuotes: quotes.length,
        sentQuotes: sentQuotes.length,
        convertedQuotes: convertedQuotes.length,
        conversionRate: sentQuotes.length > 0 ? (convertedQuotes.length / sentQuotes.length) * 100 : 0,
        avgTimeToSendDays: Math.round(avgTimeToSend * 10) / 10,
        avgTimeToConvertDays: Math.round(avgTimeToConvert * 10) / 10,
      },
    };
  }

  async getWinLossAnalysis(tenantId: string, query: PerformanceQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const where: Prisma.QuoteWhereInput = {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['ACCEPTED', 'REJECTED', 'CONVERTED'],
      },
    };

    if (query.userId) {
      where.salesRepId = query.userId;
    }

    const quotes = await this.prisma.quote.findMany({
      where,
      select: {
        status: true,
        rejectionReason: true,
        totalAmount: true,
      },
    });

    const wins = quotes.filter((q) => ['ACCEPTED', 'CONVERTED'].includes(q.status));
    const losses = quotes.filter((q) => q.status === 'REJECTED');

    const rejectionReasons = losses.reduce((acc, quote) => {
      const reason = quote.rejectionReason || 'No reason provided';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const winRate = quotes.length > 0 ? (wins.length / quotes.length) * 100 : 0;
    const avgWinValue = wins.length > 0 ? wins.reduce((sum, q) => sum + Number(q.totalAmount || 0), 0) / wins.length : 0;

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalQuotes: quotes.length,
        wins: wins.length,
        losses: losses.length,
        winRate: Math.round(winRate * 100) / 100,
        avgWinValue: Math.round(avgWinValue * 100) / 100,
      },
      rejectionReasons,
    };
  }
}
