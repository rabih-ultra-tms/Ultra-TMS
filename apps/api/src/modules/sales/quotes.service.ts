import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateQuoteDto, UpdateQuoteDto } from './dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  private generateQuoteNumber(): string {
    const prefix = 'QT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
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
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
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
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          salesRep: { select: { id: true, firstName: true, lastName: true } },
          stops: { orderBy: { stopSequence: 'asc' } },
        },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
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
        quoteNumber: this.generateQuoteNumber(),
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

    return order;
  }
}
