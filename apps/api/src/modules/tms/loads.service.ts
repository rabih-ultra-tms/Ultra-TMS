import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { EmailService } from '../communication/email.service';
import PDFDocument from 'pdfkit';
import { CreateLoadDto, UpdateLoadDto, AssignCarrierDto, UpdateLoadLocationDto, LoadQueryDto, CreateCheckCallDto, PaginationDto, RateConfirmationOptionsDto, BolOptionsDto, TenderLoadDto, RejectTenderDto } from './dto';

@Injectable()
export class LoadsService {
  private readonly logger = new Logger(LoadsService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
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
      // Revenue: sum of totalCharges on orders that have at least one load (customer-billed revenue)
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

  async sendRateConfirmation(
    tenantId: string,
    loadId: string,
    options: RateConfirmationOptionsDto,
    userId: string,
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
      include: { carrier: true },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!load.carrierId || !load.carrier) {
      throw new BadRequestException('Load must be assigned to a carrier');
    }

    const carrierEmail = load.carrier.dispatchEmail || load.carrier.primaryContactEmail;
    if (!carrierEmail) {
      throw new BadRequestException(
        'Carrier has no dispatch or primary contact email on file',
      );
    }

    const pdfBuffer = await this.generateRateConfirmation(tenantId, loadId, options, userId);

    const result = await this.emailService.send(tenantId, userId, {
      subject: `Rate Confirmation - Load ${load.loadNumber}`,
      body: `Please find attached the rate confirmation for Load ${load.loadNumber}. Please review, sign, and return at your earliest convenience.`,
      bodyHtml: `<p>Please find attached the rate confirmation for Load <strong>${load.loadNumber}</strong>.</p><p>Please review, sign, and return at your earliest convenience.</p>`,
      recipientEmail: carrierEmail,
      recipientName: load.carrier.legalName,
      recipientType: 'CARRIER',
      recipientId: load.carrierId,
      entityType: 'LOAD',
      entityId: loadId,
      attachments: [
        {
          name: `rate-confirmation-${load.loadNumber}.pdf`,
          url: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
          mimeType: 'application/pdf',
        },
      ],
    });

    if (result.success) {
      await this.prisma.load.update({
        where: { id: loadId },
        data: { rateConfirmationSent: true },
      });

      this.logger.log(
        `Rate confirmation sent for load ${load.loadNumber} to ${carrierEmail}`,
      );
    }

    return {
      success: result.success,
      logId: result.logId,
      error: result.error,
    };
  }

  async generateBolPdf(
    tenantId: string,
    loadId: string,
    options: BolOptionsDto,
  ): Promise<Buffer> {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
      include: {
        order: {
          include: {
            customer: true,
            items: { where: { deletedAt: null } },
          },
        },
        carrier: true,
        stops: { where: { deletedAt: null }, orderBy: { stopSequence: 'asc' } },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const stops = load.stops ?? [];
    const pickupStops = stops.filter((s) => s.stopType === 'PICKUP');
    const deliveryStops = stops.filter((s) => s.stopType === 'DELIVERY');
    const order = load.order;
    const items = order?.items ?? [];

    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // ── Header ──
    doc.fontSize(16).font('Helvetica-Bold').text('BILL OF LADING', { align: 'center' });
    doc.fontSize(9).font('Helvetica').text('STRAIGHT BILL OF LADING — SHORT FORM', { align: 'center' });
    doc.moveDown(0.5);

    // Reference numbers
    const refY = doc.y;
    doc.fontSize(9);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 40, refY);
    doc.text(`Load #: ${load.loadNumber}`, 250, refY);
    if (order?.bolNumber) doc.text(`BOL #: ${order.bolNumber}`, 400, refY);
    doc.y = refY + 15;
    if (order?.orderNumber) doc.text(`Order #: ${order.orderNumber}`, 40);
    if (order?.poNumber) doc.text(`PO #: ${order.poNumber}`, 250);
    doc.moveDown(0.5);

    // Divider
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Shipper / Consignee side-by-side ──
    const sectionTop = doc.y;

    // Shipper (left)
    doc.fontSize(10).font('Helvetica-Bold').text('SHIPPER', 40, sectionTop);
    doc.font('Helvetica').fontSize(9);
    const shipper = pickupStops[0];
    if (shipper) {
      doc.text(shipper.facilityName || '', 40, sectionTop + 14);
      doc.text(shipper.addressLine1 || '', 40);
      if (shipper.addressLine2) doc.text(shipper.addressLine2, 40);
      doc.text(`${shipper.city || ''}, ${shipper.state || ''} ${shipper.postalCode || ''}`, 40);
      if (shipper.contactName) doc.text(`Contact: ${shipper.contactName}`, 40);
      if (shipper.contactPhone) doc.text(`Phone: ${shipper.contactPhone}`, 40);
    }

    // Consignee (right)
    doc.fontSize(10).font('Helvetica-Bold').text('CONSIGNEE', 310, sectionTop);
    doc.font('Helvetica').fontSize(9);
    const consignee = deliveryStops[0];
    if (consignee) {
      doc.text(consignee.facilityName || '', 310, sectionTop + 14);
      doc.text(consignee.addressLine1 || '', 310);
      if (consignee.addressLine2) doc.text(consignee.addressLine2, 310);
      doc.text(`${consignee.city || ''}, ${consignee.state || ''} ${consignee.postalCode || ''}`, 310);
      if (consignee.contactName) doc.text(`Contact: ${consignee.contactName}`, 310);
      if (consignee.contactPhone) doc.text(`Phone: ${consignee.contactPhone}`, 310);
    }

    // Move past both columns
    doc.y = Math.max(doc.y, sectionTop + 90);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Carrier info ──
    doc.fontSize(10).font('Helvetica-Bold').text('CARRIER');
    doc.font('Helvetica').fontSize(9);
    doc.text(`Name: ${load.carrier?.legalName || 'N/A'}`);
    if (load.carrier?.mcNumber) doc.text(`MC #: ${load.carrier.mcNumber}`);
    if (load.carrier?.dotNumber) doc.text(`DOT #: ${load.carrier.dotNumber}`);
    if (load.driverName) doc.text(`Driver: ${load.driverName}`);
    if (load.truckNumber) doc.text(`Truck #: ${load.truckNumber}`);
    if (load.trailerNumber) doc.text(`Trailer #: ${load.trailerNumber}`);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Commodity table ──
    doc.fontSize(10).font('Helvetica-Bold').text('COMMODITY DESCRIPTION');
    doc.moveDown(0.3);

    // Table header
    const tableX = 40;
    const colWidths = { qty: 50, desc: 200, weight: 70, class: 60, nmfc: 70, hazmat: 82 };
    const headerY = doc.y;
    doc.fontSize(8).font('Helvetica-Bold');
    let cx = tableX;
    doc.text('QTY', cx, headerY, { width: colWidths.qty });
    cx += colWidths.qty;
    doc.text('DESCRIPTION', cx, headerY, { width: colWidths.desc });
    cx += colWidths.desc;
    doc.text('WEIGHT (LBS)', cx, headerY, { width: colWidths.weight });
    cx += colWidths.weight;
    doc.text('CLASS', cx, headerY, { width: colWidths.class });
    cx += colWidths.class;
    doc.text('NMFC #', cx, headerY, { width: colWidths.nmfc });
    cx += colWidths.nmfc;
    doc.text('HAZMAT', cx, headerY, { width: colWidths.hazmat });

    doc.moveTo(tableX, headerY + 12).lineTo(572, headerY + 12).stroke();

    // Table rows
    doc.font('Helvetica').fontSize(8);
    let rowY = headerY + 16;

    if (items.length > 0) {
      for (const item of items) {
        cx = tableX;
        doc.text(String(item.quantity ?? 1), cx, rowY, { width: colWidths.qty });
        cx += colWidths.qty;
        doc.text(item.description || '', cx, rowY, { width: colWidths.desc });
        cx += colWidths.desc;
        doc.text(item.weightLbs ? Number(item.weightLbs).toFixed(0) : '', cx, rowY, { width: colWidths.weight });
        cx += colWidths.weight;
        doc.text(item.commodityClass || '', cx, rowY, { width: colWidths.class });
        cx += colWidths.class;
        doc.text(item.nmfcCode || '', cx, rowY, { width: colWidths.nmfc });
        cx += colWidths.nmfc;
        doc.text(item.isHazmat ? `Yes (${item.hazmatClass || ''})` : 'No', cx, rowY, { width: colWidths.hazmat });
        rowY += 14;
      }
    } else {
      // Fallback: use order-level commodity data
      cx = tableX;
      doc.text(String(order?.pieceCount ?? ''), cx, rowY, { width: colWidths.qty });
      cx += colWidths.qty;
      doc.text(order?.commodity || 'General Freight', cx, rowY, { width: colWidths.desc });
      cx += colWidths.desc;
      doc.text(order?.weightLbs ? Number(order.weightLbs).toFixed(0) : '', cx, rowY, { width: colWidths.weight });
      cx += colWidths.weight;
      doc.text(order?.commodityClass || '', cx, rowY, { width: colWidths.class });
      cx += colWidths.class;
      doc.text('', cx, rowY, { width: colWidths.nmfc }); // no NMFC at order level
      cx += colWidths.nmfc;
      doc.text(order?.isHazmat ? `Yes (${order.hazmatClass || ''})` : 'No', cx, rowY, { width: colWidths.hazmat });
      rowY += 14;
    }

    // Totals row
    doc.moveTo(tableX, rowY).lineTo(572, rowY).stroke();
    rowY += 4;
    const totalWeight = items.length > 0
      ? items.reduce((sum, i) => sum + Number(i.weightLbs ?? 0) * (i.quantity ?? 1), 0)
      : Number(order?.weightLbs ?? 0);
    const totalPieces = items.length > 0
      ? items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
      : (order?.pieceCount ?? 0);
    doc.font('Helvetica-Bold').fontSize(8);
    doc.text(`Total: ${totalPieces} pcs`, tableX, rowY, { width: colWidths.qty + colWidths.desc });
    doc.text(`${totalWeight > 0 ? totalWeight.toFixed(0) : ''} lbs`, tableX + colWidths.qty + colWidths.desc, rowY);
    doc.y = rowY + 16;

    // ── Hazmat section ──
    if (options.includeHazmat && (order?.isHazmat || items.some((i) => i.isHazmat))) {
      doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).text('HAZARDOUS MATERIALS');
      doc.font('Helvetica').fontSize(9);
      doc.text('This shipment contains hazardous materials as described above.');
      doc.text('Emergency Contact: [See carrier safety documentation]');
      if (order?.hazmatClass) doc.text(`Hazmat Class: ${order.hazmatClass}`);
      const hazItems = items.filter((i) => i.isHazmat);
      for (const hi of hazItems) {
        const parts = [`Class: ${hi.hazmatClass || 'N/A'}`];
        if (hi.unNumber) parts.push(`UN#: ${hi.unNumber}`);
        doc.text(`  - ${hi.description}: ${parts.join(', ')}`);
      }
      doc.moveDown(0.5);
    }

    // ── Special instructions ──
    if (options.includeSpecialInstructions && order?.specialInstructions) {
      doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).text('SPECIAL INSTRUCTIONS');
      doc.font('Helvetica').fontSize(9).text(order.specialInstructions);
      doc.moveDown(0.5);
    }

    // ── Additional stops (multi-stop loads) ──
    if (stops.length > 2) {
      doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(10).text('ADDITIONAL STOPS');
      doc.font('Helvetica').fontSize(9);
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i]!;
        doc.text(
          `Stop ${i + 1} (${stop.stopType}): ${stop.facilityName || ''} — ${stop.city || ''}, ${stop.state || ''}`,
        );
      }
      doc.moveDown(0.5);
    }

    // ── Signatures ──
    doc.moveTo(40, doc.y).lineTo(572, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(8);
    doc.text(
      'The carrier acknowledges receipt of the above-described commodities in apparent good order, except as noted.',
      40,
    );
    doc.moveDown(1);

    const sigY = doc.y;
    doc.text('Shipper Signature: _______________________________', 40, sigY);
    doc.text('Date: _______________', 340, sigY);
    doc.moveDown(1.5);
    const sigY2 = doc.y;
    doc.text('Carrier Signature: _______________________________', 40, sigY2);
    doc.text('Date: _______________', 340, sigY2);
    doc.moveDown(1.5);
    const sigY3 = doc.y;
    doc.text('Consignee Signature: _____________________________', 40, sigY3);
    doc.text('Date: _______________', 340, sigY3);

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

  async tenderLoad(tenantId: string, id: string, userId: string, dto: TenderLoadDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!['PENDING'].includes(load.status)) {
      throw new BadRequestException(
        `Cannot tender a load with status ${load.status}. Load must be in PENDING status.`,
      );
    }

    // Verify carrier exists and is not deleted
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: dto.carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    // Create the LoadTender record
    const tender = await this.prisma.loadTender.create({
      data: {
        tenantId,
        loadId: id,
        tenderType: 'DIRECT',
        tenderRate: dto.rate ?? load.carrierRate ?? 0,
        status: 'ACTIVE',
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdById: userId,
        recipients: {
          create: {
            tenantId,
            carrierId: dto.carrierId,
            position: 1,
            status: 'PENDING',
            offeredAt: new Date(),
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
            createdById: userId,
          },
        },
      },
    });

    // Update load status to TENDERED and assign the carrier
    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        status: 'TENDERED',
        carrierId: dto.carrierId,
        carrierRate: dto.rate ?? load.carrierRate,
        dispatchNotes: dto.notes
          ? [load.dispatchNotes, `Tender note: ${dto.notes}`].filter(Boolean).join('\n')
          : load.dispatchNotes,
        updatedAt: new Date(),
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    await this.recordStatusHistory(tenantId, id, load.status, 'TENDERED', userId, dto.notes ?? 'Load tendered to carrier');

    this.eventEmitter.emit('load.tendered', {
      loadId: id,
      carrierId: dto.carrierId,
      tenderId: tender.id,
      tenantId,
    });

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: load.status,
      newStatus: 'TENDERED',
      tenantId,
    });

    return { ...updated, tenderId: tender.id };
  }

  async acceptTender(tenantId: string, id: string, userId: string) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (load.status !== 'TENDERED') {
      throw new BadRequestException(
        `Cannot accept a load with status ${load.status}. Load must be in TENDERED status.`,
      );
    }

    // Update the active tender record
    const activeTender = await this.prisma.loadTender.findFirst({
      where: { loadId: id, tenantId, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (activeTender) {
      await this.prisma.loadTender.update({
        where: { id: activeTender.id },
        data: {
          status: 'ACCEPTED',
          acceptedByCarrierId: load.carrierId,
          acceptedAt: new Date(),
          updatedById: userId,
        },
      });

      // Update the tender recipient record
      await this.prisma.tenderRecipient.updateMany({
        where: {
          tenderId: activeTender.id,
          carrierId: load.carrierId ?? undefined,
          status: 'PENDING',
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          updatedById: userId,
        },
      });
    }

    // Update load status to ACCEPTED
    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        updatedAt: new Date(),
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    await this.recordStatusHistory(tenantId, id, 'TENDERED', 'ACCEPTED', userId, 'Tender accepted by carrier');

    this.eventEmitter.emit('load.tender.accepted', {
      loadId: id,
      carrierId: load.carrierId,
      tenantId,
    });

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: 'TENDERED',
      newStatus: 'ACCEPTED',
      tenantId,
    });

    return updated;
  }

  async rejectTender(tenantId: string, id: string, userId: string, dto: RejectTenderDto) {
    const load = await this.prisma.load.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (load.status !== 'TENDERED') {
      throw new BadRequestException(
        `Cannot reject a load with status ${load.status}. Load must be in TENDERED status.`,
      );
    }

    // Update the active tender record
    const activeTender = await this.prisma.loadTender.findFirst({
      where: { loadId: id, tenantId, status: 'ACTIVE', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (activeTender) {
      await this.prisma.loadTender.update({
        where: { id: activeTender.id },
        data: {
          status: 'REJECTED',
          updatedById: userId,
        },
      });

      // Update the tender recipient record
      await this.prisma.tenderRecipient.updateMany({
        where: {
          tenderId: activeTender.id,
          carrierId: load.carrierId ?? undefined,
          status: 'PENDING',
        },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
          declineReason: dto.reason,
          updatedById: userId,
        },
      });
    }

    // Set load back to PENDING, clear carrier assignment
    const updated = await this.prisma.load.update({
      where: { id },
      data: {
        status: 'PENDING',
        carrierId: null,
        updatedAt: new Date(),
        updatedById: userId,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    const reason = dto.reason ? `Tender rejected: ${dto.reason}` : 'Tender rejected by carrier';
    await this.recordStatusHistory(tenantId, id, 'TENDERED', 'PENDING', userId, reason);

    this.eventEmitter.emit('load.tender.rejected', {
      loadId: id,
      carrierId: load.carrierId,
      reason: dto.reason,
      tenantId,
    });

    this.eventEmitter.emit('load.status.changed', {
      loadId: id,
      oldStatus: 'TENDERED',
      newStatus: 'PENDING',
      tenantId,
    });

    return updated;
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
      TENDERED: ['ACCEPTED', 'PENDING', 'CANCELLED'],
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
