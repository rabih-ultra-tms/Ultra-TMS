import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { ContactResultDto, CapacitySearchDto, SearchQueryDto } from './dto';

@Injectable()
export class CapacityService {
  constructor(private readonly prisma: PrismaService) {}

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
        },
        createdById: userId,
      },
    });

    return search;
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
