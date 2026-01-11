import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { FactoredPaymentStatus } from '../dto/enums';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { ProcessFactoredPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class FactoredPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: PaymentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.FactoredPaymentWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.factoringCompanyId ? { factoringCompanyId: query.factoringCompanyId } : {}),
      ...(query.settlementId ? { settlementId: query.settlementId } : {}),
      ...(query.carrierId ? { settlement: { carrierId: query.carrierId } } : {}),
      ...(query.fromDate || query.toDate
        ? {
            paymentDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
      ...(query.status
        ? {
            customFields: {
              path: ['status'],
              equals: query.status,
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.factoredPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: { settlement: true, factoringCompany: true },
      }),
      this.prisma.factoredPayment.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.requirePayment(tenantId, id);
  }

  async processPayment(tenantId: string, userId: string, id: string, dto: ProcessFactoredPaymentDto) {
    const payment = await this.requirePayment(tenantId, id);

    const customFields = (payment.customFields as Record<string, unknown>) || {};
    const nextStatus = dto.status ?? FactoredPaymentStatus.PAID;

    const updated = await this.prisma.factoredPayment.update({
      where: { id },
      data: {
        paymentAmount: dto.paymentAmount ?? payment.paymentAmount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : payment.paymentDate ?? new Date(),
        paymentMethod: dto.paymentMethod ?? payment.paymentMethod,
        verificationCode: dto.verificationCode ?? payment.verificationCode,
        notes: dto.notes ?? payment.notes,
        updatedById: userId,
        customFields: { ...customFields, status: nextStatus } as Prisma.InputJsonValue,
      },
    });

    this.eventEmitter.emit('factored.payment.processed', { paymentId: id, amount: updated.paymentAmount, tenantId });
    return updated;
  }

  async listCarrierPayments(tenantId: string, carrierId: string) {
    return this.prisma.factoredPayment.findMany({
      where: { tenantId, deletedAt: null, settlement: { carrierId } },
      orderBy: { paymentDate: 'desc' },
      include: { settlement: true, factoringCompany: true },
    });
  }

  async listCompanyPayments(tenantId: string, factoringCompanyId: string) {
    return this.prisma.factoredPayment.findMany({
      where: { tenantId, deletedAt: null, factoringCompanyId },
      orderBy: { paymentDate: 'desc' },
      include: { settlement: true },
    });
  }

  private async requirePayment(tenantId: string, id: string) {
    const payment = await this.prisma.factoredPayment.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!payment) {
      throw new NotFoundException('Factored payment not found');
    }
    return payment;
  }
}
