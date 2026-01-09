import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCarrierDto, UpdateCarrierDto } from './dto';

@Injectable()
export class CarriersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateCarrierDto) {
    // Check for duplicate MC number
    if (dto.mcNumber) {
      const existing = await this.prisma.carrier.findFirst({
        where: { tenantId, mcNumber: dto.mcNumber },
      });
      if (existing) {
        throw new BadRequestException('Carrier with this MC number already exists');
      }
    }

    const carrier = await this.prisma.carrier.create({
      data: {
        tenantId,
        legalName: dto.name,
        dbaName: dto.dbaName,
        mcNumber: dto.mcNumber,
        dotNumber: dto.dotNumber,
        scacCode: dto.scacCode,
        taxId: dto.taxId,
        companyType: dto.carrierType || 'CARRIER',
        status: 'PENDING',
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'USA',
        primaryContactName: dto.contactName,
        primaryContactPhone: dto.contactPhone,
        primaryContactEmail: dto.contactEmail,
        dispatchPhone: dto.dispatchPhone,
        dispatchEmail: dto.dispatchEmail,
        factoringCompany: dto.factoringCompany,
        paymentTerms: dto.paymentTerms,
        w9OnFile: dto.w9OnFile ? true : false,
        quickPayFeePercent: dto.quickpayPercent,
        internalNotes: dto.notes,
        equipmentTypes: dto.equipmentTypes || [],
        serviceStates: dto.serviceAreas || [],
        safetyScore: dto.safetyRating,
        customFields: dto.customFields || {},
        createdById: userId,
      },
    });

    return carrier;
  }

  async findAll(tenantId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    carrierType?: string;
  }) {
    const { page = 1, limit = 20, status, search, carrierType } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    
    if (status) {
      where.status = status;
    }
    if (carrierType) {
      where.companyType = carrierType;
    }
    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: 'insensitive' } },
        { dbaName: { contains: search, mode: 'insensitive' } },
        { mcNumber: { contains: search, mode: 'insensitive' } },
        { dotNumber: { contains: search, mode: 'insensitive' } },
        { primaryContactName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [carriers, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { legalName: 'asc' },
        include: {
          insuranceCertificates: {
            where: { status: 'ACTIVE' },
            select: { id: true, insuranceType: true, expirationDate: true },
          },
          _count: {
            select: { drivers: true, loads: true },
          },
        },
      }),
      this.prisma.carrier.count({ where }),
    ]);

    return {
      data: carriers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
      include: {
        drivers: { where: { status: 'ACTIVE' } },
        insuranceCertificates: { orderBy: { expirationDate: 'asc' } },
        loads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            loadNumber: true,
            status: true,
            carrierRate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    return carrier;
  }

  async update(tenantId: string, id: string, dto: UpdateCarrierDto) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    if (dto.mcNumber && dto.mcNumber !== carrier.mcNumber) {
      const existing = await this.prisma.carrier.findFirst({
        where: { tenantId, mcNumber: dto.mcNumber, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException('Carrier with this MC number already exists');
      }
    }

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        legalName: dto.name,
        dbaName: dto.dbaName,
        mcNumber: dto.mcNumber,
        dotNumber: dto.dotNumber,
        scacCode: dto.scacCode,
        taxId: dto.taxId,
        companyType: dto.carrierType,
        status: dto.status,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        primaryContactName: dto.contactName,
        primaryContactPhone: dto.contactPhone,
        primaryContactEmail: dto.contactEmail,
        dispatchPhone: dto.dispatchPhone,
        dispatchEmail: dto.dispatchEmail,
        factoringCompany: dto.factoringCompany,
        paymentTerms: dto.paymentTerms,
        w9OnFile: dto.w9OnFile ? true : undefined,
        quickPayFeePercent: dto.quickpayPercent,
        internalNotes: dto.notes,
        equipmentTypes: dto.equipmentTypes,
        serviceStates: dto.serviceAreas,
        safetyScore: dto.safetyRating,
        customFields: dto.customFields,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async approve(tenantId: string, id: string, _userId: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
      include: { insuranceCertificates: { where: { status: 'ACTIVE' } } },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    if (carrier.status !== 'PENDING') {
      throw new BadRequestException('Only pending carriers can be approved');
    }

    const hasAutoLiability = carrier.insuranceCertificates.some(
      (i) => i.insuranceType === 'AUTO_LIABILITY'
    );
    if (!hasAutoLiability) {
      throw new BadRequestException('Carrier must have active auto liability insurance');
    }

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        qualificationDate: new Date(),
      },
    });

    return updated;
  }

  async deactivate(tenantId: string, id: string, reason?: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const activeLoads = await this.prisma.load.count({
      where: {
        carrierId: id,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    if (activeLoads > 0) {
      throw new BadRequestException(`Cannot deactivate carrier with ${activeLoads} active loads`);
    }

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        internalNotes: reason
          ? `${carrier.internalNotes || ''}\nDeactivation reason: ${reason}`
          : carrier.internalNotes,
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const loadCount = await this.prisma.load.count({
      where: { carrierId: id },
    });

    if (loadCount > 0) {
      throw new BadRequestException('Cannot delete carrier with load history');
    }

    await this.prisma.carrier.delete({ where: { id } });

    return { success: true, message: 'Carrier deleted successfully' };
  }

  async getCarrierPerformance(tenantId: string, id: string, days: number = 90) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const loads = await this.prisma.load.findMany({
      where: {
        carrierId: id,
        createdAt: { gte: cutoffDate },
      },
      include: {
        order: {
          include: {
            stops: true,
          },
        },
      },
    });

    const totalLoads = loads.length;
    const completedLoads = loads.filter((l) => l.status === 'COMPLETED').length;
    const cancelledLoads = loads.filter((l) => l.status === 'CANCELLED').length;
    const totalRevenue = loads.reduce(
      (sum, l) => sum + (l.carrierRate?.toNumber() || 0),
      0
    );

    let onTimeDeliveries = 0;
    let deliveriesWithData = 0;

    for (const load of loads) {
      if (load.status !== 'COMPLETED' || !load.order?.stops) continue;

      const lastStop = load.order.stops.find((s) => s.stopType === 'DELIVERY');
      if (lastStop?.appointmentTimeEnd && lastStop?.arrivedAt) {
        deliveriesWithData++;
        if (new Date(lastStop.arrivedAt) <= new Date(lastStop.appointmentTimeEnd)) {
          onTimeDeliveries++;
        }
      }
    }

    return {
      carrierId: id,
      carrierName: carrier.legalName,
      period: `Last ${days} days`,
      metrics: {
        totalLoads,
        completedLoads,
        cancelledLoads,
        completionRate:
          totalLoads > 0
            ? ((completedLoads / totalLoads) * 100).toFixed(1)
            : 0,
        cancellationRate:
          totalLoads > 0
            ? ((cancelledLoads / totalLoads) * 100).toFixed(1)
            : 0,
        onTimeRate:
          deliveriesWithData > 0
            ? ((onTimeDeliveries / deliveriesWithData) * 100).toFixed(1)
            : 'N/A',
        totalRevenue,
        averageLoadValue:
          totalLoads > 0 ? (totalRevenue / totalLoads).toFixed(2) : 0,
      },
    };
  }

  async getExpiringInsurance(tenantId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const expiring = await this.prisma.insuranceCertificate.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expirationDate: { lte: cutoffDate },
      },
      include: {
        carrier: {
          select: {
            id: true,
            legalName: true,
            mcNumber: true,
            primaryContactEmail: true,
          },
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return expiring;
  }
}
