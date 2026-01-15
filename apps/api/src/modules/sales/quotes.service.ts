import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateQuoteDto, UpdateQuoteDto, QuickQuoteDto, CalculateRateDto } from './dto';
import { RateCalculationService } from './rate-calculation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class QuotesService {
  constructor(
    private prisma: PrismaService,
    private rateCalculationService: RateCalculationService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', ''); // YYYYMM
    
    // Get the last quote number for this tenant and period
    const lastQuote = await this.prisma.quote.findFirst({
      where: {
        tenantId,
        quoteNumber: {
          startsWith: `Q-${yearMonth}-`,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        quoteNumber: true,
      },
    });

    let sequence = 1;
    if (lastQuote) {
      const parts = lastQuote.quoteNumber.split('-');
      if (parts.length === 3 && parts[2]) {
        sequence = parseInt(parts[2], 10) + 1;
      }
    }

    return `Q-${yearMonth}-${sequence.toString().padStart(4, '0')}`;
  }

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
    companyId?: string;
    salesRepId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, companyId, salesRepId, search } = options || {};
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (salesRepId) where.salesRepId = salesRepId;
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          salesRep: { select: { id: true, firstName: true, lastName: true } },
          stops: { orderBy: { stopSequence: 'asc' } },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findOne(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        contact: true,
        salesRep: { select: { id: true, firstName: true, lastName: true, email: true } },
        stops: { orderBy: { stopSequence: 'asc' } },
        accessorials: true,
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async create(tenantId: string, userId: string, dto: CreateQuoteDto) {
    const { stops } = dto;

    // Calculate totals
    const linehaulRate = dto.linehaulRate || 0;
    const fuel = dto.fuelSurcharge || 0;
    const accessorialsTotal = dto.accessorialsTotal || 0;
    const totalAmount = dto.totalAmount || (linehaulRate + fuel + accessorialsTotal);

    const quote = await this.prisma.quote.create({
      data: {
        tenantId,
        quoteNumber: await this.generateQuoteNumber(tenantId),
        companyId: dto.companyId,
        contactId: dto.contactId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        serviceType: dto.serviceType,
        equipmentType: dto.equipmentType,
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
        pickupWindowStart: dto.pickupWindowStart,
        pickupWindowEnd: dto.pickupWindowEnd,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        deliveryWindowStart: dto.deliveryWindowStart,
        deliveryWindowEnd: dto.deliveryWindowEnd,
        commodity: dto.commodity,
        weightLbs: dto.weightLbs,
        pieces: dto.pieces,
        pallets: dto.pallets,
        totalMiles: dto.totalMiles,
        linehaulRate: linehaulRate,
        fuelSurcharge: fuel,
        accessorialsTotal: accessorialsTotal,
        totalAmount,
        marginPercent: dto.marginPercent,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        internalNotes: dto.internalNotes,
        customerNotes: dto.customerNotes,
        specialInstructions: dto.specialInstructions,
        status: 'DRAFT',
        salesRepId: userId,
        customFields: dto.customFields || {},
        createdById: userId,
        stops: stops
          ? {
              create: stops.map((stop) => ({
                tenantId,
                stopType: stop.stopType,
                stopSequence: stop.stopSequence,
                facilityName: stop.facilityName,
                addressLine1: stop.addressLine1,
                addressLine2: stop.addressLine2,
                city: stop.city,
                state: stop.state,
                postalCode: stop.postalCode,
                country: stop.country || 'USA',
                contactName: stop.contactName,
                contactPhone: stop.contactPhone,
              })),
            }
          : undefined,
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        company: { select: { id: true, name: true } },
      },
    });

    // Emit quote created event
    this.eventEmitter.emit('quote.created', { quote, tenantId, userId });

    return quote;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateQuoteDto) {
    await this.findOne(tenantId, id);

    // Recalculate totals if pricing changed
    let totalAmount: number | undefined;
    if (
      dto.linehaulRate !== undefined ||
      dto.fuelSurcharge !== undefined ||
      dto.accessorialsTotal !== undefined
    ) {
      const linehaulRate = dto.linehaulRate || 0;
      const fuel = dto.fuelSurcharge || 0;
      const accessorialsTotal = dto.accessorialsTotal || 0;
      totalAmount = dto.totalAmount || (linehaulRate + fuel + accessorialsTotal);
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        serviceType: dto.serviceType,
        equipmentType: dto.equipmentType,
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : undefined,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        commodity: dto.commodity,
        weightLbs: dto.weightLbs,
        pieces: dto.pieces,
        totalMiles: dto.totalMiles,
        linehaulRate: dto.linehaulRate,
        fuelSurcharge: dto.fuelSurcharge,
        accessorialsTotal: dto.accessorialsTotal,
        totalAmount,
        marginPercent: dto.marginPercent,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        internalNotes: dto.internalNotes,
        customerNotes: dto.customerNotes,
        status: dto.status,
        customFields: dto.customFields,
        updatedById: userId,
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        company: { select: { id: true, name: true } },
      },
    });
  }

  async delete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.quote.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async convertToOrder(tenantId: string, id: string, userId: string) {
    const quote = await this.findOne(tenantId, id);

    if (quote.status === 'CONVERTED') {
      throw new NotFoundException('Quote already converted');
    }

    // Create order from quote
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber: `ORD-${quote.quoteNumber}`,
        customerId: quote.companyId!,
        customerContactId: quote.contactId,
        quoteId: quote.id,
        status: 'PENDING',
        equipmentType: quote.equipmentType,
        weightLbs: quote.weightLbs,
        pieceCount: quote.pieces,
        commodity: quote.commodity,
        customerRate: quote.totalAmount,
        fuelSurcharge: quote.fuelSurcharge || 0,
        accessorialCharges: quote.accessorialsTotal || 0,
        totalCharges: quote.totalAmount,
        specialInstructions: quote.specialInstructions,
        salesRepId: quote.salesRepId,
        createdById: userId,
        stops: {
          create: quote.stops.map((stop) => ({
            tenantId,
            stopType: stop.stopType,
            stopSequence: stop.stopSequence,
            status: 'PENDING',
            facilityName: stop.facilityName,
            addressLine1: stop.addressLine1,
            addressLine2: stop.addressLine2 || '',
            city: stop.city,
            state: stop.state,
            postalCode: stop.postalCode,
            country: stop.country || 'USA',
            contactName: stop.contactName,
            contactPhone: stop.contactPhone,
          })),
        },
      },
    });

    // Update quote status
    await this.prisma.quote.update({
      where: { id },
      data: {
        status: 'CONVERTED',
        convertedOrderId: order.id,
        convertedAt: new Date(),
      },
    });

    // Emit quote converted event
    this.eventEmitter.emit('quote.converted', { quote, order, tenantId, userId });

    return order;
  }

  async duplicate(tenantId: string, id: string, userId: string) {
    const original = await this.findOne(tenantId, id);

    const newQuote = await this.prisma.quote.create({
      data: {
        tenantId,
        quoteNumber: await this.generateQuoteNumber(tenantId),
        companyId: original.companyId,
        contactId: original.contactId,
        customerName: original.customerName,
        customerEmail: original.customerEmail,
        customerPhone: original.customerPhone,
        serviceType: original.serviceType,
        equipmentType: original.equipmentType,
        pickupDate: original.pickupDate,
        pickupWindowStart: original.pickupWindowStart,
        pickupWindowEnd: original.pickupWindowEnd,
        deliveryDate: original.deliveryDate,
        deliveryWindowStart: original.deliveryWindowStart,
        deliveryWindowEnd: original.deliveryWindowEnd,
        commodity: original.commodity,
        weightLbs: original.weightLbs,
        pieces: original.pieces,
        pallets: original.pallets,
        totalMiles: original.totalMiles,
        linehaulRate: original.linehaulRate,
        fuelSurcharge: original.fuelSurcharge,
        accessorialsTotal: original.accessorialsTotal,
        totalAmount: original.totalAmount,
        marginPercent: original.marginPercent,
        internalNotes: original.internalNotes,
        customerNotes: original.customerNotes,
        specialInstructions: original.specialInstructions,
        status: 'DRAFT',
        salesRepId: userId,
        customFields: original.customFields || {},
        createdById: userId,
        stops: {
          create: original.stops.map((stop) => ({
            tenantId,
            stopType: stop.stopType,
            stopSequence: stop.stopSequence,
            facilityName: stop.facilityName,
            addressLine1: stop.addressLine1,
            addressLine2: stop.addressLine2,
            city: stop.city,
            state: stop.state,
            postalCode: stop.postalCode,
            country: stop.country || 'USA',
            contactName: stop.contactName,
            contactPhone: stop.contactPhone,
          })),
        },
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        company: { select: { id: true, name: true } },
      },
    });

    return newQuote;
  }

  async createNewVersion(tenantId: string, id: string, userId: string) {
    const original = await this.findOne(tenantId, id);

    const newVersion = await this.prisma.quote.create({
      data: {
        tenantId,
        quoteNumber: original.quoteNumber,
        version: (original.version || 1) + 1,
        parentQuoteId: original.parentQuoteId || original.id,
        companyId: original.companyId,
        contactId: original.contactId,
        customerName: original.customerName,
        customerEmail: original.customerEmail,
        customerPhone: original.customerPhone,
        serviceType: original.serviceType,
        equipmentType: original.equipmentType,
        pickupDate: original.pickupDate,
        pickupWindowStart: original.pickupWindowStart,
        pickupWindowEnd: original.pickupWindowEnd,
        deliveryDate: original.deliveryDate,
        deliveryWindowStart: original.deliveryWindowStart,
        deliveryWindowEnd: original.deliveryWindowEnd,
        commodity: original.commodity,
        weightLbs: original.weightLbs,
        pieces: original.pieces,
        pallets: original.pallets,
        totalMiles: original.totalMiles,
        linehaulRate: original.linehaulRate,
        fuelSurcharge: original.fuelSurcharge,
        accessorialsTotal: original.accessorialsTotal,
        totalAmount: original.totalAmount,
        marginPercent: original.marginPercent,
        internalNotes: original.internalNotes,
        customerNotes: original.customerNotes,
        specialInstructions: original.specialInstructions,
        status: 'DRAFT',
        salesRepId: userId,
        customFields: original.customFields || {},
        createdById: userId,
        stops: {
          create: original.stops.map((stop) => ({
            tenantId,
            stopType: stop.stopType,
            stopSequence: stop.stopSequence,
            facilityName: stop.facilityName,
            addressLine1: stop.addressLine1,
            addressLine2: stop.addressLine2,
            city: stop.city,
            state: stop.state,
            postalCode: stop.postalCode,
            country: stop.country || 'USA',
            contactName: stop.contactName,
            contactPhone: stop.contactPhone,
          })),
        },
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        company: { select: { id: true, name: true } },
      },
    });

    return newVersion;
  }

  async send(tenantId: string, id: string, userId: string) {
    const quote = await this.findOne(tenantId, id);

    if (!quote.customerEmail) {
      throw new BadRequestException('Quote must have a customer email to send');
    }

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        updatedById: userId,
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        company: { select: { id: true, name: true } },
      },
    });

    // Emit quote sent event (Communication service can listen and send email)
    this.eventEmitter.emit('quote.sent', { quote: updated, tenantId, userId });

    return updated;
  }

  async generatePdf(tenantId: string, id: string): Promise<Buffer> {
    const quote = await this.findOne(tenantId, id);

    // Mock PDF generation - in production, use a PDF library like PDFKit or Puppeteer
    const pdfContent = `
      QUOTE ${quote.quoteNumber}
      Version: ${quote.version}
      
      Customer: ${quote.customerName || quote.company?.name || 'N/A'}
      Service Type: ${quote.serviceType}
      Equipment: ${quote.equipmentType}
      
      Total Amount: $${quote.totalAmount.toFixed(2)}
      
      This is a mock PDF. In production, use a proper PDF generation library.
    `;

    return Buffer.from(pdfContent, 'utf-8');
  }

  async quickQuote(tenantId: string, userId: string, dto: QuickQuoteDto) {
    // Calculate rate using rate calculation service
    const rateCalc = await this.rateCalculationService.calculateRate(tenantId, {
      origin: { city: dto.originCity, state: dto.originState },
      destination: { city: dto.destinationCity, state: dto.destinationState },
      serviceType: dto.serviceType,
      equipmentType: dto.equipmentType,
    });

    // Create quick quote with calculated values
    const quote = await this.prisma.quote.create({
      data: {
        tenantId,
        quoteNumber: await this.generateQuoteNumber(tenantId),
        customerEmail: dto.customerEmail,
        serviceType: dto.serviceType,
        equipmentType: dto.equipmentType,
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
        totalMiles: rateCalc.totalMiles,
        linehaulRate: rateCalc.linehaulRate,
        fuelSurcharge: rateCalc.fuelSurcharge,
        accessorialsTotal: rateCalc.accessorialsTotal,
        totalAmount: rateCalc.totalAmount,
        marginPercent: rateCalc.marginPercent,
        rateSource: rateCalc.rateSource,
        status: 'DRAFT',
        salesRepId: userId,
        createdById: userId,
        stops: {
          create: [
            {
              tenantId,
              stopType: 'PICKUP',
              stopSequence: 1,
              city: dto.originCity,
              state: dto.originState,
              addressLine1: 'TBD',
              postalCode: '',
            },
            {
              tenantId,
              stopType: 'DELIVERY',
              stopSequence: 2,
              city: dto.destinationCity,
              state: dto.destinationState,
              addressLine1: 'TBD',
              postalCode: '',
            },
          ],
        },
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
      },
    });

    return quote;
  }

  async calculateRate(tenantId: string, dto: CalculateRateDto) {
    const result = await this.rateCalculationService.calculateRate(tenantId, {
      origin: dto.origin,
      destination: dto.destination,
      stops: dto.additionalStops,
      serviceType: dto.serviceType,
      equipmentType: dto.equipmentType,
      weightLbs: dto.weightLbs,
      pieces: dto.pieces,
      customerId: dto.customerId,
    });

    return result;
  }
}
