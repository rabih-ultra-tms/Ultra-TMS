import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateCommissionEntryDto,
  ApproveCommissionDto,
  ReverseCommissionDto,
} from '../dto';

@Injectable()
export class CommissionEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateCommissionEntryDto,
    userId?: string
  ) {
    return this.prisma.commissionEntry.create({
      data: {
        tenantId,
        userId: dto.userId,
        loadId: dto.loadId,
        orderId: dto.orderId,
        entryType: dto.entryType,
        planId: dto.planId,
        calculationBasis: dto.calculationBasis,
        basisAmount: dto.basisAmount,
        rateApplied: dto.rateApplied,
        commissionAmount: dto.commissionAmount,
        isSplit: dto.isSplit || false,
        splitPercent: dto.splitPercent || 100,
        parentEntryId: dto.parentEntryId,
        commissionPeriod: new Date(dto.commissionPeriod),
        notes: dto.notes,
        createdById: userId,
      },
      include: {
        user: true,
        load: true,
        order: true,
        plan: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    userId?: string,
    status?: string,
    period?: string
  ) {
    const where: any = { tenantId };

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (period) {
      const periodDate = new Date(period);
      where.commissionPeriod = periodDate;
    }

    return this.prisma.commissionEntry.findMany({
      where,
      include: {
        user: true,
        load: true,
        order: true,
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const entry = await this.prisma.commissionEntry.findFirst({
      where: { id, tenantId },
      include: {
        user: true,
        load: true,
        order: true,
        plan: true,
        parentEntry: true,
        splitEntries: true,
      },
    });

    if (!entry) {
      throw new NotFoundException('Commission entry not found');
    }

    return entry;
  }

  async approve(
    tenantId: string,
    id: string,
    _dto: ApproveCommissionDto,
    _userId?: string
  ) {
    const entry = await this.prisma.commissionEntry.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('Commission entry not found');
    }

    if (entry.status !== 'PENDING') {
      throw new BadRequestException('Can only approve pending entries');
    }

    return this.prisma.commissionEntry.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }

  async reverse(
    tenantId: string,
    id: string,
    dto: ReverseCommissionDto,
    userId?: string
  ) {
    const entry = await this.prisma.commissionEntry.findFirst({
      where: { id, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('Commission entry not found');
    }

    if (entry.status === 'REVERSED') {
      throw new BadRequestException('Entry already reversed');
    }

    return this.prisma.commissionEntry.update({
      where: { id },
      data: {
        status: 'REVERSED',
        reversedAt: new Date(),
        reversedBy: userId,
        reversalReason: dto.reversalReason,
      },
    });
  }

  async getUserEarnings(
    tenantId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ) {
    const entries = await this.prisma.commissionEntry.findMany({
      where: {
        tenantId,
        userId,
        commissionPeriod: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: { in: ['APPROVED', 'PAID'] },
      },
    });

    const totalEarnings = entries.reduce((sum, entry) => {
      return sum + Number(entry.commissionAmount);
    }, 0);

    return {
      userId,
      periodStart,
      periodEnd,
      entryCount: entries.length,
      totalEarnings,
      entries,
    };
  }

  async calculateLoadCommission(
    tenantId: string,
    loadId: string,
    userId?: string
  ) {
    // Get load with order details
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
      include: {
        order: {
          include: {
            salesRep: true,
          },
        },
      },
    });

    if (!load || !load.order) {
      throw new NotFoundException('Load or order not found');
    }

    const salesRep = load.order.salesRep;
    if (!salesRep) {
      throw new BadRequestException('No sales rep assigned to order');
    }

    // Get active commission assignment for the sales rep
    const assignment = await this.prisma.userCommissionAssignment.findFirst({
      where: {
        tenantId,
        userId: salesRep.id,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    if (!assignment) {
      throw new BadRequestException('No commission plan assigned to sales rep');
    }

    const plan = assignment.plan;

    // Calculate commission based on plan type
    const revenue = Number(load.order.totalCharges || 0);
    const cost = Number(load.totalCost || 0);
    const margin = revenue - cost;

    let commissionAmount = 0;

    if (plan.planType === 'FLAT_FEE') {
      commissionAmount = Number(plan.flatAmount || 0);
    } else if (plan.planType === 'PERCENT_REVENUE') {
      const rate =
        Number(assignment.overrideRate || plan.percentRate || 0) / 100;
      commissionAmount = revenue * rate;
    } else if (plan.planType === 'PERCENT_MARGIN') {
      const rate =
        Number(assignment.overrideRate || plan.percentRate || 0) / 100;
      commissionAmount = margin * rate;
    }

    // Check minimum margin requirement
    if (plan.minimumMarginPercent && revenue > 0) {
      const marginPercent = (margin / revenue) * 100;
      if (marginPercent < Number(plan.minimumMarginPercent)) {
        return {
          eligible: false,
          reason: 'Below minimum margin requirement',
          marginPercent,
          minimumRequired: Number(plan.minimumMarginPercent),
        };
      }
    }

    // Get current period (first day of month)
    const now = new Date();
    const periodDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // Create commission entry
    const entry = await this.create(
      tenantId,
      {
        userId: salesRep.id,
        loadId,
        orderId: load.orderId ?? undefined,
        entryType: 'LOAD_COMMISSION' as any,
        planId: plan.id,
        calculationBasis: plan.calculationBasis || 'NET_MARGIN',
        basisAmount: margin,
        rateApplied: Number(assignment.overrideRate || plan.percentRate || 0),
        commissionAmount,
        commissionPeriod: periodDate.toISOString(),
        notes: `Auto-calculated for load ${load.loadNumber}`,
      },
      userId
    );

    return {
      eligible: true,
      entry,
      calculation: {
        revenue,
        cost,
        margin,
        rate: Number(assignment.overrideRate || plan.percentRate || 0),
        commissionAmount,
      },
    };
  }
}
