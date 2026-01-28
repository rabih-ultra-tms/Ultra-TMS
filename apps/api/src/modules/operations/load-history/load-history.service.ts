import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  CreateLoadHistoryDto,
  UpdateLoadHistoryDto,
  ListLoadHistoryDto,
} from './dto';

@Injectable()
export class LoadHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateLoadHistoryDto) {
    try {
      return await this.prisma.loadHistory.create({
        data: {
          tenantId,
          loadPlannerQuoteId: dto.loadPlannerQuoteId,
          inlandQuoteId: dto.inlandQuoteId,
          quoteNumber: dto.quoteNumber,
          customerName: dto.customerName,
          customerCompany: dto.customerCompany,
          carrierId: dto.carrierId,
          driverId: dto.driverId,
          truckId: dto.truckId,
          originCity: dto.originCity,
          originState: dto.originState,
          originZip: dto.originZip,
          destinationCity: dto.destinationCity,
          destinationState: dto.destinationState,
          destinationZip: dto.destinationZip,
          totalMiles: dto.totalMiles
            ? new Prisma.Decimal(String(dto.totalMiles))
            : null,
          cargoDescription: dto.cargoDescription,
          pieces: dto.pieces,
          totalLengthIn: dto.totalLengthIn
            ? new Prisma.Decimal(String(dto.totalLengthIn))
            : null,
          totalWidthIn: dto.totalWidthIn
            ? new Prisma.Decimal(String(dto.totalWidthIn))
            : null,
          totalHeightIn: dto.totalHeightIn
            ? new Prisma.Decimal(String(dto.totalHeightIn))
            : null,
          totalWeightLbs: dto.totalWeightLbs
            ? new Prisma.Decimal(String(dto.totalWeightLbs))
            : null,
          isOversize: dto.isOversize || false,
          isOverweight: dto.isOverweight || false,
          equipmentTypeUsed: dto.equipmentTypeUsed,
          customerRateCents: dto.customerRateCents,
          carrierRateCents: dto.carrierRateCents,
          quoteDate: dto.quoteDate ? new Date(dto.quoteDate) : null,
          bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : null,
          pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
          paidDate: dto.paidDate ? new Date(dto.paidDate) : null,
          status: dto.status || 'BOOKED',
          notes: dto.notes,
          isActive: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create load history: ${error.message}`
      );
    }
  }

  async list(tenantId: string, dto: ListLoadHistoryDto) {
    const skip = (dto.page - 1) * dto.limit;

    const where: Prisma.LoadHistoryWhereInput = {
      tenantId,
      isActive: true,
      deletedAt: null,
    };

    if (dto.search) {
      where.OR = [
        { quoteNumber: { contains: dto.search, mode: 'insensitive' } },
        { customerName: { contains: dto.search, mode: 'insensitive' } },
        { customerCompany: { contains: dto.search, mode: 'insensitive' } },
        { cargoDescription: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.originState) {
      where.originState = dto.originState;
    }

    if (dto.destinationState) {
      where.destinationState = dto.destinationState;
    }

    if (dto.carrierId) {
      where.carrierId = dto.carrierId;
    }

    if (dto.dateFrom || dto.dateTo) {
      where.pickupDate = {};
      if (dto.dateFrom) {
        where.pickupDate.gte = new Date(dto.dateFrom);
      }
      if (dto.dateTo) {
        where.pickupDate.lte = new Date(dto.dateTo);
      }
    }

    const orderBy: Prisma.LoadHistoryOrderByWithRelationInput = {};
    if (dto.sortBy === 'quoteNumber') {
      orderBy.quoteNumber = dto.sortOrder || 'desc';
    } else if (dto.sortBy === 'marginCents') {
      orderBy.marginCents = dto.sortOrder || 'desc';
    } else if (dto.sortBy === 'pickupDate') {
      orderBy.pickupDate = dto.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.loadHistory.findMany({
        where,
        skip,
        take: dto.limit,
        orderBy,
        include: {
          carrier: {
            select: { companyName: true },
          },
          driver: {
            select: { firstName: true, lastName: true },
          },
          truck: {
            select: { unitNumber: true },
          },
        },
      }),
      this.prisma.loadHistory.count({ where }),
    ]);

    return {
      data,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }

  async getById(tenantId: string, loadId: string) {
    const load = await this.prisma.loadHistory.findUnique({
      where: { id: loadId },
      include: {
        carrier: true,
        driver: true,
        truck: true,
        loadPlannerQuote: true,
      },
    });

    if (!load || load.tenantId !== tenantId) {
      throw new NotFoundException('Load history not found');
    }

    return load;
  }

  async update(
    tenantId: string,
    loadId: string,
    dto: UpdateLoadHistoryDto
  ) {
    const _existing = await this.getById(tenantId, loadId);

    try {
      return await this.prisma.loadHistory.update({
        where: { id: loadId },
        data: {
          loadPlannerQuoteId: dto.loadPlannerQuoteId,
          inlandQuoteId: dto.inlandQuoteId,
          quoteNumber: dto.quoteNumber,
          customerName: dto.customerName,
          customerCompany: dto.customerCompany,
          carrierId: dto.carrierId,
          driverId: dto.driverId,
          truckId: dto.truckId,
          originCity: dto.originCity,
          originState: dto.originState,
          originZip: dto.originZip,
          destinationCity: dto.destinationCity,
          destinationState: dto.destinationState,
          destinationZip: dto.destinationZip,
          totalMiles: dto.totalMiles
            ? new Prisma.Decimal(String(dto.totalMiles))
            : null,
          cargoDescription: dto.cargoDescription,
          pieces: dto.pieces,
          totalLengthIn: dto.totalLengthIn
            ? new Prisma.Decimal(String(dto.totalLengthIn))
            : null,
          totalWidthIn: dto.totalWidthIn
            ? new Prisma.Decimal(String(dto.totalWidthIn))
            : null,
          totalHeightIn: dto.totalHeightIn
            ? new Prisma.Decimal(String(dto.totalHeightIn))
            : null,
          totalWeightLbs: dto.totalWeightLbs
            ? new Prisma.Decimal(String(dto.totalWeightLbs))
            : null,
          isOversize: dto.isOversize,
          isOverweight: dto.isOverweight,
          equipmentTypeUsed: dto.equipmentTypeUsed,
          customerRateCents: dto.customerRateCents,
          carrierRateCents: dto.carrierRateCents,
          quoteDate: dto.quoteDate ? new Date(dto.quoteDate) : null,
          bookedDate: dto.bookedDate ? new Date(dto.bookedDate) : null,
          pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
          deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
          invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : null,
          paidDate: dto.paidDate ? new Date(dto.paidDate) : null,
          status: dto.status,
          notes: dto.notes,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update load history: ${error.message}`
      );
    }
  }

  async delete(tenantId: string, loadId: string) {
    const _existing = await this.getById(tenantId, loadId);

    await this.prisma.loadHistory.update({
      where: { id: loadId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Load history deleted successfully' };
  }

  async getByCarrier(tenantId: string, carrierId: string) {
    return this.prisma.loadHistory.findMany({
      where: {
        tenantId,
        carrierId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSimilarLoads(
    tenantId: string,
    originState: string,
    destinationState: string,
    weightLbs: number,
    lengthIn: number,
    widthIn: number,
    heightIn: number,
    tolerance: number = 0.2 // 20% tolerance
  ) {
    const minWeight = Math.floor(weightLbs * (1 - tolerance));
    const maxWeight = Math.ceil(weightLbs * (1 + tolerance));
    const minLength = Math.floor(lengthIn * (1 - tolerance));
    const maxLength = Math.ceil(lengthIn * (1 + tolerance));

    // Get loads from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return this.prisma.loadHistory.findMany({
      where: {
        tenantId,
        originState,
        destinationState,
        totalWeightLbs: {
          gte: new Prisma.Decimal(String(minWeight)),
          lte: new Prisma.Decimal(String(maxWeight)),
        },
        totalLengthIn: {
          gte: new Prisma.Decimal(String(minLength)),
          lte: new Prisma.Decimal(String(maxLength)),
        },
        pickupDate: {
          gte: sixMonthsAgo,
        },
        isActive: true,
      },
      orderBy: { pickupDate: 'desc' },
      take: 10,
    });
  }

  async getStats(tenantId: string) {
    const [totalLoads, completedLoads, totalRevenueData, totalCostData] =
      await Promise.all([
        this.prisma.loadHistory.count({
          where: { tenantId, isActive: true },
        }),
        this.prisma.loadHistory.count({
          where: { tenantId, status: 'COMPLETED', isActive: true },
        }),
        this.prisma.loadHistory.aggregate({
          where: { tenantId, isActive: true },
          _sum: { customerRateCents: true },
        }),
        this.prisma.loadHistory.aggregate({
          where: { tenantId, isActive: true },
          _sum: { carrierRateCents: true },
        }),
      ]);

    return {
      totalLoads,
      completedLoads,
      totalRevenueCents: totalRevenueData._sum.customerRateCents || 0,
      totalCostCents: totalCostData._sum.carrierRateCents || 0,
      totalMarginCents:
        (totalRevenueData._sum.customerRateCents || 0) -
        (totalCostData._sum.carrierRateCents || 0),
    };
  }

  async getLaneStats(tenantId: string, originState: string, destinationState: string) {
    const loads = await this.prisma.loadHistory.findMany({
      where: {
        tenantId,
        originState,
        destinationState,
        isActive: true,
      },
      select: {
        customerRateCents: true,
        carrierRateCents: true,
        marginCents: true,
        totalMiles: true,
      },
    });

    if (loads.length === 0) {
      return {
        count: 0,
        avgRevenueCents: 0,
        avgCostCents: 0,
        avgMarginCents: 0,
      };
    }

    const totalRevenue = loads.reduce(
      (sum: number, l: any) => sum + l.customerRateCents,
      0
    );
    const totalCost = loads.reduce((sum: number, l: any) => sum + l.carrierRateCents, 0);
    const totalMargin = loads.reduce((sum: number, l: any) => sum + l.marginCents, 0);

    return {
      count: loads.length,
      avgRevenueCents: Math.floor(totalRevenue / loads.length),
      avgCostCents: Math.floor(totalCost / loads.length),
      avgMarginCents: Math.floor(totalMargin / loads.length),
    };
  }
}
