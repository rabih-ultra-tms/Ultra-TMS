import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PortalPaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { InvoicePaymentDto, MakePaymentDto } from './dto/make-payment.dto';

@Injectable()
export class PortalPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async makePayment(tenantId: string, companyId: string, portalUserId: string, dto: MakePaymentDto) {
    if (!dto.invoices?.length) {
      throw new BadRequestException('Invoices are required');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId, companyId, id: { in: dto.invoices.map((i) => i.invoiceId) } },
    });

    if (invoices.length !== dto.invoices.length) {
      throw new NotFoundException('One or more invoices not found');
    }

    const paymentNumber = await this.nextPaymentNumber(tenantId);

    const payment = await this.prisma.portalPayment.create({
      data: {
        tenantId,
        companyId,
        userId: portalUserId,
        paymentNumber,
        amount: dto.amount,
        currency: 'USD',
        status: PortalPaymentStatus.COMPLETED,
        paymentMethod: dto.paymentMethod,
        invoiceIds: dto.invoices.map((i) => i.invoiceId),
        processorResponse: { paymentToken: dto.paymentToken, savedPaymentMethodId: dto.savedPaymentMethodId },
        processedAt: new Date(),
      },
    });

    await this.applyPayments(tenantId, dto.invoices);

    if (dto.savePaymentMethod) {
      await this.prisma.portalSavedPaymentMethod.create({
        data: {
          tenantId,
          portalUserId,
          paymentMethodType: dto.paymentMethod,
          lastFourDigits: dto.paymentToken?.slice(-4),
          externalToken: dto.paymentToken,
          isDefault: true,
        },
      });
    }

    await this.prisma.portalActivityLog.create({
      data: {
        tenantId,
        userId: portalUserId,
        companyId,
        action: 'PORTAL_PAYMENT',
        entityType: 'INVOICE',
        entityId: dto.invoices[0].invoiceId,
        description: `Payment ${payment.paymentNumber} processed`,
      },
    });

    return payment;
  }

  async history(tenantId: string, companyId: string) {
    return this.prisma.portalPayment.findMany({
      where: { tenantId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(tenantId: string, companyId: string, id: string) {
    const payment = await this.prisma.portalPayment.findFirst({ where: { id, tenantId, companyId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  private async applyPayments(tenantId: string, invoices: InvoicePaymentDto[]) {
    for (const inv of invoices) {
      const invoice = await this.prisma.invoice.findFirst({ where: { tenantId, id: inv.invoiceId } });
      if (!invoice) continue;
      const newPaid = Number(invoice.amountPaid) + inv.amount;
      const newBalance = Math.max(0, Number(invoice.totalAmount) - newPaid);
      await this.prisma.invoice.update({
        where: { id: inv.invoiceId },
        data: { amountPaid: newPaid, balanceDue: newBalance, status: newBalance === 0 ? 'PAID' : 'PARTIAL' },
      });
    }
  }

  private async nextPaymentNumber(tenantId: string) {
    const count = await this.prisma.portalPayment.count({ where: { tenantId } });
    return `PAY-${String(count + 1).padStart(5, '0')}`;
  }
}