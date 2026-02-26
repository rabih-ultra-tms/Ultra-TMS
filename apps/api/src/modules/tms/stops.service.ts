import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { CreateStopDto, UpdateStopDto } from './dto';

@Injectable()
export class StopsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, orderId: string, userId: string, dto: CreateStopDto) {
    // Verify order exists
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const stop = await this.prisma.stop.create({
      data: {
        tenantId,
        orderId,
        stopType: dto.stopType,
        stopSequence: dto.stopSequence || 1,
        status: 'PENDING',
        facilityName: dto.facilityName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'USA',
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        appointmentRequired: dto.appointmentRequired ?? false,
        appointmentDate: dto.appointmentDate ? new Date(dto.appointmentDate) : null,
        appointmentTimeStart: dto.appointmentTimeStart,
        appointmentTimeEnd: dto.appointmentTimeEnd,
        specialInstructions: dto.specialInstructions,
        createdById: userId,
        updatedById: userId,
      },
    });

    return stop;
  }

  async findAllForOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const stops = await this.prisma.stop.findMany({
      where: { orderId, deletedAt: null },
      orderBy: { stopSequence: 'asc' },
    });

    return stops;
  }

  async findOne(tenantId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
      },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    return stop;
  }

  // TODO: Phase 1.2 - Implement stop update with UpdateStopDto
  async update(tenantId: string, userId: string, id: string, dto: UpdateStopDto) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        stopType: dto.stopType ?? stop.stopType,
        stopSequence: dto.stopSequence ?? stop.stopSequence,
        facilityName: dto.facilityName ?? stop.facilityName,
        addressLine1: dto.addressLine1 ?? stop.addressLine1,
        addressLine2: dto.addressLine2 ?? stop.addressLine2,
        city: dto.city ?? stop.city,
        state: dto.state ?? stop.state,
        postalCode: dto.postalCode ?? stop.postalCode,
        country: dto.country ?? (stop as any).country,
        contactName: dto.contactName ?? stop.contactName,
        contactPhone: dto.contactPhone ?? stop.contactPhone,
        contactEmail: dto.contactEmail ?? stop.contactEmail,
        appointmentRequired: dto.appointmentRequired ?? (stop as any).appointmentRequired,
        appointmentDate: dto.appointmentDate ? new Date(dto.appointmentDate) : stop.appointmentDate,
        appointmentTimeStart: dto.appointmentTimeStart ?? stop.appointmentTimeStart,
        appointmentTimeEnd: dto.appointmentTimeEnd ?? (stop as any).appointmentTimeEnd,
        specialInstructions: dto.specialInstructions ?? stop.specialInstructions,
        status: dto.status ?? stop.status,
        updatedById: userId,
      },
    });

    return updated;
  }

  async markArrived(tenantId: string, userId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (stop.arrivedAt) {
      throw new BadRequestException('Stop already marked as arrived');
    }

    const orderBefore = await this.prisma.order.findFirst({
      where: { id: stop.orderId, tenantId },
      select: { status: true },
    });

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        status: stop.stopType === 'PICKUP' ? 'AT_PICKUP' : 'AT_DELIVERY',
        arrivedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordStatusHistory(tenantId, 'STOP', id, stop.status, updated.status, userId, 'Arrived');

    // Update order status
    await this.prisma.order.update({
      where: { id: stop.orderId },
      data: {
        status: stop.stopType === 'PICKUP' ? 'AT_PICKUP' : 'AT_DELIVERY',
        updatedById: userId,
      },
    });

    if (orderBefore) {
      await this.recordStatusHistory(
        tenantId,
        'ORDER',
        stop.orderId,
        orderBefore.status,
        stop.stopType === 'PICKUP' ? 'AT_PICKUP' : 'AT_DELIVERY',
        userId,
        'Stop arrived',
      );
    }

    this.eventEmitter.emit('stop.arrived', {
      stopId: id,
      loadId: stop.loadId,
      arrivalTime: updated.arrivedAt,
      tenantId,
    });

    return updated;
  }

  async markDeparted(tenantId: string, userId: string, id: string, _signedBy?: string, _notes?: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (!stop.arrivedAt) {
      throw new BadRequestException('Stop must be marked as arrived first');
    }

    if (stop.departedAt) {
      throw new BadRequestException('Stop already marked as departed');
    }

    const orderBefore = await this.prisma.order.findFirst({
      where: { id: stop.orderId, tenantId },
      select: { status: true },
    });

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        departedAt: new Date(),
        updatedById: userId,
      },
    });

    await this.recordStatusHistory(tenantId, 'STOP', id, stop.status, 'COMPLETED', userId, 'Departed');

    // Check if this is the last stop
    const remainingStops = await this.prisma.stop.count({
      where: {
        orderId: stop.orderId,
        departedAt: null,
      },
    });

    // Update order status based on remaining stops
    if (remainingStops === 0) {
      await this.prisma.order.update({
        where: { id: stop.orderId },
        data: {
          status: 'DELIVERED',
          updatedById: userId,
        },
      });
    } else {
      await this.prisma.order.update({
        where: { id: stop.orderId },
        data: {
          status: 'IN_TRANSIT',
          updatedById: userId,
        },
      });
    }

    if (orderBefore) {
      const newOrderStatus = remainingStops === 0 ? 'DELIVERED' : 'IN_TRANSIT';
      await this.recordStatusHistory(
        tenantId,
        'ORDER',
        stop.orderId,
        orderBefore.status,
        newOrderStatus,
        userId,
        'Stop departed',
      );
    }

    this.eventEmitter.emit('stop.departed', {
      stopId: id,
      loadId: stop.loadId,
      departureTime: updated.departedAt,
      tenantId,
    });

    this.eventEmitter.emit('stop.completed', {
      stopId: id,
      loadId: stop.loadId,
      tenantId,
    });

    return updated;
  }

  async reorder(tenantId: string, userId: string, orderId: string, stopIds: string[]) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update sequence for each stop
    const updates = stopIds.map((stopId, index) =>
      this.prisma.stop.update({
        where: { id: stopId },
        data: { stopSequence: index + 1, updatedById: userId },
      })
    );

    await this.prisma.$transaction(updates);

    // Return updated stops
    return this.findAllForOrder(tenantId, orderId);
  }

  async delete(tenantId: string, userId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { order: true },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (stop.arrivedAt) {
      throw new BadRequestException('Cannot delete a stop that has been arrived at');
    }

    await this.prisma.stop.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: userId,
      },
    });

    // Re-sequence remaining stops
    const remainingStops = await this.prisma.stop.findMany({
      where: { orderId: stop.orderId, deletedAt: null },
      orderBy: { stopSequence: 'asc' },
    });

    const resequence = remainingStops.map((s, index) =>
      this.prisma.stop.update({
        where: { id: s.id },
        data: { stopSequence: index + 1 },
      })
    );

    await this.prisma.$transaction(resequence);

    return { success: true, message: 'Stop deleted successfully' };
  }

  private async recordStatusHistory(
    tenantId: string,
    entityType: 'STOP' | 'ORDER',
    entityId: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
    notes?: string,
  ) {
    await this.prisma.statusHistory.create({
      data: {
        tenantId,
        entityType,
        entityId,
        stopId: entityType === 'STOP' ? entityId : undefined,
        orderId: entityType === 'ORDER' ? entityId : undefined,
        oldStatus,
        newStatus,
        notes,
        createdById: userId,
      },
    });
  }
}
