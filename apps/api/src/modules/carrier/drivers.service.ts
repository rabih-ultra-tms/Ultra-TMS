import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, carrierId: string, _userId: string, dto: CreateDriverDto) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

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

    const driver = await this.prisma.driver.create({
      data: {
        tenantId,
        carrierId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: 'ACTIVE',
        cdlNumber: dto.licenseNumber,
        cdlState: dto.licenseState,
        cdlClass: dto.cdlClass,
        cdlExpiration: dto.licenseExpiration ? new Date(dto.licenseExpiration) : null,
        phone: dto.phone,
        email: dto.email,
        endorsements: dto.endorsements ?? [],
      },
    });

    this.eventEmitter.emit('driver.created', { driverId: driver.id, carrierId, tenantId });

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

  async findAll(tenantId: string, options: { status?: string; carrierId?: string }) {
    const where: any = { tenantId };
    if (options.status) where.status = options.status;
    if (options.carrierId) where.carrierId = options.carrierId;

    return this.prisma.driver.findMany({
      where,
      orderBy: { lastName: 'asc' },
      include: {
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
      },
    });
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

  async getLoads(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, tenantId } });
    if (!driver) throw new NotFoundException('Driver not found');

    const loads = await this.prisma.load.findMany({
      where: { tenantId, carrierId: driver.carrierId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
        carrier: { select: { id: true, legalName: true } },
      },
    });

    return loads;
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
        firstName: dto.firstName ?? driver.firstName,
        lastName: dto.lastName ?? driver.lastName,
        status: dto.status ?? driver.status,
        cdlNumber: dto.licenseNumber ?? driver.cdlNumber,
        cdlState: dto.licenseState ?? driver.cdlState,
        cdlClass: dto.cdlClass ?? driver.cdlClass,
        cdlExpiration: dto.licenseExpiration ? new Date(dto.licenseExpiration) : driver.cdlExpiration,
        phone: dto.phone ?? driver.phone,
        email: dto.email ?? driver.email,
        updatedAt: new Date(),
      },
    });

    if (dto.status && dto.status !== driver.status) {
      this.eventEmitter.emit('driver.status.changed', {
        driverId: id,
        carrierId: driver.carrierId,
        oldStatus: driver.status,
        newStatus: dto.status,
        tenantId,
      });
    }

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
