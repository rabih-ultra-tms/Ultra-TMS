import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, QuoteRequestStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  AcceptQuoteDto,
  DeclineQuoteDto,
  EstimateQuoteDto,
  RevisionRequestDto,
  SubmitQuoteRequestDto,
} from './dto/submit-quote-request.dto';

@Injectable()
export class PortalQuotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async nextRequestNumber(tenantId: string) {
    const count = await this.prisma.quoteRequest.count({ where: { tenantId } });
    const sequence = String(count + 1).padStart(4, '0');
    const now = new Date();
    const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `QR-${yyyymm}-${sequence}`;
  }

  async list(tenantId: string, companyId: string, userId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { tenantId, companyId, userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detail(tenantId: string, id: string) {
    const quote = await this.prisma.quoteRequest.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { quote: true },
    });
    if (!quote) {
      throw new NotFoundException('Quote request not found');
    }
    return quote;
  }

  async submit(tenantId: string, companyId: string, userId: string, dto: SubmitQuoteRequestDto) {
    const requestNumber = await this.nextRequestNumber(tenantId);
    return this.prisma.quoteRequest.create({
      data: {
        tenantId,
        companyId,
        userId,
        requestNumber,
        originCity: dto.originCity,
        originState: dto.originState,
        originZip: dto.originZip,
        destCity: dto.destCity,
        destState: dto.destState,
        destZip: dto.destZip,
        pickupDate: new Date(dto.pickupDate),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        equipmentType: dto.equipmentType,
        commodity: dto.commodity,
        weightLbs: dto.weightLbs as unknown as Prisma.Decimal,
        palletCount: dto.pallets,
        isHazmat: dto.isHazmat ?? false,
        status: QuoteRequestStatus.SUBMITTED,
        customFields: dto.requestedAccessorials?.length
          ? ({ accessorials: dto.requestedAccessorials, specialInstructions: dto.specialInstructions } as Prisma.InputJsonValue)
          : (dto.specialInstructions ? ({ specialInstructions: dto.specialInstructions } as Prisma.InputJsonValue) : Prisma.JsonNull),
      },
    });
  }

  async accept(tenantId: string, id: string, dto: AcceptQuoteDto) {
    const quote = await this.requireQuote(tenantId, id);
    if (quote.status !== QuoteRequestStatus.QUOTED && quote.status !== QuoteRequestStatus.SUBMITTED) {
      throw new BadRequestException('Quote cannot be accepted in current state');
    }

    const customFields = ((quote.customFields as Prisma.JsonObject) ?? {}) as Record<string, unknown>;
    if (dto.notes) customFields.responseNotes = dto.notes;

    return this.prisma.quoteRequest.update({
      where: { id },
      data: {
        status: QuoteRequestStatus.ACCEPTED,
        acceptedAt: new Date(),
        customFields: Object.keys(customFields).length ? (customFields as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  }

  async decline(tenantId: string, id: string, dto: DeclineQuoteDto) {
    await this.requireQuote(tenantId, id);
    return this.prisma.quoteRequest.update({
      where: { id },
      data: { status: QuoteRequestStatus.DECLINED, declinedAt: new Date(), declineReason: dto.reason },
    });
  }

  async revision(tenantId: string, id: string, dto: RevisionRequestDto) {
    const quote = await this.requireQuote(tenantId, id);
    const customFields = ((quote.customFields as Prisma.JsonObject) ?? {}) as Record<string, unknown>;
    const revisions = (customFields.revisions as any[]) ?? [];
    revisions.push({ requestedAt: new Date().toISOString(), request: dto.request });

    return this.prisma.quoteRequest.update({
      where: { id },
      data: {
        status: QuoteRequestStatus.REVIEWING,
        customFields: { ...customFields, revisions } as Prisma.InputJsonValue,
      },
    });
  }

  async estimate(tenantId: string, companyId: string, userId: string, dto: EstimateQuoteDto) {
    const miles = dto.miles ?? Math.floor(Math.random() * 900 + 100);
    const ratePerMile = 2.25;
    const estimatedRate = miles * ratePerMile;

    return {
      tenantId,
      companyId,
      userId,
      originCity: dto.originCity,
      destCity: dto.destCity,
      miles,
      equipmentType: dto.equipmentType ?? 'DRY_VAN',
      estimatedRate,
    };
  }

  private async requireQuote(tenantId: string, id: string) {
    const quote = await this.prisma.quoteRequest.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!quote) {
      throw new NotFoundException('Quote request not found');
    }
    return quote;
  }
}