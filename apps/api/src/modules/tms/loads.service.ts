import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto } from './dto';

@Injectable()
export class LoadsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateLoadDto) {
    // Verify order exists
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const loadNumber = await this.generateLoadNumber(tenantId);

    const load = await this.prisma.load.create({
      data: {
        tenantId,
        orderId: dto.orderId,
        loadNumber,
        status: 'PENDING',
        carrierId: dto.carrierId,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        truckNumber: dto.truckNumber,
        trailerNumber: dto.trailerNumber,
        carrierRate: dto.carrierRate,
        accessorialCosts: dto.accessorialCosts,
        fuelAdvance: dto.fuelAdvance,
        equipmentType: dto.equipmentType,
        equipmentLength: dto.equipmentLength,
        equipmentWeightLimit: dto.equipmentWeightLimit,
        dispatchNotes: dto.dispatchNotes,
        createdById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    return load;
  }

  async findAll(tenantId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    carrierId?: string;
    orderId?: string;
  }) {
    const { page = 1, limit = 20, status, carrierId, orderId } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (carrierId) where.carrierId = carrierId;
    if (orderId) where.orderId = orderId;

    const [loads, total] = await Promise.all([
      this.prisma.load.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { 
            select: { 
              id: true, 
              orderNumber: true, 
              status: true,
              customer: { select: { id: true, name: true } },
            } 
          },
          carrier: { select: { id: true, legalName: true, mcNumber: true } },
        },
      }),
      this.prisma.load.count({ where }),
    ]);

    return {
      data: loads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId },
      include: {
        order: {
          include: {
            customer: true,
            stops: { orderBy: { stopSequence: 'asc' } },
          },
        },
        carrier: true,
        checkCalls: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    return load;
  }

  async update(tenantId: string, id: string, dto: UpdateLoadDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    // Validate status transitions if changing status
    if (dto.status && !this.isValidStatusTransition(load.status, dto.status)) {
      throw new BadRequestException(`Cannot transition from ${load.status} to ${dto.status}`);
    }

    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        carrierId: dto.carrierId,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        truckNumber: dto.truckNumber,
        trailerNumber: dto.trailerNumber,
        carrierRate: dto.carrierRate,
        accessorialCosts: dto.accessorialCosts,
        fuelAdvance: dto.fuelAdvance,
        equipmentType: dto.equipmentType,
        equipmentLength: dto.equipmentLength,
        equipmentWeightLimit: dto.equipmentWeightLimit,
        status: dto.status,
        dispatchNotes: dto.dispatchNotes,
        updatedAt: new Date(),
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    return updated;
  }

  async assignCarrier(tenantId: string, id: string, userId: string, dto: AssignCarrierDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: dto.carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        carrierId: dto.carrierId,
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        truckNumber: dto.truckNumber,
        trailerNumber: dto.trailerNumber,
        carrierRate: dto.carrierRate,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true, dotNumber: true } },
      },
    });

    return updated;
  }

  async updateLocation(tenantId: string, id: string, dto: UpdateLoadLocationDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        currentLocationLat: dto.latitude,
        currentLocationLng: dto.longitude,
        currentCity: dto.city,
        currentState: dto.state,
        eta: dto.eta ? new Date(dto.eta) : undefined,
        lastTrackingUpdate: new Date(),
      },
    });

    return updated;
  }

  async addCheckCall(tenantId: string, loadId: string, userId: string, data: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    status?: string;
    notes?: string;
    eta?: string;
  }) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const checkCall = await this.prisma.checkCall.create({
      data: {
        tenantId,
        loadId,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        state: data.state,
        status: data.status,
        notes: data.notes,
        eta: data.eta ? new Date(data.eta) : null,
        createdById: userId,
      },
    });

    // Update load's current location
    await this.prisma.load.update({
      where: { id: loadId },
      data: {
        currentLocationLat: data.latitude,
        currentLocationLng: data.longitude,
        currentCity: data.city,
        currentState: data.state,
        eta: data.eta ? new Date(data.eta) : undefined,
        lastTrackingUpdate: new Date(),
      },
    });

    return checkCall;
  }

  async getLoadBoard(tenantId: string, options: {
    status?: string[];
    region?: string;
  }) {
    const { status = ['PENDING', 'ASSIGNED', 'IN_TRANSIT'], region } = options;

    const loads = await this.prisma.load.findMany({
      where: {
        tenantId,
        status: { in: status },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true } },
            stops: { 
              orderBy: { stopSequence: 'asc' },
              take: 2,
            },
          },
        },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    // Group by status
    const grouped = loads.reduce<Record<string, typeof loads>>((acc, load) => {
      if (!acc[load.status]) {
        acc[load.status] = [];
      }
      acc[load.status]!.push(load);
      return acc;
    }, {});

    return {
      total: loads.length,
      byStatus: grouped,
      loads,
    };
  }

  async delete(tenantId: string, id: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!['PENDING', 'CANCELLED'].includes(load.status)) {
      throw new BadRequestException('Only pending or cancelled loads can be deleted');
    }

    await this.prisma.load.delete({ where: { id } });

    return { success: true, message: 'Load deleted successfully' };
  }

  private async generateLoadNumber(tenantId: string): Promise<string> {
    const today = new Date();
    const prefix = `LD${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastLoad = await this.prisma.load.findFirst({
      where: {
        tenantId,
        loadNumber: { startsWith: prefix },
      },
      orderBy: { loadNumber: 'desc' },
    });

    let sequence = 1;
    if (lastLoad) {
      const lastSequence = parseInt(lastLoad.loadNumber.slice(-4), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private isValidStatusTransition(current: string, next: string): boolean {
    const transitions: Record<string, string[]> = {
      PENDING: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['DISPATCHED', 'PENDING', 'CANCELLED'],
      DISPATCHED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['AT_PICKUP', 'AT_DELIVERY', 'DELIVERED'],
      AT_PICKUP: ['IN_TRANSIT'],
      AT_DELIVERY: ['DELIVERED', 'IN_TRANSIT'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: ['PENDING'],
    };

    return transitions[current]?.includes(next) || false;
  }
}
