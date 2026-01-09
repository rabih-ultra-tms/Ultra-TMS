import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateDriverDto,
  UpdateDriverDto,
  UpdateDriverLocationDto,
  DriverListQueryDto,
} from './dto/driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: DriverListQueryDto) {
    const {
      page = 1,
      limit = 20,
      status,
      availability,
      search,
      expiringSoon,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (availability) {
      where.availability = availability;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { cdlNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.OR = [
        { cdlExpiration: { lte: thirtyDaysFromNow } },
        { medicalCardExpiration: { lte: thirtyDaysFromNow } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          carrier: {
            select: { id: true, legalName: true, mcNumber: true },
          },
        },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCarrier(
    tenantId: string,
    carrierId: string,
    query: DriverListQueryDto
  ) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const { page = 1, limit = 20, status, availability, search } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      carrierId,
      tenantId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (availability) {
      where.availability = availability;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { cdlNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        carrier: {
          select: {
            id: true,
            legalName: true,
            mcNumber: true,
            dotNumber: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async create(tenantId: string, carrierId: string, dto: CreateDriverDto) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const driver = await this.prisma.driver.create({
      data: {
        ...dto,
        tenantId,
        carrierId,
        cdlExpiration: new Date(dto.cdlExpiration),
        medicalCardExpiration: dto.medicalCardExpiration
          ? new Date(dto.medicalCardExpiration)
          : undefined,
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
    });

    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.findOne(tenantId, id);

    const { cdlExpiration, medicalCardExpiration, ...updateData } = dto;

    const updated = await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        ...updateData,
        ...(cdlExpiration && { cdlExpiration: new Date(cdlExpiration) }),
        ...(medicalCardExpiration && {
          medicalCardExpiration: new Date(medicalCardExpiration),
        }),
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
    });

    return updated;
  }

  async updateLocation(
    tenantId: string,
    id: string,
    dto: UpdateDriverLocationDto
  ) {
    const driver = await this.findOne(tenantId, id);

    const updated = await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        lastLocationLat: dto.latitude,
        lastLocationLng: dto.longitude,
        lastLocationCity: dto.city,
        lastLocationState: dto.state,
        lastLocationTime: new Date(),
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const driver = await this.findOne(tenantId, id);

    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Driver deleted successfully' };
  }

  async getLocation(tenantId: string, id: string) {
    const driver = await this.findOne(tenantId, id);

    return {
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      latitude: driver.lastLocationLat,
      longitude: driver.lastLocationLng,
      city: driver.lastLocationCity,
      state: driver.lastLocationState,
      lastUpdated: driver.lastLocationTime,
      hosStatus: driver.hosStatus,
      hosDriveRemaining: driver.hosDriveRemaining,
      hosShiftRemaining: driver.hosShiftRemaining,
      hosCycleRemaining: driver.hosCycleRemaining,
    };
  }
}
