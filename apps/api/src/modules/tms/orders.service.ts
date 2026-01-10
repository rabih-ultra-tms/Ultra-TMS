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
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
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
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
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

    // Create order with stops in transaction
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId: dto.customerId,
        status: 'PENDING',
        createdById: userId,
        updatedById: userId,
        customerReference: dto.customerReference,
        specialInstructions: dto.specialInstructions,

        // Create stops
        stops: {
          createMany: {
            data: dto.stops.map((stop: CreateStopDto, idx: number) => ({
              tenantId,
              stopType: stop.stopType,
              facilityName: stop.companyName,
              addressLine1: stop.address,
              city: stop.city,
              state: stop.state,
              postalCode: stop.zip,
              country: 'USA',
              contactName: stop.contactName,
              contactPhone: stop.phone,
              contactEmail: stop.email,
              appointmentDate: stop.appointmentDate ? new Date(stop.appointmentDate) : null,
              appointmentTimeStart: stop.appointmentTime,
              stopSequence: stop.stopSequence || idx + 1,
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

    return order;
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
        companyName: s.facilityName ?? '',
        address: s.addressLine1 ?? '',
        city: s.city ?? '',
        state: s.state ?? '',
        zip: s.postalCode ?? '',
        contactName: s.contactName ?? undefined,
        phone: s.contactPhone ?? undefined,
        email: s.contactEmail ?? undefined,
        appointmentDate: s.earliestTime ?? undefined,
        appointmentTime: s.latestTime ?? undefined,
        instructions: s.instructions ?? undefined,
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

  /**
   * Update order
   */
  async update(tenantId: string, id: string, dto: UpdateOrderDto, userId: string) {
    const order = await this.findOne(tenantId, id);

    // Cannot modify if delivered/completed
    if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      throw new ConflictException(`Cannot modify order in ${order.status} status`);
    }

    const changes: Record<string, unknown> = {};
    if (dto.customerReference !== undefined && dto.customerReference !== order.customerReference) {
      changes.customerReference = dto.customerReference;
    }
    if (dto.specialInstructions !== undefined && dto.specialInstructions !== order.specialInstructions) {
      changes.specialInstructions = dto.specialInstructions;
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        customerReference: dto.customerReference !== undefined ? dto.customerReference : order.customerReference,
        specialInstructions: dto.specialInstructions !== undefined ? dto.specialInstructions : order.specialInstructions,
        updatedById: userId,
      },
      include: {
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
        loads: { where: { deletedAt: null } },
      },
    });

    this.eventEmitter.emit('order.updated', {
      orderId: id,
      changes,
      tenantId,
    });

    return updated;
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
}
