import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import PDFDocument from 'pdfkit';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto, LoadQueryDto, CreateCheckCallDto, PaginationDto, RateConfirmationOptionsDto } from './dto';

@Injectable()
export class LoadsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(tenantId: string, userId: string, dto: CreateLoadDto) {
    // Verify order exists if orderId is provided
    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: { id: dto.orderId, tenantId, deletedAt: null },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
    }

    const loadNumber = await this.generateLoadNumber(tenantId);

    const load = await this.prisma.load.create({
      data: {
        tenantId,
        ...(dto.orderId ? { orderId: dto.orderId } : {}),
        loadNumber,
        status: 'PENDING',
        carrierId: dto.carrierId ?? null,
        driverName: dto.driverName ?? null,
        driverPhone: dto.driverPhone ?? null,
        truckNumber: dto.truckNumber ?? null,
        trailerNumber: dto.trailerNumber ?? null,
        carrierRate: dto.carrierRate ?? null,
        ...(dto.accessorialCosts !== undefined ? { accessorialCosts: dto.accessorialCosts } : {}),
        ...(dto.fuelAdvance !== undefined ? { fuelAdvance: dto.fuelAdvance } : {}),
        equipmentType: dto.equipmentType ?? null,
        equipmentLength: dto.equipmentLength ?? null,
        equipmentWeightLimit: dto.equipmentWeightLimit ?? null,
        dispatchNotes: dto.dispatchNotes ?? null,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
        stops: { orderBy: { stopSequence: 'asc' } },
      },
    });

    // Link order stops to this load (stops belong to orders; loads reference them via loadId)
    if (dto.orderId) {
      await this.prisma.stop.updateMany({
        where: {
          orderId: dto.orderId,
          tenantId,
          loadId: null,
          deletedAt: null,
        },
        data: { loadId: load.id },
      });
    }

    this.eventEmitter.emit('load.created', {
      loadId: load.id,
      loadNumber: load.loadNumber,
      orderId: load.orderId,
      tenantId,
    });

    return load;
  }

  async findAll(tenantId: string, query: LoadQueryDto) {
    const { page = 1, limit = 20, status, carrierId, orderId, dispatcherId, search, fromDate, toDate, equipmentType } = query;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }
    if (carrierId) where.carrierId = carrierId;
    if (orderId) where.orderId = orderId;
    if (dispatcherId) where.createdById = dispatcherId;
    if (equipmentType) where.equipmentType = equipmentType;
    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate ? { gte: new Date(fromDate) } : {}),
        ...(toDate ? { lte: new Date(toDate) } : {}),
      };
    }
    if (search) {
      where.OR = [
        { loadNumber: { contains: search, mode: 'insensitive' } },
        { order: { is: { orderNumber: { contains: search, mode: 'insensitive' } } } },
      ];
    }

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
              stops: {
                orderBy: { stopSequence: 'asc' },
                select: {
                  id: true,
                  city: true,
                  state: true,
                  stopType: true,
                  appointmentDate: true,
                  stopSequence: true
                }
              }
            }
          },
          carrier: { select: { id: true, legalName: true, mcNumber: true } },
        },
      }),
      this.prisma.load.count({ where }),
    ]);

    // Map to flat structure for UI
    const flattenedLoads = loads.map(load => {
      const stops = load.order?.stops || [];
      const pickup = stops.find((s: typeof stops[number]) => s.stopType === 'PICKUP') || stops[0];
      const delivery = stops.find((s: typeof stops[number]) => s.stopType === 'DELIVERY') || stops[stops.length - 1];

      return {
        ...load,
        originCity: pickup?.city,
        originState: pickup?.state,
        destinationCity: delivery?.city,
        destinationState: delivery?.state,
        pickupDate: pickup?.appointmentDate,
        deliveryDate: delivery?.appointmentDate,
      };
    });

    return {
      data: flattenedLoads,
      total,
      page,
      limit,
    };
  }

  async getStats(tenantId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalRevenueCents: number;
  }> {
    const [statusGroups, revenueResult] = await Promise.all([
      this.prisma.load.groupBy({
        by: ['status'],
        where: { tenantId, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        where: { tenantId, deletedAt: null, loads: { some: {} } },
        _sum: { totalCharges: true },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const group of statusGroups) {
      byStatus[group.status] = group._count.id;
      total += group._count.id;
    }

    const totalRevenueCents = Math.round(
      Number(revenueResult._sum.totalCharges ?? 0) * 100,
    );

    return { total, byStatus, totalRevenueCents };
  }

  async findOne(tenantId: string, id: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        order: {
          include: {
            customer: true,
            stops: { orderBy: { stopSequence: 'asc' } },
          },
        },
        carrier: true,
        stops: { orderBy: { stopSequence: 'asc' } },
        checkCalls: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    return load;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateLoadDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
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
        deliveredAt: dto.status === 'DELIVERED' ? new Date() : undefined,
        updatedAt: new Date(),
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    if (dto.status && dto.status !== load.status) {
      await this.recordStatusHistory(tenantId, id, load.status, dto.status, userId, 'Status updated');

      this.eventEmitter.emit('load.status.changed', {
        loadId: id,
        oldStatus: load.status,
        newStatus: dto.status,
        tenantId,
      });

      if (dto.status === 'DELIVERED') {
        const actualDelivery = updated.deliveredAt ?? new Date();
        this.eventEmitter.emit('load.delivered', {
          loadId: id,
          orderId: load.orderId,
          actualDelivery,
          tenantId,
        });
      }
    }

    return updated;
  }

  async assignCarrier(tenantId: string, id: string, userId: string, dto: AssignCarrierDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
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
        status: 'ACCEPTED',
        updatedAt: new Date(),
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true, dotNumber: true } },
      },
    });

    await this.recordStatusHistory(tenantId, id, load.status, 'ACCEPTED', userId, 'Carrier assigned');

    this.eventEmitter.emit('load.assigned', {
      loadId: id,
      carrierId: dto.carrierId,
      carrierRate: dto.carrierRate,
      tenantId,
    });

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: load.status,
      newStatus: 'ACCEPTED',
      tenantId,
    });

    return updated;
  }

  async dispatch(tenantId: string, id: string, userId: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!this.isValidStatusTransition(load.status, 'DISPATCHED')) {
      throw new BadRequestException(`Cannot dispatch from status ${load.status}`);
    }

    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
        updatedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordStatusHistory(tenantId, id, load.status, 'DISPATCHED', userId, 'Load dispatched');

    this.eventEmitter.emit('load.dispatched', {
      loadId: id,
      carrierId: load.carrierId,
      driverId: null,
      tenantId,
    });

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: load.status,
      newStatus: 'DISPATCHED',
      tenantId,
    });
    return updated;
  }

  async updateStatus(tenantId: string, id: string, userId: string, status: string, notes?: string) {
    const load = await this.prisma.load.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!this.isValidStatusTransition(load.status, status)) {
      throw new BadRequestException(`Cannot transition from ${load.status} to ${status}`);
    }

    const deliveryTimestamp = status === 'DELIVERED' ? new Date() : undefined;

    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        status,
        deliveredAt: deliveryTimestamp,
        updatedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordStatusHistory(tenantId, id, load.status, status, userId, notes);

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: load.status,
      newStatus: status,
      tenantId,
    });

    if (status === 'DELIVERED') {
      const actualDelivery = deliveryTimestamp ?? updated.deliveredAt ?? new Date();
      this.eventEmitter.emit('load.delivered', {
        loadId: id,
        orderId: load.orderId,
        actualDelivery,
        tenantId,
      });
    }
    return updated;
  }

  async updateLocation(tenantId: string, id: string, dto: UpdateLoadLocationDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
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

  async addCheckCall(tenantId: string, loadId: string, userId: string, data: CreateCheckCallDto) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const checkCall = await this.prisma.checkCall.create({
      data: {
        tenantId,
        loadId,
        latitude: data.lat,
        longitude: data.lng,
        city: data.city,
        state: data.state,
        status: data.status,
        notes: data.notes,
        eta: data.eta ? new Date(data.eta) : null,
        createdAt: data.timestamp ? new Date(data.timestamp) : undefined,
        createdById: userId,
      },
    });

    // Update load's current location
    await this.prisma.load.update({
      where: { id: loadId },
      data: {
        currentLocationLat: data.lat,
        currentLocationLng: data.lng,
        currentCity: data.city,
        currentState: data.state,
        eta: data.eta ? new Date(data.eta) : undefined,
        lastTrackingUpdate: new Date(),
      },
    });

    this.eventEmitter.emit('check-call.received', {
      loadId,
      location: {
        lat: data.lat,
        lng: data.lng,
        city: data.city,
        state: data.state,
      },
      eta: data.eta ? new Date(data.eta) : null,
      tenantId,
    });

    return checkCall;
  }

  async getCheckCalls(tenantId: string, loadId: string, params: PaginationDto) {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const [data, total] = await Promise.all([
      this.prisma.checkCall.findMany({
        where: { loadId, tenantId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.checkCall.count({ where: { loadId, tenantId, deletedAt: null } }),
    ]);

    return { data, total, page, limit };
  }

  async generateRateConfirmation(
    tenantId: string,
    loadId: string,
    options: RateConfirmationOptionsDto,
    _userId: string,
  ): Promise<Buffer> {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
      include: {
        order: {
          include: { customer: true },
        },
        carrier: true,
        stops: { orderBy: { stopSequence: 'asc' } },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!load.carrierId) {
      throw new BadRequestException('Load must be assigned to a carrier');
    }

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(20).text('RATE CONFIRMATION', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Load #: ${load.loadNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text('CARRIER INFORMATION', { underline: true });
    doc.text(`Company: ${load.carrier?.legalName || ''}`);
    doc.text(`MC#: ${load.carrier?.mcNumber || ''}`);
    doc.moveDown();

    doc.text('RATE DETAILS', { underline: true });
    doc.text(`Line Haul: $${load.carrierRate?.toFixed(2) || '0.00'}`);
    if (options.includeAccessorials) {
      doc.text(`Accessorials: $${load.accessorialCosts?.toFixed(2) || '0.00'}`);
      doc.text(`Fuel Advance: $${load.fuelAdvance?.toFixed(2) || '0.00'}`);
    }
    doc.moveDown();

    doc.text('STOPS', { underline: true });
    for (const stop of load.stops) {
      doc.text(`${stop.stopType}: ${stop.facilityName || ''}`);
      doc.text(`  ${stop.addressLine1 || ''}, ${stop.city || ''}, ${stop.state || ''} ${stop.postalCode || ''}`);
      doc.text(
        `  Appointment: ${stop.appointmentDate ? stop.appointmentDate.toDateString() : ''} ${stop.appointmentTimeStart || ''}`,
      );
      doc.moveDown(0.5);
    }

    if (options.customMessage) {
      doc.moveDown();
      doc.text(options.customMessage);
    }

    if (options.includeTerms) {
      doc.addPage();
      doc.text('TERMS AND CONDITIONS', { underline: true });
      doc.fontSize(10);
      doc.text('Standard carrier terms and conditions apply.');
    }

    doc.moveDown(2);
    doc.text('_________________________________');
    doc.text('Carrier Signature                Date');

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async getLoadBoard(tenantId: string, options: {
    status?: string[];
    region?: string;
  } = {}) {
    const { status = ['PENDING', 'ASSIGNED', 'IN_TRANSIT'] } = options;

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

  async delete(tenantId: string, id: string, userId: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!['PENDING', 'CANCELLED'].includes(load.status)) {
      throw new BadRequestException('Only pending or cancelled loads can be deleted');
    }

    await this.prisma.load.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: load.status === 'CANCELLED' ? load.status : 'CANCELLED',
        updatedById: userId,
      },
    });

    await this.recordStatusHistory(tenantId, id, load.status, 'CANCELLED', userId, 'Load cancelled');

    return { success: true, message: 'Load deleted successfully' };
  }

  private async recordStatusHistory(
    tenantId: string,
    loadId: string,
    oldStatus: string | null,
    newStatus: string,
    userId: string,
    notes?: string,
  ) {
    await this.prisma.statusHistory.create({
      data: {
        tenantId,
        entityType: 'LOAD',
        entityId: loadId,
        loadId,
        oldStatus: oldStatus ?? undefined,
        newStatus,
        notes,
        createdById: userId,
      },
    });
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
      PENDING: ['TENDERED', 'ACCEPTED', 'CANCELLED'],
      TENDERED: ['ACCEPTED', 'CANCELLED'],
      ACCEPTED: ['DISPATCHED', 'CANCELLED'],
      DISPATCHED: ['AT_PICKUP', 'IN_TRANSIT', 'CANCELLED'],
      AT_PICKUP: ['PICKED_UP', 'IN_TRANSIT'],
      PICKED_UP: ['IN_TRANSIT'],
      IN_TRANSIT: ['AT_DELIVERY', 'DELIVERED', 'CANCELLED'],
      AT_DELIVERY: ['DELIVERED', 'IN_TRANSIT'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    return transitions[current]?.includes(next) || false;
  }
}
