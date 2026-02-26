import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    serviceType?: string;
  }) {
    const { page = 1, limit = 20, status, companyId, salesRepId, search, serviceType } = options || {};
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: any = { tenantId, deletedAt: null };
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }
    if (companyId) where.companyId = companyId;
    if (salesRepId) where.salesRepId = salesRepId;
    if (serviceType) where.serviceType = serviceType;
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

  async getStats(tenantId: string): Promise<{
    totalQuotes: number;
    activePipeline: number;
    pipelineValue: number;
    wonThisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [statusGroups, pipelineValue, wonThisMonth] = await Promise.all([
      this.prisma.quote.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.quote.aggregate({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ['DRAFT', 'SENT', 'ACCEPTED'] },
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.quote.count({
        where: {
          tenantId,
          deletedAt: null,
          status: 'CONVERTED',
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    let totalQuotes = 0;
    let activePipeline = 0;
    for (const group of statusGroups) {
      totalQuotes += group._count.id;
      if (['DRAFT', 'SENT', 'ACCEPTED'].includes(group.status)) {
        activePipeline += group._count.id;
      }
    }

    return {
      totalQuotes,
      activePipeline,
      pipelineValue: Number(pipelineValue._sum.totalAmount ?? 0),
      wonThisMonth,
    };
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

    // Replace stops if provided
    if (dto.stops && dto.stops.length > 0) {
      await this.prisma.quoteStop.deleteMany({ where: { quoteId: id } });
      await this.prisma.quoteStop.createMany({
        data: dto.stops.map((stop) => ({
          tenantId,
          quoteId: id,
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
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        companyId: dto.companyId,
        contactId: dto.contactId,
        customerName: dto.customerName,
        serviceType: dto.serviceType,
        equipmentType: dto.equipmentType,
        pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : undefined,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : undefined,
        commodity: dto.commodity,
        weightLbs: dto.weightLbs,
        pieces: dto.pieces,
        pallets: dto.pallets,
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

  async getVersions(tenantId: string, id: string) {
    const quote = await this.findOne(tenantId, id);
    const rootId = quote.parentQuoteId || quote.id;

    const versions = await this.prisma.quote.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: [{ id: rootId }, { parentQuoteId: rootId }],
      },
      orderBy: { version: 'asc' },
      select: { id: true, version: true, status: true, totalAmount: true, createdAt: true, createdById: true },
    });

    return versions.map((v) => ({
      id: v.id,
      version: v.version,
      status: v.status,
      totalAmount: v.totalAmount,
      createdAt: v.createdAt,
      createdBy: v.createdById,
    }));
  }

  async getTimeline(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        createdAt: true, createdById: true,
        sentAt: true, viewedAt: true, respondedAt: true,
        convertedAt: true, rejectionReason: true,
        status: true, customFields: true,
      },
    });

    if (!quote) throw new NotFoundException(`Quote with ID ${id} not found`);

    type RawEvent = { type: string; description: string; timestamp: Date; createdBy?: string | null };
    const raw: RawEvent[] = [];

    raw.push({ type: 'created', description: 'Quote created', timestamp: quote.createdAt, createdBy: quote.createdById });
    if (quote.sentAt) raw.push({ type: 'sent', description: 'Quote sent to customer', timestamp: quote.sentAt });
    if (quote.viewedAt) raw.push({ type: 'viewed', description: 'Quote viewed by customer', timestamp: quote.viewedAt });
    if (quote.respondedAt && quote.status === 'ACCEPTED') raw.push({ type: 'accepted', description: 'Quote accepted', timestamp: quote.respondedAt });
    if (quote.respondedAt && quote.status === 'REJECTED') raw.push({ type: 'rejected', description: `Quote rejected${quote.rejectionReason ? `: ${quote.rejectionReason}` : ''}`, timestamp: quote.respondedAt });
    if (quote.convertedAt) raw.push({ type: 'converted', description: 'Converted to order', timestamp: quote.convertedAt });

    // Include notes as timeline events
    const cf = quote.customFields as Record<string, unknown> | null;
    const notes: { id?: string; content: string; createdAt: string; createdById?: string }[] = Array.isArray(cf?.notes) ? (cf!.notes as typeof notes) : [];
    for (const note of notes) {
      raw.push({ type: 'note', description: note.content, timestamp: new Date(note.createdAt), createdBy: note.createdById });
    }

    return raw
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map((e, i) => ({
        id: `${e.type}-${e.timestamp.getTime()}-${i}`,
        type: e.type,
        description: e.description,
        createdAt: e.timestamp.toISOString(),
        createdBy: e.createdBy ?? undefined,
      }));
  }

  async getNotes(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: { customFields: true },
    });
    if (!quote) throw new NotFoundException(`Quote with ID ${id} not found`);

    const cf = quote.customFields as Record<string, unknown> | null;
    return Array.isArray(cf?.notes) ? cf!.notes : [];
  }

  async addNote(tenantId: string, id: string, userId: string, content: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: { customFields: true },
    });
    if (!quote) throw new NotFoundException(`Quote with ID ${id} not found`);

    const cf = (quote.customFields as Record<string, unknown>) || {};
    const existing: unknown[] = Array.isArray(cf.notes) ? (cf.notes as unknown[]) : [];
    const newNote = { id: crypto.randomUUID(), content, createdAt: new Date().toISOString(), createdById: userId };
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { customFields: { ...cf, notes: [...existing, newNote] } as Prisma.InputJsonValue },
    });
    void updated;
    return newNote;
  }

  async accept(tenantId: string, id: string, userId: string) {
    const quote = await this.findOne(tenantId, id);
    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      throw new BadRequestException(`Cannot accept a quote with status ${quote.status}`);
    }
    return this.prisma.quote.update({
      where: { id },
      data: { status: 'ACCEPTED', respondedAt: new Date(), updatedById: userId },
    });
  }

  async reject(tenantId: string, id: string, userId: string, reason?: string) {
    const quote = await this.findOne(tenantId, id);
    if (!['SENT', 'VIEWED', 'ACCEPTED'].includes(quote.status)) {
      throw new BadRequestException(`Cannot reject a quote with status ${quote.status}`);
    }
    return this.prisma.quote.update({
      where: { id },
      data: { status: 'REJECTED', respondedAt: new Date(), rejectionReason: reason, updatedById: userId },
    });
  }

  async send(tenantId: string, id: string, userId: string) {
    const quote = await this.findOne(tenantId, id);

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
