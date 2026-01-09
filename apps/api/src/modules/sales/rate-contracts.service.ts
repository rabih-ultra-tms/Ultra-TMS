import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRateContractDto, UpdateRateContractDto, LaneRateDto } from './dto';

@Injectable()
export class RateContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    status?: string;
    companyId?: string;
  }) {
    const { page = 1, limit = 20, status, companyId } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;

    const [data, total] = await Promise.all([
      this.prisma.rateContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { laneRates: true, accessorialRates: true } },
        },
      }),
      this.prisma.rateContract.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const contract = await this.prisma.rateContract.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        laneRates: { orderBy: { originState: 'asc' } },
        accessorialRates: { orderBy: { accessorialType: 'asc' } },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Rate contract with ID ${id} not found`);
    }

    return contract;
  }

  async create(tenantId: string, userId: string, dto: CreateRateContractDto) {
    // Check for duplicate contract number
    const existing = await this.prisma.rateContract.findFirst({
      where: { tenantId, contractNumber: dto.contractNumber },
    });
    if (existing) {
      throw new BadRequestException(`Contract number ${dto.contractNumber} already exists`);
    }

    return this.prisma.rateContract.create({
      data: {
        tenantId,
        contractNumber: dto.contractNumber,
        name: dto.name,
        companyId: dto.companyId,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: new Date(dto.expirationDate),
        paymentTerms: dto.paymentTerms,
        autoRenew: dto.autoRenew || false,
        renewalNoticeDays: dto.renewalNoticeDays || 30,
        defaultFuelSurchargeType: dto.defaultFuelSurchargeType,
        defaultFuelSurchargePercent: dto.defaultFuelSurchargePercent,
        minimumMarginPercent: dto.minimumMarginPercent,
        notes: dto.notes,
        status: 'DRAFT',
        customFields: dto.customFields || {},
        createdById: userId,
        laneRates: dto.laneRates ? {
          create: dto.laneRates.map(rate => this.mapLaneRateDto(rate)),
        } : undefined,
      },
      include: {
        laneRates: true,
        company: { select: { id: true, name: true } },
      },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateRateContractDto) {
    const contract = await this.findOne(tenantId, id);

    // Check contract number uniqueness if changing
    if (dto.contractNumber && dto.contractNumber !== contract.contractNumber) {
      const existing = await this.prisma.rateContract.findFirst({
        where: { tenantId, contractNumber: dto.contractNumber, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestException(`Contract number ${dto.contractNumber} already exists`);
      }
    }

    return this.prisma.rateContract.update({
      where: { id },
      data: {
        name: dto.name,
        contractNumber: dto.contractNumber,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        paymentTerms: dto.paymentTerms,
        autoRenew: dto.autoRenew,
        renewalNoticeDays: dto.renewalNoticeDays,
        defaultFuelSurchargeType: dto.defaultFuelSurchargeType,
        defaultFuelSurchargePercent: dto.defaultFuelSurchargePercent,
        minimumMarginPercent: dto.minimumMarginPercent,
        notes: dto.notes,
        status: dto.status,
        customFields: dto.customFields,
        updatedById: userId,
      },
      include: {
        laneRates: true,
        company: { select: { id: true, name: true } },
      },
    });
  }

  async delete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    // Soft delete
    await this.prisma.rateContract.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async activate(tenantId: string, id: string, userId: string) {
    const contract = await this.findOne(tenantId, id);

    if (contract.status === 'ACTIVE') {
      throw new BadRequestException('Contract is already active');
    }

    return this.prisma.rateContract.update({
      where: { id },
      data: { status: 'ACTIVE', updatedById: userId },
    });
  }

  async terminate(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    return this.prisma.rateContract.update({
      where: { id },
      data: { status: 'TERMINATED', updatedById: userId },
    });
  }

  // Lane Rate Management
  async addLaneRate(tenantId: string, contractId: string, dto: LaneRateDto) {
    await this.findOne(tenantId, contractId);

    return this.prisma.contractLaneRate.create({
      data: {
        contractId,
        ...this.mapLaneRateDto(dto),
      },
    });
  }

  async updateLaneRate(tenantId: string, contractId: string, laneRateId: string, dto: LaneRateDto) {
    await this.findOne(tenantId, contractId);

    const laneRate = await this.prisma.contractLaneRate.findFirst({
      where: { id: laneRateId, contractId },
    });
    if (!laneRate) {
      throw new NotFoundException(`Lane rate with ID ${laneRateId} not found`);
    }

    return this.prisma.contractLaneRate.update({
      where: { id: laneRateId },
      data: this.mapLaneRateDto(dto),
    });
  }

  async deleteLaneRate(tenantId: string, contractId: string, laneRateId: string) {
    await this.findOne(tenantId, contractId);

    const laneRate = await this.prisma.contractLaneRate.findFirst({
      where: { id: laneRateId, contractId },
    });
    if (!laneRate) {
      throw new NotFoundException(`Lane rate with ID ${laneRateId} not found`);
    }

    await this.prisma.contractLaneRate.delete({ where: { id: laneRateId } });
    return { success: true };
  }

  // Rate Lookup
  async findRateForLane(
    tenantId: string, 
    companyId: string, 
    origin: { city?: string; state?: string; zip?: string }, 
    destination: { city?: string; state?: string; zip?: string },
    options?: { serviceType?: string; equipmentType?: string }
  ) {
    // Find active contract for company
    const contract = await this.prisma.rateContract.findFirst({
      where: {
        tenantId,
        companyId,
        status: 'ACTIVE',
        effectiveDate: { lte: new Date() },
        expirationDate: { gte: new Date() },
        deletedAt: null,
      },
      include: {
        laneRates: {
          where: {
            OR: [
              { originState: origin.state },
              { originState: null },
            ],
            AND: [
              {
                OR: [
                  { destinationState: destination.state },
                  { destinationState: null },
                ],
              },
              ...(options?.equipmentType ? [{ OR: [{ equipmentType: options.equipmentType }, { equipmentType: null }] }] : []),
              ...(options?.serviceType ? [{ OR: [{ serviceType: options.serviceType }, { serviceType: null }] }] : []),
            ],
          },
          orderBy: [
            { originCity: 'desc' },  // Prefer more specific matches
            { originZip: 'desc' },
          ],
        },
      },
    });

    if (!contract || contract.laneRates.length === 0) {
      return null;
    }

    // Score and rank matches (more specific = higher score)
    const scoredRates = contract.laneRates.map(rate => {
      let score = 0;
      if (rate.originCity === origin.city) score += 10;
      if (rate.originZip === origin.zip) score += 5;
      if (rate.originState === origin.state) score += 2;
      if (rate.destinationCity === destination.city) score += 10;
      if (rate.destinationZip === destination.zip) score += 5;
      if (rate.destinationState === destination.state) score += 2;
      return { rate, score };
    });

    scoredRates.sort((a, b) => b.score - a.score);
    
    const bestMatch = scoredRates[0];
    return {
      contract: {
        id: contract.id,
        name: contract.name,
        contractNumber: contract.contractNumber,
      },
      laneRate: bestMatch?.rate ?? null,
      matchScore: bestMatch?.score ?? 0,
    };
  }

  // Expiring contracts report
  async getExpiringContracts(tenantId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.rateContract.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expirationDate: {
          gte: new Date(),
          lte: futureDate,
        },
        deletedAt: null,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
      orderBy: { expirationDate: 'asc' },
    });
  }

  // Helper to map DTO to database fields
  private mapLaneRateDto(dto: LaneRateDto) {
    return {
      originCity: dto.originCity,
      originState: dto.originState,
      originZip: dto.originZip,
      originZone: dto.originZone,
      originRadiusMiles: dto.originRadiusMiles,
      destinationCity: dto.destinationCity,
      destinationState: dto.destinationState,
      destinationZip: dto.destinationZip,
      destinationZone: dto.destinationZone,
      destinationRadiusMiles: dto.destinationRadiusMiles,
      serviceType: dto.serviceType,
      equipmentType: dto.equipmentType,
      rateType: dto.rateType,
      rateAmount: dto.rateAmount,
      minimumCharge: dto.minimumCharge,
      fuelIncluded: dto.fuelIncluded || false,
      fuelSurchargeType: dto.fuelSurchargeType,
      fuelSurchargePercent: dto.fuelSurchargePercent,
      volumeMin: dto.volumeMin,
      volumeMax: dto.volumeMax,
      effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      notes: dto.notes,
    };
  }
}
