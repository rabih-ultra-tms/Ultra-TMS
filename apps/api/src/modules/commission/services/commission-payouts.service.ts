import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateCommissionPayoutDto,
  ApprovePayoutDto,
  ProcessPayoutDto,
} from '../dto';

@Injectable()
export class CommissionPayoutsService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateCommissionPayoutDto,
    userId?: string
  ) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);

    // Get approved commission entries for the period
    const entries = await this.prisma.commissionEntry.findMany({
      where: {
        tenantId,
        userId: dto.userId,
        status: 'APPROVED',
        payoutId: null,
        commissionPeriod: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    if (entries.length === 0) {
      throw new BadRequestException(
        'No approved commission entries found for period'
      );
    }

    // Calculate totals
    const grossCommission = entries.reduce((sum, entry) => {
      if (entry.entryType === 'DRAW_RECOVERY') {
        return sum;
      }
      return sum + Number(entry.commissionAmount);
    }, 0);

    const drawRecovery = entries.reduce((sum, entry) => {
      if (entry.entryType === 'DRAW_RECOVERY') {
        return sum + Math.abs(Number(entry.commissionAmount));
      }
      return sum;
    }, 0);

    const netPayout = grossCommission - drawRecovery;

    // Generate payout number
    const count = await this.prisma.commissionPayout.count({
      where: { tenantId },
    });
    const payoutNumber = `PAY-${String(count + 1).padStart(6, '0')}`;

    // Create payout
    const payout = await this.prisma.commissionPayout.create({
      data: {
        tenantId,
        payoutNumber,
        userId: dto.userId,
        periodStart,
        periodEnd,
        payoutDate: new Date(),
        grossCommission,
        drawRecovery,
        netPayout,
        notes: dto.notes,
        createdBy: userId,
      },
      include: {
        user: true,
      },
    });

    // Link entries to payout
    await this.prisma.commissionEntry.updateMany({
      where: {
        id: { in: entries.map((e) => e.id) },
      },
      data: {
        payoutId: payout.id,
      },
    });

    return payout;
  }

  async findAll(tenantId: string, userId?: string, status?: string) {
    const where: any = { tenantId };

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    return this.prisma.commissionPayout.findMany({
      where,
      include: {
        user: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const payout = await this.prisma.commissionPayout.findFirst({
      where: { id, tenantId },
      include: {
        user: true,
        entries: {
          include: {
            load: true,
            order: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundException('Commission payout not found');
    }

    return payout;
  }

  async approve(
    tenantId: string,
    id: string,
    _dto: ApprovePayoutDto,
    _userId?: string
  ) {
    const payout = await this.prisma.commissionPayout.findFirst({
      where: { id, tenantId },
    });

    if (!payout) {
      throw new NotFoundException('Commission payout not found');
    }

    if (payout.status !== 'PENDING') {
      throw new BadRequestException('Can only approve pending payouts');
    }

    return this.prisma.commissionPayout.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: _userId,
        approvedAt: new Date(),
      },
    });
  }

  async process(
    tenantId: string,
    id: string,
    dto: ProcessPayoutDto,
    _userId?: string
  ) {
    const payout = await this.prisma.commissionPayout.findFirst({
      where: { id, tenantId },
      include: { entries: true },
    });

    if (!payout) {
      throw new NotFoundException('Commission payout not found');
    }

    if (payout.status !== 'APPROVED') {
      throw new BadRequestException(
        'Payout must be approved before processing'
      );
    }

    // Update payout
    const updated = await this.prisma.commissionPayout.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentMethod: dto.paymentMethod,
        paymentReference: dto.paymentReference,
        paidAt: new Date(),
      },
    });

    // Mark all entries as paid
    await this.prisma.commissionEntry.updateMany({
      where: {
        payoutId: id,
      },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    return updated;
  }

  async void(tenantId: string, id: string, _userId?: string) {
    const payout = await this.prisma.commissionPayout.findFirst({
      where: { id, tenantId },
    });

    if (!payout) {
      throw new NotFoundException('Commission payout not found');
    }

    if (payout.status === 'PAID') {
      throw new BadRequestException('Cannot void a paid payout');
    }

    // Update payout
    const updated = await this.prisma.commissionPayout.update({
      where: { id },
      data: {
        status: 'VOID',
      },
    });

    // Unlink entries
    await this.prisma.commissionEntry.updateMany({
      where: {
        payoutId: id,
      },
      data: {
        payoutId: null,
      },
    });

    return updated;
  }
}
