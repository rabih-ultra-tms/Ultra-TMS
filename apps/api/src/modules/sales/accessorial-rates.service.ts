import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAccessorialRateDto, UpdateAccessorialRateDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccessorialRatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    options?: {
      page?: number;
      limit?: number;
      contractId?: string;
      status?: string;
      accessorialType?: string;
    },
  ) {
    const { page, limit, contractId, status, accessorialType } = options || {};
    const resolvedPage = Number(page);
    const resolvedLimit = Number(limit);
    const safePage = Number.isFinite(resolvedPage) && resolvedPage > 0 ? resolvedPage : 1;
    const safeLimit = Number.isFinite(resolvedLimit) && resolvedLimit > 0 ? resolvedLimit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.AccessorialRateWhereInput = { tenantId };
    if (contractId) where.contractId = contractId;
    if (status) where.status = status;
    if (accessorialType) where.accessorialType = accessorialType;

    const [data, total] = await Promise.all([
      this.prisma.accessorialRate.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { accessorialType: 'asc' },
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.accessorialRate.count({ where }),
    ]);

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const rate = await this.prisma.accessorialRate.findFirst({
      where: { id, tenantId },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            name: true,
          },
        },
      },
    });

    if (!rate) {
      throw new NotFoundException(`Accessorial rate with ID ${id} not found`);
    }

    return rate;
  }

  async create(tenantId: string, userId: string, dto: CreateAccessorialRateDto) {
    return this.prisma.accessorialRate.create({
      data: {
        tenantId,
        contractId: dto.contractId,
        accessorialType: dto.accessorialType,
        name: dto.name,
        description: dto.description,
        rateType: dto.rateType,
        rateAmount: dto.rateAmount,
        minimumCharge: dto.minimumCharge,
        maximumCharge: dto.maximumCharge,
        appliesToServiceTypes: dto.appliesToServiceTypes || [],
        isDefault: dto.isDefault || false,
        status: dto.status || 'ACTIVE',
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            name: true,
          },
        },
      },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateAccessorialRateDto) {
    await this.findOne(tenantId, id);

    return this.prisma.accessorialRate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        rateType: dto.rateType,
        rateAmount: dto.rateAmount,
        minimumCharge: dto.minimumCharge,
        maximumCharge: dto.maximumCharge,
        appliesToServiceTypes: dto.appliesToServiceTypes,
        isDefault: dto.isDefault,
        status: dto.status,
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(tenantId: string, id: string, _userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.accessorialRate.delete({
      where: { id },
    });

    return { success: true };
  }

  async seedDefaultAccessorials(tenantId: string, _userId: string) {
    const defaults = [
      {
        accessorialType: 'DETENTION',
        name: 'Detention',
        description: 'Waiting time charge',
        rateType: 'PER_HOUR',
        rateAmount: 75,
        appliesToServiceTypes: ['FTL', 'LTL', 'PARTIAL'],
      },
      {
        accessorialType: 'LAYOVER',
        name: 'Layover',
        description: 'Overnight stay charge',
        rateType: 'FLAT',
        rateAmount: 350,
        appliesToServiceTypes: ['FTL'],
      },
      {
        accessorialType: 'LUMPER',
        name: 'Lumper Fee',
        description: 'Loading/unloading service',
        rateType: 'FLAT',
        rateAmount: 0,
        appliesToServiceTypes: ['FTL', 'LTL'],
      },
      {
        accessorialType: 'TONU',
        name: 'Truck Order Not Used',
        description: 'Cancelled shipment charge',
        rateType: 'FLAT',
        rateAmount: 250,
        appliesToServiceTypes: ['FTL', 'LTL', 'PARTIAL'],
      },
      {
        accessorialType: 'STOP_OFF',
        name: 'Stop-Off Charge',
        description: 'Additional stop fee',
        rateType: 'FLAT',
        rateAmount: 150,
        appliesToServiceTypes: ['FTL'],
      },
      {
        accessorialType: 'APPOINTMENT',
        name: 'Appointment Scheduling',
        description: 'Appointment booking fee',
        rateType: 'FLAT',
        rateAmount: 50,
        appliesToServiceTypes: ['FTL', 'LTL'],
      },
      {
        accessorialType: 'RESIDENTIAL',
        name: 'Residential Delivery',
        description: 'Residential location fee',
        rateType: 'FLAT',
        rateAmount: 100,
        appliesToServiceTypes: ['LTL'],
      },
      {
        accessorialType: 'LIFTGATE',
        name: 'Liftgate Service',
        description: 'Liftgate usage charge',
        rateType: 'FLAT',
        rateAmount: 75,
        appliesToServiceTypes: ['LTL'],
      },
      {
        accessorialType: 'INSIDE_DELIVERY',
        name: 'Inside Delivery',
        description: 'Delivery inside building',
        rateType: 'FLAT',
        rateAmount: 100,
        appliesToServiceTypes: ['LTL'],
      },
      {
        accessorialType: 'HAZMAT',
        name: 'Hazmat Handling',
        description: 'Hazardous materials fee',
        rateType: 'FLAT',
        rateAmount: 200,
        appliesToServiceTypes: ['FTL', 'LTL'],
      },
    ];

    const created = [];
    for (const accessorial of defaults) {
      const existing = await this.prisma.accessorialRate.findFirst({
        where: {
          tenantId,
          accessorialType: accessorial.accessorialType,
          contractId: null,
        },
      });

      if (!existing) {
        const rate = await this.prisma.accessorialRate.create({
          data: {
            tenantId,
            ...accessorial,
            isDefault: true,
            status: 'ACTIVE',
          },
        });
        created.push(rate);
      }
    }

    return created;
  }
}
