import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateLocationDto, UpdateLocationDto } from '../dto/hr.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.location.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async create(tenantId: string, dto: CreateLocationDto) {
    return this.prisma.location.create({
      data: {
        tenantId,
        locationCode: dto.locationCode,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        country: dto.country,
        phone: dto.phone,
        timezone: dto.timezone,
        isHeadquarters: dto.isHeadquarters ?? false,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const location = await this.prisma.location.findFirst({ where: { id, tenantId } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async update(tenantId: string, id: string, dto: UpdateLocationDto) {
    await this.findOne(tenantId, id);
    return this.prisma.location.update({
      where: { id },
      data: {
        locationCode: dto.locationCode,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        country: dto.country,
        phone: dto.phone,
        timezone: dto.timezone,
        isHeadquarters: dto.isHeadquarters,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.location.delete({ where: { id } });
    return { deleted: true };
  }
}
