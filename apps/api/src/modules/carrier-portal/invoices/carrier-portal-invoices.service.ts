import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { SubmitInvoiceDto } from './dto/submit-invoice.dto';
import { RequestQuickPayDto } from './dto/request-quick-pay.dto';

@Injectable()
export class CarrierPortalInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async submitInvoice(tenantId: string, carrierId: string, userId: string, payload: SubmitInvoiceDto) {
    if (!payload.loadIds?.length) {
      throw new BadRequestException('At least one loadId is required');
    }

    const invoiceDate = new Date();
    const submissions = await Promise.all(
      payload.loadIds.map((loadId) =>
        this.prisma.carrierInvoiceSubmission.create({
          data: {
            tenantId,
            carrierId,
            userId,
            loadId,
            amount: payload.lineItems?.find((l) => l.loadId === loadId)?.total ?? payload.totalAmount,
            invoiceNumber: payload.carrierInvoiceNumber,
            invoiceDate,
            customFields: {
              lineItems: payload.lineItems,
              invoiceDocumentId: payload.invoiceDocumentId,
              carrierNotes: payload.carrierNotes,
            },
          },
        }),
      ),
    );

    return submissions;
  }

  listInvoices(tenantId: string, carrierId: string) {
    return this.prisma.carrierInvoiceSubmission.findMany({ where: { tenantId, carrierId } });
  }

  async invoiceDetail(tenantId: string, carrierId: string, id: string) {
    const invoice = await this.prisma.carrierInvoiceSubmission.findFirst({ where: { id, tenantId, carrierId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  settlements(tenantId: string, carrierId: string) {
    return this.prisma.settlement.findMany({ where: { tenantId, carrierId } });
  }

  async settlementDetail(tenantId: string, carrierId: string, id: string) {
    const settlement = await this.prisma.settlement.findFirst({ where: { id, tenantId, carrierId } });
    if (!settlement) throw new NotFoundException('Settlement not found');
    return settlement;
  }

  settlementPdf(tenantId: string, carrierId: string, id: string) {
    return { url: `/settlements/${id}.pdf`, tenantId, carrierId };
  }

  async quickPay(tenantId: string, carrierId: string, userId: string, settlementId: string, dto: RequestQuickPayDto) {
    if (!dto.acceptTerms) {
      throw new BadRequestException('Accept quick pay terms');
    }

    const feePercent = 2;
    const settlement = await this.settlementDetail(tenantId, carrierId, settlementId);
    if (Number(settlement.netAmount) < 100) {
      throw new BadRequestException('Settlement does not meet quick pay minimum');
    }

    const feeAmount = (Number(settlement.netAmount) * feePercent) / 100;
    const netAmount = Number(settlement.netAmount) - feeAmount;
    return this.prisma.carrierQuickPayRequest.create({
      data: {
        tenantId,
        carrierId,
        userId,
        loadId: '',
        requestedAmount: settlement.netAmount,
        feePercent,
        feeAmount,
        netAmount,
      },
    });
  }

  paymentHistory(tenantId: string, carrierId: string) {
    return this.prisma.carrierQuickPayRequest.findMany({ where: { tenantId, carrierId } });
  }
}