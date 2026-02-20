import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  LocationHistoryDto,
  LocationHistoryQueryDto,
  TrackingMapFilterDto,
  TrackingPointDto,
} from './dto/tracking.dto';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getMapData(
    tenantId: string,
    filters: TrackingMapFilterDto,
  ): Promise<TrackingPointDto[]> {
    const where: any = {
      tenantId,
      deletedAt: null,
      status: { in: ['IN_TRANSIT', 'AT_PICKUP', 'AT_DELIVERY', 'DISPATCHED'] },
    };

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }
    if (filters.carrierId) {
      where.carrierId = filters.carrierId;
    }
    if (filters.customerId) {
      where.order = { customerId: filters.customerId };
    }

    const loads = await this.prisma.load.findMany({
      where,
      select: {
        id: true,
        loadNumber: true,
        status: true,
        currentLocationLat: true,
        currentLocationLng: true,
        lastTrackingUpdate: true,
        eta: true,
        carrier: { select: { id: true, legalName: true } },
        order: {
          select: {
            stops: {
              where: { deletedAt: null, status: { in: ['PENDING', 'EN_ROUTE'] } },
              orderBy: { stopSequence: 'asc' },
              take: 1,
              select: { stopType: true, city: true, state: true },
            },
          },
        },
      },
    });

    return loads
      .filter((load) => load.currentLocationLat && load.currentLocationLng)
      .map((load) => ({
        loadId: load.id,
        loadNumber: load.loadNumber,
        status: load.status,
        latitude: Number(load.currentLocationLat),
        longitude: Number(load.currentLocationLng),
        timestamp: load.lastTrackingUpdate || new Date(),
        eta: load.eta || undefined,
        carrier: load.carrier
          ? { id: load.carrier.id, name: load.carrier.legalName }
          : undefined,
        nextStop: load.order?.stops?.[0]
          ? {
              type: load.order.stops[0].stopType,
              city: load.order.stops[0].city,
              state: load.order.stops[0].state,
            }
          : undefined,
      }));
  }

  async getLocationHistory(
    tenantId: string,
    loadId: string,
    query: LocationHistoryQueryDto,
  ): Promise<LocationHistoryDto[]> {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    const where: any = { loadId };

    if (query.fromDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(query.fromDate) };
    }
    if (query.toDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(query.toDate) };
    }

    const checkCalls = await this.prisma.checkCall.findMany({
      where,
      select: {
        createdAt: true,
        latitude: true,
        longitude: true,
        status: true,
        notes: true,
      },
      orderBy: { createdAt: 'asc' },
      take: query.limit || 100,
    });

    return checkCalls
      .filter((cc) => cc.latitude && cc.longitude)
      .map((cc) => ({
        timestamp: cc.createdAt,
        latitude: Number(cc.latitude),
        longitude: Number(cc.longitude),
        eventType: cc.status || undefined,
        notes: cc.notes || undefined,
      }));
  }

  async getPublicTrackingByCode(trackingCode: string) {
    const load = await this.prisma.load.findFirst({
      where: {
        loadNumber: trackingCode,
        deletedAt: null,
      },
      select: {
        id: true,
        loadNumber: true,
        status: true,
        equipmentType: true,
        currentLocationLat: true,
        currentLocationLng: true,
        currentCity: true,
        currentState: true,
        lastTrackingUpdate: true,
        eta: true,
        dispatchedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        order: {
          select: {
            orderNumber: true,
            customer: {
              select: { name: true },
            },
            stops: {
              where: { deletedAt: null },
              orderBy: { stopSequence: 'asc' },
              select: {
                id: true,
                stopType: true,
                stopSequence: true,
                facilityName: true,
                city: true,
                state: true,
                postalCode: true,
                status: true,
                appointmentDate: true,
                appointmentTimeStart: true,
                appointmentTimeEnd: true,
                arrivedAt: true,
                departedAt: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });

    if (!load) {
      return null;
    }

    return {
      loadNumber: load.loadNumber,
      orderNumber: load.order?.orderNumber,
      status: load.status,
      equipmentType: load.equipmentType,
      customerName: load.order?.customer?.name,
      currentLocation: load.currentLocationLat && load.currentLocationLng
        ? {
            lat: Number(load.currentLocationLat),
            lng: Number(load.currentLocationLng),
            city: load.currentCity,
            state: load.currentState,
            updatedAt: load.lastTrackingUpdate,
          }
        : null,
      eta: load.eta,
      pickupDate: (load.order?.stops || []).find((s: { stopType: string }) => s.stopType === 'PICKUP')?.appointmentDate ?? null,
      deliveryDate: (load.order?.stops || []).find((s: { stopType: string }) => s.stopType === 'DELIVERY')?.appointmentDate ?? null,
      dispatchedAt: load.dispatchedAt,
      pickedUpAt: load.pickedUpAt,
      deliveredAt: load.deliveredAt,
      stops: (load.order?.stops || []).map((stop) => ({
        id: stop.id,
        type: stop.stopType,
        sequence: stop.stopSequence,
        facilityName: stop.facilityName,
        city: stop.city,
        state: stop.state,
        zip: stop.postalCode,
        status: stop.status,
        appointmentDate: stop.appointmentDate,
        appointmentTimeStart: stop.appointmentTimeStart,
        appointmentTimeEnd: stop.appointmentTimeEnd,
        arrivedAt: stop.arrivedAt,
        departedAt: stop.departedAt,
        location: stop.latitude && stop.longitude
          ? { lat: Number(stop.latitude), lng: Number(stop.longitude) }
          : null,
      })),
    };
  }
}
