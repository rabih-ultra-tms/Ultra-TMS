import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../../prisma.service';
import { CreateCommissionPlanDto, UpdateCommissionPlanDto } from '../dto';

/**
 * Convert Prisma Decimal fields to plain numbers so they survive
 * the ClassSerializerInterceptor (which mangles Decimal objects).
 */
function toPlain(obj: unknown): unknown {
  if (obj instanceof Decimal) return obj.toNumber();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(toPlain);
  if (obj !== null && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = toPlain(v);
    }
    return out;
  }
  return obj;
}

@Injectable()
export class CommissionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateCommissionPlanDto,
    userId?: string
  ) {
    const plan = await this.prisma.commissionPlan.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        planType: dto.planType,
        isDefault: dto.isDefault || false,
        effectiveDate: new Date(dto.effectiveDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        flatAmount: dto.flatAmount,
        percentRate: dto.percentRate,
        calculationBasis: dto.calculationBasis,
        minimumMarginPercent: dto.minimumMarginPercent,
        createdById: userId,
        tiers: dto.tiers
          ? {
              create: dto.tiers.map((tier) => ({
                tierNumber: tier.tierNumber,
                tierName: tier.tierName,
                thresholdType: tier.thresholdType,
                thresholdMin: tier.thresholdMin,
                thresholdMax: tier.thresholdMax,
                rateType: tier.rateType,
                rateAmount: tier.rateAmount,
                periodType: tier.periodType,
              })),
            }
          : undefined,
      },
      include: {
        tiers: {
          orderBy: { tierNumber: 'asc' },
        },
      },
    });
    return toPlain(plan);
  }

  async findAll(
    tenantId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      type?: string;
      isActive?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };

    if (options.status && options.status !== 'all') {
      where.status = options.status.toUpperCase();
    }

    if (options.type && options.type !== 'all') {
      where.planType = options.type;
    }

    if (options.isActive === 'true') {
      where.status = 'ACTIVE';
    } else if (options.isActive === 'false') {
      where.status = { not: 'ACTIVE' };
    }

    if (options.search) {
      where.name = { contains: options.search, mode: 'insensitive' };
    }

    const orderBy: any = {};
    if (options.sortBy) {
      orderBy[options.sortBy] = options.sortOrder ?? 'desc';
    } else {
      orderBy.effectiveDate = 'desc';
    }

    const [plans, total] = await Promise.all([
      this.prisma.commissionPlan.findMany({
        where,
        include: {
          tiers: {
            orderBy: { tierNumber: 'asc' },
          },
          _count: {
            select: {
              assignments: true,
              entries: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.commissionPlan.count({ where }),
    ]);

    return {
      data: plans.map((p) => toPlain(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const plan = await this.prisma.commissionPlan.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        tiers: {
          orderBy: { tierNumber: 'asc' },
        },
        assignments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }

    return toPlain(plan);
  }

  async update(tenantId: string, id: string, dto: UpdateCommissionPlanDto) {
    const existing = await this.prisma.commissionPlan.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Commission plan not found');
    }

    const updated = await this.prisma.commissionPlan.update({
      where: { id },
      data: dto,
      include: {
        tiers: {
          orderBy: { tierNumber: 'asc' },
        },
      },
    });
    return toPlain(updated);
  }

  async remove(tenantId: string, id: string) {
    const plan = await this.prisma.commissionPlan.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }

    return this.prisma.commissionPlan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getActive(tenantId: string) {
    const now = new Date();
    const plans = await this.prisma.commissionPlan.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        effectiveDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        tiers: {
          orderBy: { tierNumber: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return plans.map((p) => toPlain(p));
  }
}
