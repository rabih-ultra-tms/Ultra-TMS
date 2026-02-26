import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreatePaymentReceivedDto, ApplyPaymentDto } from '../dto';
import { BatchPaymentDto } from '../dto/batch-payment.dto';

@Injectable()
export class PaymentsReceivedService {
  constructor(private prisma: PrismaService) {}

  private async generatePaymentNumber(tenantId: string): Promise<string> {
    const lastPayment = await this.prisma.paymentReceived.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { paymentNumber: true },
    });

    if (!lastPayment) {
      return 'PMT-000001';
    }

    const lastNumber = parseInt(lastPayment.paymentNumber.replace('PMT-', ''), 10);
    return `PMT-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreatePaymentReceivedDto) {
    const paymentNumber = await this.generatePaymentNumber(tenantId);

    return this.prisma.paymentReceived.create({
      data: {
        tenantId,
        paymentNumber,
        companyId: data.companyId,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        unappliedAmount: data.unappliedAmount ?? data.amount,
        currency: data.currency ?? 'USD',
        referenceNumber: data.referenceNumber,
        bankAccountId: data.bankAccountId,
        depositDate: data.depositDate ? new Date(data.depositDate) : undefined,
        status: data.status ?? 'RECEIVED',
        notes: data.notes,
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: string;
      companyId?: string;
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
      ...(options?.companyId && { companyId: options.companyId }),
      ...(options?.fromDate &&
        options?.toDate && {
          paymentDate: { gte: options.fromDate, lte: options.toDate },
        }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.paymentReceived.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.paymentReceived.count({ where }),
    ]);

    return { data: payments, total, page, limit };
  }

  async findOne(id: string, tenantId: string) {
    const payment = await this.prisma.paymentReceived.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        bankAccount: { select: { id: true, accountNumber: true, accountName: true } },
        applications: {
          include: {
            invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async applyToInvoice(
    paymentId: string,
    tenantId: string,
    userId: string,
    applications: ApplyPaymentDto[],
  ) {
    const payment = await this.prisma.paymentReceived.findFirst({
      where: { id: paymentId, tenantId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const totalToApply = applications.reduce((sum, app) => sum + app.amount, 0);
    const unapplied = Number(payment.unappliedAmount);

    if (totalToApply > unapplied) {
      throw new BadRequestException(
        `Cannot apply more than the unapplied amount (${unapplied})`,
      );
    }

    // Apply in a transaction
    return this.prisma.$transaction(async (tx) => {
      for (const application of applications) {
        const invoice = await tx.invoice.findFirst({
          where: { id: application.invoiceId, tenantId },
        });

        if (!invoice) {
          throw new NotFoundException(`Invoice ${application.invoiceId} not found`);
        }

        if (application.amount > Number(invoice.balanceDue)) {
          throw new BadRequestException(
            `Amount exceeds invoice balance due (${invoice.balanceDue})`,
          );
        }

        // Create application record
        await tx.paymentApplication.create({
          data: {
            tenantId,
            paymentId,
            invoiceId: application.invoiceId,
            amount: application.amount,
            createdById: userId,
          },
        });

        // Update invoice
        const newAmountPaid = Number(invoice.amountPaid) + application.amount;
        const newBalanceDue = Number(invoice.totalAmount) - newAmountPaid;
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIAL';

        await tx.invoice.update({
          where: { id: application.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            balanceDue: newBalanceDue,
            status: newStatus,
          },
        });
      }

      // Update payment unapplied amount
      const newUnapplied = unapplied - totalToApply;
      const newStatus = newUnapplied <= 0 ? 'APPLIED' : 'PARTIAL';

      return tx.paymentReceived.update({
        where: { id: paymentId },
        data: {
          unappliedAmount: newUnapplied,
          status: newStatus,
        },
        include: {
          company: { select: { id: true, name: true } },
          applications: {
            include: {
              invoice: { select: { id: true, invoiceNumber: true } },
            },
          },
        },
      });
    });
  }

  async markBounced(id: string, tenantId: string) {
    const payment = await this.prisma.paymentReceived.findFirst({
      where: { id, tenantId },
      include: { applications: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Reverse all applications in a transaction
    return this.prisma.$transaction(async (tx) => {
      for (const application of payment.applications) {
        const invoice = await tx.invoice.findUnique({
          where: { id: application.invoiceId },
        });

        if (invoice) {
          const newAmountPaid = Number(invoice.amountPaid) - Number(application.amount);
          const newBalanceDue = Number(invoice.totalAmount) - newAmountPaid;

          await tx.invoice.update({
            where: { id: application.invoiceId },
            data: {
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: newBalanceDue > 0 ? 'PARTIAL' : 'SENT',
            },
          });
        }

        await tx.paymentApplication.delete({
          where: { id: application.id },
        });
      }

      return tx.paymentReceived.update({
        where: { id },
        data: {
          status: 'BOUNCED',
          unappliedAmount: 0,
        },
      });
    });
  }

  async processBatch(
    tenantId: string,
    dto: BatchPaymentDto,
    userId: string,
  ): Promise<{ processed: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let processed = 0;
    let failed = 0;

    for (const paymentItem of dto.payments) {
      try {
        const paymentNumber = await this.generatePaymentNumber(tenantId);

        const payment = await this.prisma.paymentReceived.create({
          data: {
            tenantId,
            paymentNumber,
            companyId: paymentItem.companyId,
            paymentDate: paymentItem.paymentDate
              ? new Date(paymentItem.paymentDate)
              : new Date(),
            paymentMethod: dto.paymentMethod || 'CHECK',
            amount: paymentItem.amount,
            unappliedAmount: paymentItem.amount,
            currency: 'USD',
            referenceNumber: paymentItem.referenceNumber,
            notes: paymentItem.checkNumber,
            createdById: userId,
          },
        });

        if (paymentItem.allocations?.length) {
          for (const allocation of paymentItem.allocations) {
            const invoice = await this.prisma.invoice.findFirst({
              where: { id: allocation.invoiceId, tenantId },
            });

            if (!invoice) {
              throw new NotFoundException(`Invoice ${allocation.invoiceId} not found`);
            }

            await this.prisma.paymentApplication.create({
              data: {
                tenantId,
                paymentId: payment.id,
                invoiceId: allocation.invoiceId,
                amount: allocation.amount,
                createdById: userId,
              },
            });

            const newAmountPaid = Number(invoice.amountPaid) + allocation.amount;
            const newBalanceDue = Number(invoice.totalAmount) - newAmountPaid;
            const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIAL';

            await this.prisma.invoice.update({
              where: { id: allocation.invoiceId },
              data: {
                amountPaid: newAmountPaid,
                balanceDue: newBalanceDue,
                status: newStatus,
              },
            });
          }

          await this.prisma.paymentReceived.update({
            where: { id: payment.id },
            data: { unappliedAmount: 0, status: 'APPLIED' },
          });
        }

        results.push({ companyId: paymentItem.companyId, paymentId: payment.id, status: 'success' });
        processed++;
      } catch (error: any) {
        results.push({ companyId: paymentItem.companyId, status: 'failed', error: error.message });
        failed++;
      }
    }

    return { processed, failed, results };
  }
}
