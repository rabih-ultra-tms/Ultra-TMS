import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateCommissionPlanDto, UpdateCommissionPlanDto } from '../dto';

@Injectable()
export class CommissionPlansService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateCommissionPlanDto,
    userId?: string
  ) {
    return this.prisma.commissionPlan.create({
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
  }

  async findAll(tenantId: string, status?: string) {
    return this.prisma.commissionPlan.findMany({
      where: {
        tenantId,
        status: status || undefined,
        deletedAt: null,
      },
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
      orderBy: { effectiveDate: 'desc' },
    });
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

    return plan;
  }

  async update(tenantId: string, id: string, dto: UpdateCommissionPlanDto) {
    const plan = await this.prisma.commissionPlan.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!plan) {
      throw new NotFoundException('Commission plan not found');
    }

    return this.prisma.commissionPlan.update({
      where: { id },
      data: dto,
      include: {
        tiers: {
          orderBy: { tierNumber: 'asc' },
        },
      },
    });
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
    return this.prisma.commissionPlan.findMany({
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
  }
}
