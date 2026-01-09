import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, carrierId: string, _userId: string, dto: CreateDriverDto) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    if (dto.licenseNumber) {
      const existing = await this.prisma.driver.findFirst({
        where: {
          tenantId,
          cdlNumber: dto.licenseNumber,
          cdlState: dto.licenseState,
        },
      });
      if (existing) {
        throw new BadRequestException('Driver with this CDL already exists');
      }
    }

    const driver = await this.prisma.driver.create({
      data: {
        tenantId,
        carrierId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
        cdlNumber: dto.licenseNumber,
        cdlState: dto.licenseState,
        cdlClass: dto.licenseClass,
        cdlExpiration: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
        phone: dto.phone,
        email: dto.email,
        endorsements: dto.hazmatEndorsement ? ['H'] : [],
      },
    });

    return driver;
  }

  async findAllForCarrier(tenantId: string, carrierId: string, options: { status?: string }) {
    const { status } = options;

    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const where: any = { tenantId, carrierId };
    if (status) where.status = status;

    const drivers = await this.prisma.driver.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });

    return drivers;
  }

  async findOne(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
      include: {
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (dto.licenseNumber && dto.licenseState) {
      const existing = await this.prisma.driver.findFirst({
        where: {
          tenantId,
          cdlNumber: dto.licenseNumber,
          cdlState: dto.licenseState,
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException('Driver with this CDL already exists');
      }
    }

    const updated = await this.prisma.driver.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: dto.status,
        cdlNumber: dto.licenseNumber,
        cdlState: dto.licenseState,
        cdlClass: dto.licenseClass,
        cdlExpiration: dto.licenseExpiry ? new Date(dto.licenseExpiry) : undefined,
        phone: dto.phone,
        email: dto.email,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.prisma.driver.delete({ where: { id } });

    return { success: true, message: 'Driver deleted successfully' };
  }

  async getExpiringCredentials(tenantId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const expiring = await this.prisma.driver.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        cdlExpiration: { lte: cutoffDate },
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
      orderBy: { cdlExpiration: 'asc' },
    });

    return expiring.map((driver) => ({
      ...driver,
      expiringCredentials: [{ type: 'CDL', date: driver.cdlExpiration }],
    }));
  }
}
