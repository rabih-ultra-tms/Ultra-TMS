import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreatePaymentPlanDto } from '../dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from '../dto/update-payment-plan.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { CancelPaymentPlanDto } from '../dto/cancel-payment-plan.dto';
import { PaymentPlanStatus, PaymentFrequency } from '../dto/enums';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class PaymentPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(tenantId: string, query: PaginationDto & { status?: PaymentPlanStatus }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentPlanWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.paymentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.paymentPlan.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async detail(tenantId: string, id: string) {
    return this.requirePlan(tenantId, id);
  }

  async create(tenantId: string, userId: string, dto: CreatePaymentPlanDto) {
    await this.requireCompany(tenantId, dto.companyId);
    const invoiceIds = dto.invoices.map((i) => i.invoiceId);
    const invoices = await this.prisma.invoice.findMany({ where: { id: { in: invoiceIds }, tenantId, deletedAt: null } });

    if (invoices.length !== invoiceIds.length) {
      throw new BadRequestException('One or more invoices not found for this tenant');
    }

    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue ?? inv.totalAmount ?? 0), 0);
    if (dto.downPayment > totalAmount) {
      throw new BadRequestException('Down payment exceeds total amount');
    }
    if (totalAmount > 0 && dto.downPayment / totalAmount < 0.2) {
      throw new BadRequestException('Down payment must be at least 20%');
    }
    if (dto.installmentCount > 12) {
      throw new BadRequestException('Maximum term is 12 installments');
    }

    const remainingBalance = totalAmount - dto.downPayment;
    const installmentAmount = dto.installmentCount > 0 ? remainingBalance / dto.installmentCount : 0;

    const planNumber = await this.generatePlanNumber(tenantId);

    const created = await this.prisma.paymentPlan.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        customerId: dto.companyId,
        planNumber,
        totalAmount,
        amountPaid: dto.downPayment,
        remainingBalance,
        installmentAmount,
        installmentCount: dto.installmentCount,
        installmentsPaid: 0,
        status: PaymentPlanStatus.ACTIVE,
        firstPaymentDate: new Date(dto.firstPaymentDate),
        frequency: dto.frequency ?? PaymentFrequency.MONTHLY,
        nextPaymentDate: new Date(dto.firstPaymentDate),
        interestRate: dto.interestRate,
        lateFeePct: dto.lateFeePct,
        lateFeeFixed: dto.lateFeeFixed,
        invoiceIds,
        notes: dto.notes,
        createdById: userId,
        approvedById: userId,
        approvedAt: new Date(),
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('payment.plan.created', {
      planId: created.id,
      companyId: dto.companyId,
      tenantId,
    });

    return created;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdatePaymentPlanDto) {
    const plan = await this.requirePlan(tenantId, id);

    let invoiceIds = plan.invoiceIds as string[] | null;
    let totalAmount = Number(plan.totalAmount);
    if (dto.invoices) {
      invoiceIds = dto.invoices.map((i) => i.invoiceId);
      const invoices = await this.prisma.invoice.findMany({ where: { id: { in: invoiceIds }, tenantId, deletedAt: null } });
      if (invoices.length !== invoiceIds.length) {
        throw new BadRequestException('One or more invoices not found for this tenant');
      }
      totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue ?? inv.totalAmount ?? 0), 0);
    }

    const installmentCount = dto.installmentCount ?? plan.installmentCount;
    if (installmentCount > 12) {
      throw new BadRequestException('Maximum term is 12 installments');
    }

    const downPayment = dto.downPayment ?? Number(plan.amountPaid ?? 0);
    const remainingBalance = totalAmount - downPayment;
    const installmentAmount = installmentCount > 0 ? remainingBalance / installmentCount : Number(plan.installmentAmount);

    return this.prisma.paymentPlan.update({
      where: { id },
      data: {
        companyId: dto.companyId ?? plan.companyId,
        customerId: dto.companyId ?? plan.customerId,
        totalAmount,
        amountPaid: downPayment,
        remainingBalance,
        installmentAmount,
        installmentCount,
        frequency: dto.frequency ?? (plan.frequency as PaymentFrequency),
        firstPaymentDate: dto.firstPaymentDate ? new Date(dto.firstPaymentDate) : plan.firstPaymentDate,
        nextPaymentDate: dto.firstPaymentDate ? new Date(dto.firstPaymentDate) : plan.nextPaymentDate,
        interestRate: dto.interestRate ?? plan.interestRate,
        lateFeePct: dto.lateFeePct ?? plan.lateFeePct,
        lateFeeFixed: dto.lateFeeFixed ?? plan.lateFeeFixed,
        invoiceIds: invoiceIds ?? plan.invoiceIds,
        notes: dto.notes ?? plan.notes,
        updatedById: userId,
      },
    });
  }

  async recordPayment(tenantId: string, userId: string, id: string, dto: RecordPaymentDto) {
    const plan = await this.requirePlan(tenantId, id);

    const amountPaid = Number(plan.amountPaid) + dto.amount;
    const remainingBalance = Math.max(0, Number(plan.remainingBalance) - dto.amount);
    const installmentAmount = Number(plan.installmentAmount) || 0;
    const newlyCompleted = installmentAmount > 0 ? Math.floor(dto.amount / installmentAmount) : 0;
    const installmentsPaid = (plan.installmentsPaid ?? 0) + newlyCompleted;

    const status = remainingBalance <= 0 ? PaymentPlanStatus.COMPLETED : plan.status;

    return this.prisma.paymentPlan.update({
      where: { id },
      data: {
        amountPaid,
        remainingBalance,
        installmentsPaid,
        status,
        nextPaymentDate: status === PaymentPlanStatus.COMPLETED ? null : plan.nextPaymentDate,
        updatedById: userId,
      },
    });
  }

  async cancel(tenantId: string, userId: string, id: string, dto: CancelPaymentPlanDto) {
    await this.requirePlan(tenantId, id);
    return this.prisma.paymentPlan.update({
      where: { id },
      data: {
        status: PaymentPlanStatus.CANCELLED,
        cancellationReason: dto.reason,
        cancelledAt: new Date(),
        updatedById: userId,
      },
    });
  }

  private async requirePlan(tenantId: string, id: string) {
    const plan = await this.prisma.paymentPlan.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!plan) {
      throw new NotFoundException('Payment plan not found');
    }
    return plan;
  }

  private async requireCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Company not found for this tenant');
    }
    return company;
  }

  private async generatePlanNumber(tenantId: string, attempt = 0): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomPart = Math.floor(Math.random() * 10_000)
      .toString()
      .padStart(4, '0');
    const planNumber = `PP-${datePart}-${randomPart}`;

    const existing = await this.prisma.paymentPlan.count({ where: { tenantId, planNumber } });
    if (existing === 0) {
      return planNumber;
    }

    if (attempt > 3) {
      throw new BadRequestException('Unable to generate unique payment plan number');
    }

    return this.generatePlanNumber(tenantId, attempt + 1);
  }
}
