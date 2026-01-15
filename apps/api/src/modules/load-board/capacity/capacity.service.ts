import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { GeocodingService } from '../services/geocoding.service';
import { ContactResultDto, CapacitySearchDto, SearchQueryDto } from './dto';
import {
  calculateDistance,
  getBoundingBox,
  isWithinRadius,
  Coordinates,
} from '../../../common/utils/geo.utils';

@Injectable()
export class CapacityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async search(tenantId: string, userId: string, dto: CapacitySearchDto) {
    const account = await this.prisma.loadBoardAccount.findFirst({
      where: { id: dto.accountId, tenantId, deletedAt: null },
    });

    if (!account) {
      throw new NotFoundException('Load board account not found');
    }

    let originState = dto.originState;
    let destinationState = dto.destinationState;
    let equipmentTypes = dto.equipmentTypes ?? [];
    let originCoords: Coordinates | null = null;
    let destCoords: Coordinates | null = null;

    if (dto.originCity && dto.originState) {
      originCoords = await this.geocodingService.getCoordinates(dto.originCity, dto.originState);
    }

    if (dto.destinationCity && dto.destinationState) {
      destCoords = await this.geocodingService.getCoordinates(dto.destinationCity, dto.destinationState);
    }

    if (dto.relatedLoadId) {
      const load = await this.prisma.load.findFirst({
        where: { id: dto.relatedLoadId, tenantId },
        include: {
          order: { include: { stops: { orderBy: { stopSequence: 'asc' } } } },
        },
      });

      if (load?.order?.stops?.length) {
        const pickup = load.order.stops.find((s: any) => s.stopType === 'PICKUP') ?? load.order.stops[0];
        const delivery = load.order.stops.slice(-1)[0];
        originState = originState ?? pickup?.state;
        destinationState = destinationState ?? delivery?.state;
        if (!equipmentTypes.length && load.equipmentType) {
          equipmentTypes = [load.equipmentType];
        }

        if (!originCoords && pickup?.latitude && pickup?.longitude) {
          originCoords = { latitude: Number(pickup.latitude), longitude: Number(pickup.longitude) };
        } else if (!originCoords && pickup?.city && pickup?.state) {
          originCoords = await this.geocodingService.getCoordinates(pickup.city, pickup.state);
        }

        if (!destCoords && delivery?.latitude && delivery?.longitude) {
          destCoords = { latitude: Number(delivery.latitude), longitude: Number(delivery.longitude) };
        } else if (!destCoords && delivery?.city && delivery?.state) {
          destCoords = await this.geocodingService.getCoordinates(delivery.city, delivery.state);
        }
      }
    }

    if (!originState || !destinationState) {
      throw new BadRequestException('originState and destinationState are required');
    }

    if (!equipmentTypes.length) {
      throw new BadRequestException('equipmentTypes is required');
    }

    const equipmentType = equipmentTypes[0] as string;

    const search = await this.prisma.capacitySearch.create({
      data: {
        tenantId,
        accountId: dto.accountId,
        searchNumber: this.generateSearchNumber(),
        originCity: dto.originCity,
        originState,
        originRadius: dto.originRadiusMiles,
        destCity: dto.destinationCity,
        destState: destinationState,
        destRadius: dto.destinationRadiusMiles,
        equipmentType,
        availableDate: dto.availableDateFrom ?? new Date(),
        customFields: {
          availableDateTo: dto.availableDateTo,
          equipmentTypes,
          originCoords,
          destCoords,
          relatedLoadId: dto.relatedLoadId,
        } as Prisma.InputJsonValue,
        createdById: userId,
      },
    });

    const internalResults = await this.searchInternalCapacity(
      tenantId,
      originCoords,
      dto.originRadiusMiles || 100,
      equipmentType,
      dto.availableDateFrom,
    );

    await this.prisma.capacitySearch.update({
      where: { id: search.id },
      data: {
        resultCount: internalResults.length,
      },
    });

    return {
      ...search,
      results: internalResults,
    };
  }

  private async searchInternalCapacity(
    tenantId: string,
    originCoords: Coordinates | null,
    originRadius: number,
    equipmentType?: string,
    availableDate?: Date,
  ) {
    const where: any = {
      tenantId,
      status: 'AVAILABLE',
    };

    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    if (availableDate) {
      where.effectiveDate = { lte: availableDate };
    }

    if (originCoords) {
      const bbox = getBoundingBox(originCoords, originRadius);
      where.lat = { gte: bbox.minLat, lte: bbox.maxLat };
      where.lng = { gte: bbox.minLng, lte: bbox.maxLng };
    }

    let capacity = await this.prisma.carrierCapacity.findMany({
      where,
      include: {
        carrier: {
          select: {
            id: true,
            legalName: true,
            mcNumber: true,
            dotNumber: true,
            dispatchPhone: true,
            avgRating: true,
            qualificationTier: true,
          },
        },
      },
    });

    if (originCoords) {
      capacity = capacity.filter((c) => {
        if (!c.lat || !c.lng) return false;
        return isWithinRadius(
          originCoords,
          { latitude: Number(c.lat), longitude: Number(c.lng) },
          originRadius,
        );
      });
    }

    return capacity
      .map((c) => ({
        ...c,
        distance: originCoords && c.lat && c.lng
          ? calculateDistance(originCoords, { latitude: Number(c.lat), longitude: Number(c.lng) })
          : null,
      }))
      .sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  async list(tenantId: string, query: SearchQueryDto) {
    const { accountId, status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };
    if (accountId) where.accountId = accountId;
    if (status) where.customFields = { contains: status };

    const [data, total] = await Promise.all([
      this.prisma.capacitySearch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.capacitySearch.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const search = await this.prisma.capacitySearch.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { results: true },
    });

    if (!search) {
      throw new NotFoundException('Capacity search not found');
    }

    return search;
  }

  async contactResult(tenantId: string, id: string, dto: ContactResultDto) {
    const result = await this.prisma.capacityResult.findFirst({
      where: { id, tenantId },
    });

    if (!result) {
      throw new NotFoundException('Capacity result not found');
    }

    return this.prisma.capacityResult.update({
      where: { id },
      data: {
        contacted: dto.contacted ?? true,
        contactedAt: new Date(),
        interested: dto.interested,
        notes: dto.notes,
      },
    });
  }

  private generateSearchNumber() {
    return `CS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
