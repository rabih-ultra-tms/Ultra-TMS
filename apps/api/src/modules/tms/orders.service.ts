import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  CloneOrderDto,
  ChangeOrderStatusDto,
  CancelOrderDto,
  CreateOrderItemDto,
  CreateStopDto,
} from './dto/create-order.dto';
import { CreateLoadDto } from './dto/create-load.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CreateOrderFromTemplateDto } from './dto/create-order-from-template.dto';
import { Prisma } from '@prisma/client';

// Simple function to generate random alphanumeric string
function generateRandomSuffix(length: number = 4): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Convert Prisma Decimal fields to plain numbers so the
 * ClassSerializerInterceptor (instanceToPlain) doesn't corrupt
 * them into { d, e, s } internal representations.
 */
function toPlainOrder<T extends Record<string, unknown>>(order: T): T {
  if (!order) return order;
  const decimalFields = [
    'weightLbs',
    'customerRate',
    'fuelSurcharge',
    'accessorialCharges',
    'totalCharges',
    'temperatureMin',
    'temperatureMax',
    'totalMiles',
  ] as const;
  const result = { ...order };
  for (const field of decimalFields) {
    if (field in result && result[field] != null) {
      (result as Record<string, unknown>)[field] = Number(result[field]);
    }
  }
  return result as T;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get all orders for a tenant
   */
  async findAll(tenantId: string, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.customerId && { customerId: query.customerId }),
      ...(query.salesRepId && { salesRepId: query.salesRepId }),
      ...(query.equipmentType && { equipmentType: query.equipmentType }),
      ...(query.fromDate || query.toDate
        ? {
            orderDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: 'insensitive' } },
              { customerReference: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
          loads: { where: { deletedAt: null } },
          customer: { select: { id: true, name: true } },
          _count: { select: { loads: true, stops: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(toPlainOrder),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single order by ID
   */
  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
        loads: { where: { deletedAt: null } },
        items: { where: { deletedAt: null } },
        customer: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return toPlainOrder(order);
  }

  /**
   * Create new order with stops
   */
  async create(tenantId: string, dto: CreateOrderDto, userId: string) {
    // Validate required stops
    if (!dto.stops || dto.stops.length < 2) {
      throw new BadRequestException('Orders must have at least 2 stops (pickup and delivery)');
    }

    // Check customer exists
    const company = await this.prisma.company.findFirst({
      where: { id: dto.customerId, tenantId },
    });

    if (!company) {
      throw new BadRequestException(`Customer ${dto.customerId} not found`);
    }

    // Generate order number: ORD-YYYYMMDD-XXXX
    const today = new Date().toISOString().split('T')[0]!.replace(/-/g, '');
    const suffix = generateRandomSuffix(4);
    const orderNumber = `ORD-${today}-${suffix}`;

    // Compute accessorial total
    const accessorialTotal = dto.accessorials?.reduce((sum, a) => sum + (a.amount || 0), 0) ?? 0;
    const totalCharges = (dto.customerRate ?? 0) + (dto.fuelSurcharge ?? 0) + accessorialTotal;

    // Store fields without Prisma columns in customFields
    const customFields: Record<string, unknown> = {};
    if (dto.priority) customFields.priority = dto.priority;
    if (dto.paymentTerms) customFields.paymentTerms = dto.paymentTerms;
    if (dto.specialHandling?.length) customFields.specialHandling = dto.specialHandling;
    if (dto.hazmatUnNumber) customFields.hazmatUnNumber = dto.hazmatUnNumber;
    if (dto.hazmatPlacard) customFields.hazmatPlacard = dto.hazmatPlacard;
    if (dto.estimatedCarrierRate) customFields.estimatedCarrierRate = dto.estimatedCarrierRate;
    if (dto.billingContactId) customFields.billingContactId = dto.billingContactId;
    if (dto.billingNotes) customFields.billingNotes = dto.billingNotes;
    if (dto.accessorials?.length) customFields.accessorials = dto.accessorials;

    // Create order with stops in transaction
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId: dto.customerId,
        status: dto.status || 'PENDING',
        createdById: userId,
        updatedById: userId,
        customerReference: dto.customerReferenceNumber || dto.customerReference,
        poNumber: dto.poNumber,
        bolNumber: dto.bolNumber,
        salesRepId: dto.salesRepId || undefined,
        specialInstructions: dto.specialInstructions,
        internalNotes: dto.internalNotes,
        commodity: dto.commodity,
        weightLbs: dto.weightLbs,
        pieceCount: dto.pieceCount,
        palletCount: dto.palletCount,
        equipmentType: dto.equipmentType,
        isHazmat: dto.isHazmat ?? false,
        hazmatClass: dto.isHazmat ? dto.hazmatClass : undefined,
        temperatureMin: dto.temperatureMin,
        temperatureMax: dto.temperatureMax,
        customerRate: dto.customerRate,
        fuelSurcharge: dto.fuelSurcharge ?? 0,
        accessorialCharges: accessorialTotal,
        totalCharges: totalCharges > 0 ? totalCharges : undefined,
        customFields: Object.keys(customFields).length > 0 ? (customFields as Prisma.InputJsonValue) : undefined,

        // Create stops — field names now match Prisma schema directly
        stops: {
          createMany: {
            data: dto.stops.map((stop: CreateStopDto, idx: number) => ({
              tenantId,
              stopType: stop.stopType,
              facilityName: stop.facilityName,
              addressLine1: stop.addressLine1,
              addressLine2: stop.addressLine2,
              city: stop.city,
              state: stop.state,
              postalCode: stop.postalCode,
              country: stop.country || 'USA',
              contactName: stop.contactName,
              contactPhone: stop.contactPhone,
              contactEmail: stop.contactEmail,
              appointmentRequired: stop.appointmentRequired ?? false,
              appointmentDate: stop.appointmentDate ? new Date(stop.appointmentDate) : null,
              appointmentTimeStart: stop.appointmentTimeStart,
              appointmentTimeEnd: stop.appointmentTimeEnd,
              specialInstructions: stop.specialInstructions,
              stopSequence: stop.stopSequence ?? idx + 1,
              status: 'PENDING',
              createdById: userId,
              updatedById: userId,
            })),
          },
        },

        items: dto.items?.length
          ? {
              createMany: {
                data: dto.items.map((item: CreateOrderItemDto) => ({
                  tenantId,
                  description: item.description,
                  quantity: item.quantity ?? 1,
                  quantityType: item.quantityType,
                  weightLbs: item.weightLbs,
                  commodityClass: item.commodityClass,
                  nmfcCode: item.nmfcCode,
                  isHazmat: item.isHazmat ?? false,
                  hazmatClass: item.hazmatClass,
                  unNumber: item.unNumber,
                  sku: item.sku,
                  lotNumber: item.lotNumber,
                  createdById: userId,
                  updatedById: userId,
                })),
              },
            }
          : undefined,
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: true,
        items: true,
      },
    });

    this.eventEmitter.emit('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      tenantId,
    });

    return toPlainOrder(order);
  }

  async createFromQuote(tenantId: string, userId: string, quoteId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, tenantId, deletedAt: null },
      select: {
        id: true,
        companyId: true,
        quoteNumber: true,
        specialInstructions: true,
        stops: {
          select: {
            stopType: true,
            facilityName: true,
            addressLine1: true,
            city: true,
            state: true,
            postalCode: true,
            contactName: true,
            contactPhone: true,
            contactEmail: true,
            earliestTime: true,
            latestTime: true,
            instructions: true,
            stopSequence: true,
          },
        },
      },
    });
    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    const customerId = quote.companyId;
    if (!customerId) {
      throw new BadRequestException('Quote is missing companyId for conversion');
    }

    const createDto: CreateOrderDto = {
      customerId,
      customerReference: quote.quoteNumber ?? undefined,
      specialInstructions: quote.specialInstructions ?? undefined,
      stops: quote.stops?.map((s: any, idx: number) => ({
        stopType: s.stopType ?? 'PICKUP',
        facilityName: s.facilityName ?? undefined,
        addressLine1: s.addressLine1 ?? '',
        city: s.city ?? '',
        state: s.state ?? '',
        postalCode: s.postalCode ?? '',
        contactName: s.contactName ?? undefined,
        contactPhone: s.contactPhone ?? undefined,
        contactEmail: s.contactEmail ?? undefined,
        appointmentDate: s.earliestTime ?? undefined,
        appointmentTimeStart: s.latestTime ?? undefined,
        specialInstructions: s.instructions ?? undefined,
        stopSequence: s.stopSequence ?? idx + 1,
      })) ?? [],
      items: [],
    };

    const order = await this.create(tenantId, createDto, userId);

    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: 'CONVERTED',
        convertedOrderId: order.id,
        convertedAt: new Date(),
        updatedById: userId,
      },
    });

    return order;
  }

  async createFromTemplate(
    tenantId: string,
    userId: string,
    templateId: string,
    overrides: CreateOrderFromTemplateDto,
  ) {
    const template = await this.prisma.order.findFirst({
      where: { id: templateId, tenantId, deletedAt: null },
      include: {
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
        items: { where: { deletedAt: null } },
      },
    });

    if (!template) {
      throw new NotFoundException('Order template not found');
    }

    const customerId = overrides.customerId || template.customerId;
    if (!customerId) {
      throw new BadRequestException('Template is missing customerId');
    }

    const stops: CreateStopDto[] = template.stops.map((stop, index) => {
      const override = overrides.stopOverrides?.[index];
      return {
        stopType: stop.stopType,
        facilityName: override?.facilityName || stop.facilityName || undefined,
        addressLine1: override?.address || stop.addressLine1 || '',
        city: override?.city || stop.city || '',
        state: override?.state || stop.state || '',
        postalCode: override?.postalCode || stop.postalCode || '',
        contactName: stop.contactName || undefined,
        contactPhone: stop.contactPhone || undefined,
        contactEmail: stop.contactEmail || undefined,
        appointmentDate: override?.appointmentDate
          ? override.appointmentDate
          : stop.appointmentDate
          ? stop.appointmentDate.toISOString()
          : undefined,
        appointmentTimeStart:
          override?.appointmentTime || stop.appointmentTimeStart || undefined,
        stopSequence: stop.stopSequence || index + 1,
      };
    });

    const items: CreateOrderItemDto[] = template.items.map((item) => ({
      description: item.description || 'Item',
      quantity: item.quantity ?? undefined,
      quantityType: item.quantityType || undefined,
      weightLbs: item.weightLbs ? Number(item.weightLbs) : undefined,
      commodityClass: item.commodityClass || undefined,
      nmfcCode: item.nmfcCode || undefined,
      isHazmat: item.isHazmat ?? false,
      hazmatClass: item.hazmatClass || undefined,
      unNumber: item.unNumber || undefined,
      sku: item.sku || undefined,
      lotNumber: item.lotNumber || undefined,
    }));

    const createDto: CreateOrderDto = {
      customerId,
      customerReference:
        overrides.referenceNumber || template.customerReference || undefined,
      specialInstructions: template.specialInstructions || undefined,
      stops,
      items,
    };

    return this.create(tenantId, createDto, userId);
  }

  /**
   * Update order
   */
  async update(tenantId: string, id: string, dto: UpdateOrderDto, userId: string) {
    const order = await this.findOne(tenantId, id);

    // Cannot modify if delivered/completed
    if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new ConflictException(`Cannot modify order in ${order.status} status`);
    }

    // Track changes for event
    const changes: Record<string, unknown> = {};
    const trackChange = (field: string, newVal: unknown, oldVal: unknown) => {
      if (newVal !== undefined && newVal !== oldVal) changes[field] = newVal;
    };

    trackChange('customerReference', dto.customerReferenceNumber ?? dto.customerReference, order.customerReference);
    trackChange('status', dto.status, order.status);
    trackChange('commodity', dto.commodity, order.commodity);
    trackChange('equipmentType', dto.equipmentType, order.equipmentType);

    // Compute accessorial total if provided
    const customFields = (order.customFields as Record<string, unknown>) || {};
    if (dto.specialHandling?.length) customFields.specialHandling = dto.specialHandling;
    if (dto.hazmatUnNumber) customFields.hazmatUnNumber = dto.hazmatUnNumber;
    if (dto.hazmatPlacard) customFields.hazmatPlacard = dto.hazmatPlacard;
    if (dto.estimatedCarrierRate !== undefined) customFields.estimatedCarrierRate = dto.estimatedCarrierRate;
    if (dto.billingContactId) customFields.billingContactId = dto.billingContactId;
    if (dto.billingNotes) customFields.billingNotes = dto.billingNotes;
    if (dto.priority) customFields.priority = dto.priority;
    if (dto.paymentTerms) customFields.paymentTerms = dto.paymentTerms;
    if (dto.accessorials?.length) customFields.accessorials = dto.accessorials;

    const accessorialTotal = dto.accessorials?.reduce((sum, a) => sum + (a.amount || 0), 0);
    const customerRate = dto.customerRate ?? (Number(order.customerRate) || 0);
    const fuelSurcharge = dto.fuelSurcharge ?? (Number(order.fuelSurcharge) || 0);
    const accCharges = accessorialTotal ?? (Number(order.accessorialCharges) || 0);
    const totalCharges = customerRate + fuelSurcharge + accCharges;

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.customerId !== undefined && { customerId: dto.customerId }),
        customerReference: dto.customerReferenceNumber ?? dto.customerReference ?? order.customerReference,
        ...(dto.poNumber !== undefined && { poNumber: dto.poNumber }),
        ...(dto.bolNumber !== undefined && { bolNumber: dto.bolNumber }),
        ...(dto.salesRepId !== undefined && { salesRepId: dto.salesRepId || null }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { /* stored in customFields */ }),
        specialInstructions: dto.specialInstructions ?? order.specialInstructions,
        ...(dto.internalNotes !== undefined && { internalNotes: dto.internalNotes }),
        // Cargo
        ...(dto.commodity !== undefined && { commodity: dto.commodity }),
        ...(dto.weightLbs !== undefined && { weightLbs: dto.weightLbs }),
        ...(dto.pieceCount !== undefined && { pieceCount: dto.pieceCount }),
        ...(dto.palletCount !== undefined && { palletCount: dto.palletCount }),
        ...(dto.equipmentType !== undefined && { equipmentType: dto.equipmentType }),
        ...(dto.isHazmat !== undefined && { isHazmat: dto.isHazmat }),
        ...(dto.hazmatClass !== undefined && { hazmatClass: dto.hazmatClass }),
        ...(dto.temperatureMin !== undefined && { temperatureMin: dto.temperatureMin }),
        ...(dto.temperatureMax !== undefined && { temperatureMax: dto.temperatureMax }),
        // Financial
        ...(dto.customerRate !== undefined && { customerRate: dto.customerRate }),
        ...(dto.fuelSurcharge !== undefined && { fuelSurcharge: dto.fuelSurcharge }),
        ...(accessorialTotal !== undefined && { accessorialCharges: accessorialTotal }),
        totalCharges: totalCharges > 0 ? totalCharges : undefined,
        // Flags
        ...(dto.isHot !== undefined && { isHot: dto.isHot }),
        // Metadata
        customFields: Object.keys(customFields).length > 0 ? customFields as any : undefined,
        updatedById: userId,
      },
      include: {
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
        loads: { where: { deletedAt: null } },
        items: { where: { deletedAt: null } },
        customer: { select: { id: true, name: true } },
      },
    });

    // Update stops if provided
    if (dto.stops?.length) {
      // Hard-delete old stops — soft-delete would violate the
      // @@unique([orderId, stopSequence]) constraint when recreating
      await this.prisma.stop.deleteMany({
        where: { orderId: id, tenantId },
      });

      await this.prisma.stop.createMany({
        data: dto.stops.map((stop, idx) => ({
          tenantId,
          orderId: id,
          stopType: stop.stopType,
          facilityName: stop.facilityName,
          addressLine1: stop.addressLine1,
          addressLine2: stop.addressLine2,
          city: stop.city,
          state: stop.state,
          postalCode: stop.postalCode,
          country: stop.country || 'USA',
          contactName: stop.contactName,
          contactPhone: stop.contactPhone,
          contactEmail: stop.contactEmail,
          appointmentRequired: stop.appointmentRequired ?? false,
          appointmentDate: stop.appointmentDate ? new Date(stop.appointmentDate) : null,
          appointmentTimeStart: stop.appointmentTimeStart,
          appointmentTimeEnd: stop.appointmentTimeEnd,
          specialInstructions: stop.specialInstructions,
          stopSequence: stop.stopSequence ?? idx + 1,
          status: 'PENDING',
          createdById: userId,
          updatedById: userId,
        })),
      });
    }

    this.eventEmitter.emit('order.updated', {
      orderId: id,
      changes,
      tenantId,
    });

    // Re-fetch to get updated stops
    return this.findOne(tenantId, id);
  }

  /**
   * Clone order
   */
  async clone(tenantId: string, id: string, dto: CloneOrderDto, userId: string) {
    const original = await this.findOne(tenantId, id);

    // Generate new order number
    const today = new Date().toISOString().split('T')[0]!.replace(/-/g, '');
    const suffix = generateRandomSuffix(4);
    const orderNumber = `ORD-${today}-${suffix}`;

    // Adjust pickup date if provided
    const pickupDate = dto.pickupDate ? new Date(dto.pickupDate) : null;

    const cloned = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId: original.customerId,
        status: 'PENDING',
        createdById: userId,
        updatedById: userId,
        customerReference: original.customerReference,
        specialInstructions: original.specialInstructions,

        // Clone stops
        stops: {
          createMany: {
            data: original.stops.map((stop) => ({
              tenantId,
              stopType: stop.stopType,
              facilityName: stop.facilityName,
              addressLine1: stop.addressLine1,
              addressLine2: stop.addressLine2,
              city: stop.city,
              state: stop.state,
              postalCode: stop.postalCode,
              country: stop.country,
              contactName: stop.contactName,
              contactPhone: stop.contactPhone,
              contactEmail: stop.contactEmail,
              appointmentDate: pickupDate && stop.stopType === 'PICKUP' ? pickupDate : stop.appointmentDate,
              appointmentTimeStart: stop.appointmentTimeStart,
              appointmentTimeEnd: stop.appointmentTimeEnd,
              stopSequence: stop.stopSequence,
              status: 'PENDING',
              createdById: userId,
              updatedById: userId,
            })),
          },
        },
      },
      include: {
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: true,
      },
    });

    return cloned;
  }

  async getStops(tenantId: string, orderId: string) {
    await this.findOne(tenantId, orderId);
    return this.prisma.stop.findMany({
      where: { orderId, tenantId, deletedAt: null },
      orderBy: { stopSequence: 'asc' },
    });
  }

  async getLoads(tenantId: string, orderId: string) {
    await this.findOne(tenantId, orderId);
    return this.prisma.load.findMany({
      where: { orderId, tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLoadForOrder(tenantId: string, userId: string, orderId: string, dto: CreateLoadDto) {
    await this.findOne(tenantId, orderId);
    const today = new Date().toISOString().split('T')[0]!.replace(/-/g, '');
    const loadNumber = `LD-${today}-${generateRandomSuffix(4)}`;
    const load = await this.prisma.load.create({
      data: {
        ...dto,
        orderId,
        tenantId,
        loadNumber,
        status: 'PENDING',
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('load.created', {
      loadId: load.id,
      loadNumber: load.loadNumber,
      orderId: load.orderId,
      tenantId,
    });

    return load;
  }

  async getItems(tenantId: string, orderId: string) {
    await this.findOne(tenantId, orderId);
    return this.prisma.orderItem.findMany({
      where: { orderId, tenantId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addItem(tenantId: string, userId: string, orderId: string, dto: CreateOrderItemDto) {
    await this.findOne(tenantId, orderId);
    return this.prisma.orderItem.create({
      data: {
        tenantId,
        orderId,
        description: dto.description,
        quantity: dto.quantity ?? 1,
        quantityType: dto.quantityType,
        weightLbs: dto.weightLbs,
        commodityClass: dto.commodityClass,
        nmfcCode: dto.nmfcCode,
        isHazmat: dto.isHazmat ?? false,
        hazmatClass: dto.hazmatClass,
        unNumber: dto.unNumber,
        sku: dto.sku,
        lotNumber: dto.lotNumber,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async updateItem(
    tenantId: string,
    userId: string,
    orderId: string,
    itemId: string,
    dto: Partial<CreateOrderItemDto>,
  ) {
    await this.findOne(tenantId, orderId);
    const item = await this.prisma.orderItem.findFirst({ where: { id: itemId, orderId, tenantId, deletedAt: null } });
    if (!item) {
      throw new NotFoundException(`Order item ${itemId} not found`);
    }

    return this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        description: dto.description ?? item.description,
        quantity: dto.quantity ?? item.quantity,
        quantityType: dto.quantityType ?? item.quantityType,
        weightLbs: dto.weightLbs ?? item.weightLbs,
        commodityClass: dto.commodityClass ?? item.commodityClass,
        nmfcCode: dto.nmfcCode ?? item.nmfcCode,
        isHazmat: dto.isHazmat ?? item.isHazmat,
        hazmatClass: dto.hazmatClass ?? item.hazmatClass,
        unNumber: dto.unNumber ?? item.unNumber,
        sku: dto.sku ?? item.sku,
        lotNumber: dto.lotNumber ?? item.lotNumber,
        updatedById: userId,
      },
    });
  }

  async removeItem(tenantId: string, userId: string, orderId: string, itemId: string) {
    await this.findOne(tenantId, orderId);
    const item = await this.prisma.orderItem.findFirst({ where: { id: itemId, orderId, tenantId, deletedAt: null } });
    if (!item) {
      throw new NotFoundException(`Order item ${itemId} not found`);
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        deletedAt: new Date(),
        updatedById: userId,
      },
    });
  }

  /**
   * Change order status
   */
  async changeStatus(tenantId: string, id: string, dto: ChangeOrderStatusDto, userId: string) {
    const order = await this.findOne(tenantId, id);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['QUOTED', 'CANCELLED'],
      QUOTED: ['BOOKED', 'CANCELLED'],
      BOOKED: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
      DELIVERED: ['COMPLETED', 'INVOICED'],
      COMPLETED: [],
      CANCELLED: [],
      INVOICED: [],
    };

    if (!validTransitions[order.status]?.includes(dto.status)) {
      throw new ConflictException(
        `Cannot transition from ${order.status} to ${dto.status}`
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        updatedById: userId,
      },
      include: {
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
        loads: { where: { deletedAt: null } },
      },
    });

    // Record status history
    await this.prisma.statusHistory.create({
      data: {
        tenantId,
        entityType: 'ORDER',
        entityId: id,
        oldStatus: order.status,
        newStatus: dto.status,
        notes: dto.notes,
        createdById: userId,
      },
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: id,
      oldStatus: order.status,
      newStatus: dto.status,
      tenantId,
    });

    return updated;
  }

  /**
   * Cancel order
   */
  async cancel(tenantId: string, id: string, dto: CancelOrderDto, userId: string) {
    const order = await this.findOne(tenantId, id);

    // Cannot cancel if already completed/invoiced
    if (['COMPLETED', 'INVOICED'].includes(order.status)) {
      throw new ConflictException(`Cannot cancel order in ${order.status} status`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedById: userId,
      },
      include: {
        stops: { where: { deletedAt: null } },
        loads: { where: { deletedAt: null } },
      },
    });

    // Record status history
    await this.prisma.statusHistory.create({
      data: {
        tenantId,
        entityType: 'ORDER',
        entityId: id,
        oldStatus: order.status,
        newStatus: 'CANCELLED',
        notes: dto.reason,
        createdById: userId,
      },
    });

    this.eventEmitter.emit('order.cancelled', {
      orderId: id,
      reason: dto.reason,
      tenantId,
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: id,
      oldStatus: order.status,
      newStatus: 'CANCELLED',
      tenantId,
    });

    return updated;
  }

  /**
   * Delete order (soft delete)
   */
  async delete(tenantId: string, id: string, userId: string) {
    const _order = await this.findOne(tenantId, id);

    // Cannot delete if has loads or invoices
    const loadCount = await this.prisma.load.count({
      where: { orderId: id, deletedAt: null },
    });

    if (loadCount > 0) {
      throw new ConflictException('Cannot delete order with existing loads');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: userId,
      },
    });
  }

  /**
   * Get order status history
   */
  async getStatusHistory(tenantId: string, orderId: string) {
    return this.prisma.statusHistory.findMany({
      where: {
        tenantId,
        entityType: 'ORDER',
        entityId: orderId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get order activity timeline (status history mapped to TimelineEvent shape)
   */
  async getTimeline(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, deletedAt: null },
      select: { id: true, createdAt: true, orderNumber: true },
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const history = await this.prisma.statusHistory.findMany({
      where: { tenantId, entityType: 'ORDER', entityId: orderId },
      orderBy: { createdAt: 'asc' },
    });

    const statusEvents = history.map((h) => ({
      id: h.id,
      timestamp: h.createdAt.toISOString(),
      eventType: 'STATUS_CHANGE',
      description: h.oldStatus
        ? `Status changed from ${h.oldStatus} to ${h.newStatus}`
        : `Status set to ${h.newStatus}`,
      userId: h.createdById ?? undefined,
      metadata: h.notes ? { notes: h.notes } : undefined,
    }));

    const createdEvent = {
      id: `${orderId}-created`,
      timestamp: order.createdAt.toISOString(),
      eventType: 'CREATED',
      description: `Order ${order.orderNumber} created`,
    };

    return { data: [createdEvent, ...statusEvents] };
  }
}
