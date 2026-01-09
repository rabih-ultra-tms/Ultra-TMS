import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStopDto, UpdateStopDto } from './dto';

@Injectable()
export class StopsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, orderId: string, dto: CreateStopDto) {
    // Verify order exists
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const stop = await this.prisma.stop.create({
      data: {
        tenantId,
        orderId,
        stopType: dto.stopType,
        stopSequence: dto.stopSequence,
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
        appointmentTimeStart: dto.appointmentStart || null,
        appointmentTimeEnd: dto.appointmentEnd || null,
        specialInstructions: dto.instructions,
      },
    });

    return stop;
  }

  async findAllForOrder(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const stops = await this.prisma.stop.findMany({
      where: { orderId },
      orderBy: { stopSequence: 'asc' },
    });

    return stops;
  }

  async findOne(tenantId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
      },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    return stop;
  }

  async update(tenantId: string, id: string, dto: UpdateStopDto) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        stopType: dto.stopType,
        stopSequence: dto.stopSequence,
        facilityName: dto.facilityName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactEmail: dto.contactEmail,
        appointmentTimeStart: dto.appointmentStart,
        appointmentTimeEnd: dto.appointmentEnd,
        specialInstructions: dto.instructions,
        status: dto.status,
        arrivedAt: dto.arrivedAt ? new Date(dto.arrivedAt) : undefined,
        departedAt: dto.departedAt ? new Date(dto.departedAt) : undefined,
      },
    });

    return updated;
  }

  async markArrived(tenantId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (stop.arrivedAt) {
      throw new BadRequestException('Stop already marked as arrived');
    }

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        status: stop.stopType === 'PICKUP' ? 'AT_PICKUP' : 'AT_DELIVERY',
        arrivedAt: new Date(),
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: stop.orderId },
      data: {
        status: stop.stopType === 'PICKUP' ? 'AT_PICKUP' : 'AT_DELIVERY',
      },
    });

    return updated;
  }

  async markDeparted(tenantId: string, id: string, signedBy?: string, notes?: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId },
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

    const updated = await this.prisma.stop.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        departedAt: new Date(),
      },
    });

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
        },
      });
    } else {
      await this.prisma.order.update({
        where: { id: stop.orderId },
        data: {
          status: 'IN_TRANSIT',
        },
      });
    }

    return updated;
  }

  async reorder(tenantId: string, orderId: string, stopIds: string[]) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update sequence for each stop
    const updates = stopIds.map((stopId, index) =>
      this.prisma.stop.update({
        where: { id: stopId },
        data: { stopSequence: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    // Return updated stops
    return this.findAllForOrder(tenantId, orderId);
  }

  async delete(tenantId: string, id: string) {
    const stop = await this.prisma.stop.findFirst({
      where: { id, tenantId },
      include: { order: true },
    });

    if (!stop) {
      throw new NotFoundException('Stop not found');
    }

    if (stop.arrivedAt) {
      throw new BadRequestException('Cannot delete a stop that has been arrived at');
    }

    await this.prisma.stop.delete({ where: { id } });

    // Re-sequence remaining stops
    const remainingStops = await this.prisma.stop.findMany({
      where: { orderId: stop.orderId },
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
}
