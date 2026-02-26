import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateSettlementDto, PaymentType, SettlementLineItemType } from '../dto';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  private async generateSettlementNumber(tenantId: string): Promise<string> {
    const lastSettlement = await this.prisma.settlement.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { settlementNumber: true },
    });

    if (!lastSettlement) {
      return 'SET-000001';
    }

    const lastNumber = parseInt(lastSettlement.settlementNumber.replace('SET-', ''), 10);
    return `SET-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreateSettlementDto) {
    const settlementNumber = await this.generateSettlementNumber(tenantId);

    return this.prisma.settlement.create({
      data: {
        tenantId,
        settlementNumber,
        carrierId: data.carrierId,
        settlementDate: new Date(data.settlementDate),
        dueDate: new Date(data.dueDate),
        paymentType: data.paymentType,
        quickPayFeePercent: data.quickPayFeePercent,
        quickPayFeeAmount: data.quickPayFeeAmount,
        grossAmount: data.grossAmount,
        deductionsTotal: data.deductionsTotal ?? 0,
        quickPayFee: data.quickPayFee ?? 0,
        netAmount: data.netAmount,
        amountPaid: 0,
        balanceDue: data.balanceDue,
        currency: data.currency ?? 'USD',
        status: data.status ?? 'DRAFT',
        paymentMethod: data.paymentMethod,
        payToName: data.payToName,
        payToFactoring: data.payToFactoring ?? false,
        factoringCompanyId: data.factoringCompanyId,
        factoringAccount: data.factoringAccount,
        expenseAccountId: data.expenseAccountId,
        apAccountId: data.apAccountId,
        notes: data.notes,
        internalNotes: data.internalNotes,
        createdById: userId,
        lineItems: data.lineItems
          ? {
              create: data.lineItems.map((item) => ({
                tenantId,
                lineNumber: item.lineNumber,
                description: item.description,
                itemType: item.itemType,
                loadId: item.loadId,
                quantity: item.quantity ?? 1,
                unitRate: item.unitRate,
                amount: item.amount,
                expenseAccountId: item.expenseAccountId,
              })),
            }
          : undefined,
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
        lineItems: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: string;
      carrierId?: string;
      fromDate?: Date;
      toDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      ...(options?.status && { status: options.status }),
      ...(options?.carrierId && { carrierId: options.carrierId }),
      ...(options?.fromDate &&
        options?.toDate && {
          settlementDate: { gte: options.fromDate, lte: options.toDate },
        }),
    };

    const [settlements, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: {
          carrier: { select: { id: true, legalName: true } },
        },
        orderBy: { settlementDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.settlement.count({ where }),
    ]);

    return { data: settlements, total, page, limit };
  }

  async findOne(id: string, tenantId: string) {
    const settlement = await this.prisma.settlement.findFirst({
      where: { id, tenantId },
      include: {
        carrier: true,
        lineItems: {
          orderBy: { lineNumber: 'asc' },
          include: {
            load: { select: { id: true, loadNumber: true } },
          },
        },
      },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    return settlement;
  }

  async update(id: string, tenantId: string, userId: string, data: Partial<CreateSettlementDto>) {
    const settlement = await this.prisma.settlement.findFirst({
      where: { id, tenantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (settlement.status === 'VOID' || settlement.status === 'PAID') {
      throw new BadRequestException('Cannot update a paid or voided settlement');
    }

    return this.prisma.settlement.update({
      where: { id },
      data: {
        settlementDate: data.settlementDate ? new Date(data.settlementDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paymentType: data.paymentType,
        quickPayFeePercent: data.quickPayFeePercent,
        quickPayFeeAmount: data.quickPayFeeAmount,
        grossAmount: data.grossAmount,
        deductionsTotal: data.deductionsTotal,
        quickPayFee: data.quickPayFee,
        netAmount: data.netAmount,
        balanceDue: data.balanceDue,
        status: data.status,
        paymentMethod: data.paymentMethod,
        payToName: data.payToName,
        payToFactoring: data.payToFactoring,
        factoringCompanyId: data.factoringCompanyId,
        factoringAccount: data.factoringAccount,
        notes: data.notes,
        internalNotes: data.internalNotes,
        updatedById: userId,
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
        lineItems: true,
      },
    });
  }

  async approve(id: string, tenantId: string, userId: string) {
    const settlement = await this.prisma.settlement.findFirst({
      where: { id, tenantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (settlement.status !== 'PENDING') {
      throw new BadRequestException('Only pending settlements can be approved');
    }

    return this.prisma.settlement.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });
  }

  async voidSettlement(id: string, tenantId: string) {
    const settlement = await this.prisma.settlement.findFirst({
      where: { id, tenantId },
    });

    if (!settlement) {
      throw new NotFoundException('Settlement not found');
    }

    if (Number(settlement.amountPaid) > 0) {
      throw new BadRequestException('Cannot void a settlement with payments applied');
    }

    return this.prisma.settlement.update({
      where: { id },
      data: { status: 'VOID' },
    });
  }

  async getPayablesSummary(tenantId: string) {
    const settlements = await this.prisma.settlement.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'APPROVED', 'PARTIAL'] },
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
    });

    const now = new Date();
    const dueToday: typeof settlements = [];
    const overdue: typeof settlements = [];
    const upcoming: typeof settlements = [];

    settlements.forEach((settlement) => {
      const daysUntilDue = Math.floor(
        (settlement.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilDue < 0) {
        overdue.push(settlement);
      } else if (daysUntilDue === 0) {
        dueToday.push(settlement);
      } else {
        upcoming.push(settlement);
      }
    });

    return {
      dueToday,
      overdue,
      upcoming,
      totals: {
        dueToday: dueToday.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        overdue: overdue.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        upcoming: upcoming.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        total: settlements.reduce((sum, s) => sum + Number(s.balanceDue), 0),
      },
    };
  }

  async generateFromLoad(tenantId: string, userId: string, loadId: string) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
      include: {
        carrier: true,
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!load.carrier) {
      throw new BadRequestException('Load is not assigned to a carrier');
    }

    const carrierRate = Number(load.carrierRate ?? 0);
    const fuelAdvance = Number(load.fuelAdvance ?? 0);

    return this.create(tenantId, userId, {
      carrierId: load.carrierId!,
      settlementDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // NET30
      grossAmount: carrierRate,
      deductionsTotal: fuelAdvance,
      netAmount: carrierRate - fuelAdvance,
      balanceDue: carrierRate - fuelAdvance,
      paymentType: load.carrier.paymentTerms as PaymentType | undefined,
      payToName: load.carrier.legalName,
      payToFactoring: !!load.carrier.factoringCompany,
      lineItems: [
        {
          lineNumber: 1,
          description: `Freight charges for Load ${load.loadNumber}`,
          itemType: SettlementLineItemType.FREIGHT,
          loadId: load.id,
          quantity: 1,
          unitRate: carrierRate,
          amount: carrierRate,
        },
        ...(fuelAdvance > 0
          ? [
              {
                lineNumber: 2,
                description: 'Fuel advance deduction',
                itemType: SettlementLineItemType.DEDUCTION,
                loadId: load.id,
                quantity: 1,
                unitRate: -fuelAdvance,
                amount: -fuelAdvance,
              },
            ]
          : []),
      ],
    });
  }
}
