import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreatePaymentMadeDto } from '../dto';

@Injectable()
export class PaymentsMadeService {
  constructor(private prisma: PrismaService) {}

  private async generatePaymentNumber(tenantId: string): Promise<string> {
    const lastPayment = await this.prisma.paymentMade.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { paymentNumber: true },
    });

    if (!lastPayment) {
      return 'PAY-000001';
    }

    const lastNumber = parseInt(lastPayment.paymentNumber.replace('PAY-', ''), 10);
    return `PAY-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreatePaymentMadeDto) {
    const paymentNumber = await this.generatePaymentNumber(tenantId);

    return this.prisma.paymentMade.create({
      data: {
        tenantId,
        paymentNumber,
        carrierId: data.carrierId,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        referenceNumber: data.referenceNumber,
        bankAccountId: data.bankAccountId,
        status: data.status ?? 'PENDING',
        achBatchId: data.achBatchId,
        achTraceNumber: data.achTraceNumber,
        notes: data.notes,
        createdById: userId,
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
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
      skip?: number;
      take?: number;
    },
  ) {
    const where = {
      tenantId,
      ...(options?.status && { status: options.status }),
      ...(options?.carrierId && { carrierId: options.carrierId }),
      ...(options?.fromDate &&
        options?.toDate && {
          paymentDate: { gte: options.fromDate, lte: options.toDate },
        }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.paymentMade.findMany({
        where,
        include: {
          carrier: { select: { id: true, legalName: true } },
        },
        orderBy: { paymentDate: 'desc' },
        skip: options?.skip,
        take: options?.take,
      }),
      this.prisma.paymentMade.count({ where }),
    ]);

    return { payments, total };
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.paymentMade.findFirst({
      where: { id, tenantId },
      include: {
        carrier: true,
        bankAccount: { select: { id: true, accountNumber: true, accountName: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, tenantId: string, data: Partial<CreatePaymentMadeDto>) {
    const payment = await this.prisma.paymentMade.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'CLEARED' || payment.status === 'VOID') {
      throw new BadRequestException('Cannot update a cleared or voided payment');
    }

    return this.prisma.paymentMade.update({
      where: { id },
      data: {
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        referenceNumber: data.referenceNumber,
        bankAccountId: data.bankAccountId,
        status: data.status,
        achBatchId: data.achBatchId,
        achTraceNumber: data.achTraceNumber,
        notes: data.notes,
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
    });
  }

  async markSent(id: string, tenantId: string) {
    const payment = await this.prisma.paymentMade.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.paymentMade.update({
      where: { id },
      data: { status: 'SENT' },
    });
  }

  async markCleared(id: string, tenantId: string) {
    const payment = await this.prisma.paymentMade.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.paymentMade.update({
      where: { id },
      data: { status: 'CLEARED' },
    });
  }

  async voidPayment(id: string, tenantId: string) {
    const payment = await this.prisma.paymentMade.findFirst({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'CLEARED') {
      throw new BadRequestException('Cannot void a cleared payment');
    }

    return this.prisma.paymentMade.update({
      where: { id },
      data: { status: 'VOID' },
    });
  }

  async getPaymentRunSummary(tenantId: string) {
    const approvedSettlements = await this.prisma.settlement.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
      },
      include: {
        carrier: {
          select: {
            id: true,
            legalName: true,
            paymentTerms: true,
            factoringCompany: true,
          },
        },
      },
    });

    const quickPaySettlements = approvedSettlements.filter(
      (s) => s.carrier?.paymentTerms === 'QUICK_PAY',
    );
    const factoringSettlements = approvedSettlements.filter(
      (s) => s.payToFactoring || s.carrier?.factoringCompany,
    );
    const regularSettlements = approvedSettlements.filter(
      (s) => !s.payToFactoring && s.carrier?.paymentTerms !== 'QUICK_PAY',
    );

    return {
      quickPay: {
        count: quickPaySettlements.length,
        total: quickPaySettlements.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        settlements: quickPaySettlements,
      },
      factoring: {
        count: factoringSettlements.length,
        total: factoringSettlements.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        settlements: factoringSettlements,
      },
      regular: {
        count: regularSettlements.length,
        total: regularSettlements.reduce((sum, s) => sum + Number(s.balanceDue), 0),
        settlements: regularSettlements,
      },
      grandTotal: approvedSettlements.reduce((sum, s) => sum + Number(s.balanceDue), 0),
    };
  }
}
