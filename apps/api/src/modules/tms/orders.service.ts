import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateOrderDto) {
    const orderNumber = await this.generateOrderNumber(tenantId);
    
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        status: 'PENDING',
        customerId: dto.companyId!,
        customerReference: dto.customerReference,
        poNumber: dto.poNumber,
        bolNumber: dto.bolNumber,
        equipmentType: dto.equipmentType,
        temperatureMin: dto.temperature,
        isTeam: dto.teamRequired || false,
        isHazmat: dto.hazmat || false,
        weightLbs: dto.totalWeight,
        pieceCount: dto.totalPieces,
        customerRate: dto.customerRate,
        fuelSurcharge: dto.fuelSurcharge,
        accessorialCharges: dto.accessorialCharges,
        totalCharges: (dto.customerRate || 0) + (dto.fuelSurcharge || 0) + (dto.accessorialCharges || 0),
        specialInstructions: dto.specialInstructions,
        internalNotes: dto.internalNotes,
        salesRepId: dto.salesRepId,
        customFields: dto.customFields || {},
        createdById: userId,
        stops: dto.stops?.length ? {
          create: dto.stops.map((stop, index) => ({
            tenantId,
            stopType: stop.stopType,
            stopSequence: stop.stopSequence ?? index + 1,
            status: 'PENDING',
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
            appointmentTimeStart: stop.appointmentStart || null,
            appointmentTimeEnd: stop.appointmentEnd || null,
            specialInstructions: stop.instructions,
          })),
        } : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: true,
      },
    });

    return order;
  }

  async findAll(tenantId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    companyId?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const { page = 1, limit = 20, status, companyId, search, fromDate, toDate } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    
    if (status) {
      where.status = status;
    }
    if (companyId) {
      where.customerId = companyId;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerReference: { contains: search, mode: 'insensitive' } },
        { bolNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          stops: { 
            orderBy: { stopSequence: 'asc' },
            take: 2,
          },
          loads: {
            select: { id: true, loadNumber: true, status: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: {
          include: {
            carrier: { select: { id: true, legalName: true, mcNumber: true } },
            checkCalls: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
        salesRep: { select: { id: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Validate status transitions
    if (dto.status && !this.isValidStatusTransition(order.status, dto.status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        customerId: dto.companyId,
        customerReference: dto.customerReference,
        poNumber: dto.poNumber,
        bolNumber: dto.bolNumber,
        equipmentType: dto.equipmentType,
        temperatureMin: dto.temperature,
        isTeam: dto.teamRequired,
        isHazmat: dto.hazmat,
        weightLbs: dto.totalWeight,
        pieceCount: dto.totalPieces,
        customerRate: dto.customerRate,
        fuelSurcharge: dto.fuelSurcharge,
        accessorialCharges: dto.accessorialCharges,
        totalCharges: dto.customerRate !== undefined || dto.fuelSurcharge !== undefined || dto.accessorialCharges !== undefined
          ? (dto.customerRate ?? order.customerRate?.toNumber() ?? 0) + 
            (dto.fuelSurcharge ?? order.fuelSurcharge?.toNumber() ?? 0) + 
            (dto.accessorialCharges ?? order.accessorialCharges?.toNumber() ?? 0)
          : undefined,
        status: dto.status,
        specialInstructions: dto.specialInstructions,
        internalNotes: dto.internalNotes,
        salesRepId: dto.salesRepId,
        customFields: dto.customFields,
      },
      include: {
        customer: { select: { id: true, name: true } },
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: true,
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!['PENDING', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException('Only pending or cancelled orders can be deleted');
    }

    await this.prisma.order.delete({ where: { id } });

    return { success: true, message: 'Order deleted successfully' };
  }

  async dispatch(tenantId: string, id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, tenantId },
      include: { loads: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING' && order.status !== 'QUOTED') {
      throw new BadRequestException('Order must be in pending or quoted status to dispatch');
    }

    if (!order.loads || order.loads.length === 0) {
      throw new BadRequestException('Order must have at least one load with carrier assigned');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        updatedById: userId,
      },
      include: {
        customer: { select: { id: true, name: true } },
        stops: { orderBy: { stopSequence: 'asc' } },
        loads: true,
      },
    });

    return updated;
  }

  async getOrderBoard(tenantId: string, options: {
    view?: 'pending' | 'active' | 'completed';
    days?: number;
  }) {
    const { view = 'active', days = 7 } = options;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let statusFilter: string[];
    switch (view) {
      case 'pending':
        statusFilter = ['PENDING', 'QUOTED'];
        break;
      case 'completed':
        statusFilter = ['DELIVERED', 'INVOICED', 'PAID'];
        break;
      case 'active':
      default:
        statusFilter = ['DISPATCHED', 'IN_TRANSIT', 'AT_PICKUP', 'AT_DELIVERY'];
    }

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: { in: statusFilter },
        updatedAt: { gte: cutoffDate },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        stops: { 
          orderBy: { stopSequence: 'asc' },
          take: 2,
        },
        loads: {
          select: {
            id: true,
            loadNumber: true,
            status: true,
            carrier: { select: { id: true, legalName: true } },
            currentLocationLat: true,
            currentLocationLng: true,
            currentCity: true,
            currentState: true,
            lastTrackingUpdate: true,
          },
        },
      },
    });

    return {
      view,
      count: orders.length,
      orders,
    };
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const prefix = `ORD${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        tenantId,
        orderNumber: { startsWith: prefix },
      },
      orderBy: { orderNumber: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private isValidStatusTransition(current: string, next: string): boolean {
    const transitions: Record<string, string[]> = {
      PENDING: ['QUOTED', 'DISPATCHED', 'CANCELLED'],
      QUOTED: ['PENDING', 'DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['IN_TRANSIT', 'CANCELLED', 'PENDING'],
      IN_TRANSIT: ['AT_PICKUP', 'AT_DELIVERY', 'DELIVERED'],
      AT_PICKUP: ['IN_TRANSIT'],
      AT_DELIVERY: ['DELIVERED', 'IN_TRANSIT'],
      DELIVERED: ['INVOICED'],
      INVOICED: ['PAID'],
      PAID: [],
      CANCELLED: ['PENDING'],
    };

    return transitions[current]?.includes(next) || false;
  }
}
