import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { 
  CreateRateContractDto, 
  UpdateRateContractDto, 
  CreateLaneRateDto, 
  UpdateLaneRateDto 
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RateContractsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

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

    const contract = await this.prisma.rateContract.create({
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
          create: dto.laneRates.map(rate => ({ tenantId, ...this.mapLaneRateDto(rate) })),
        } : undefined,
      },
      include: {
        laneRates: true,
        company: { select: { id: true, name: true } },
      },
    });

    // Emit contract created event
    this.eventEmitter.emit('contract.created', { contract, tenantId, userId });

    return contract;
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

  // Lane Rate Management
  async getLaneRates(tenantId: string, contractId: string) {
    await this.findOne(tenantId, contractId);

    return this.prisma.contractLaneRate.findMany({
      where: { contractId },
      orderBy: [{ originState: 'asc' }, { destinationState: 'asc' }],
    });
  }

  async addLaneRate(tenantId: string, contractId: string, _userId: string, dto: CreateLaneRateDto) {
    await this.findOne(tenantId, contractId);

    return this.prisma.contractLaneRate.create({
      data: {
        tenantId,
        contractId,
        ...this.mapLaneRateDto(dto as any),
      },
    });
  }

  async updateLaneRate(
    tenantId: string,
    contractId: string,
    laneId: string,
    _userId: string,
    dto: UpdateLaneRateDto,
  ) {
    await this.findOne(tenantId, contractId);

    const lane = await this.prisma.contractLaneRate.findFirst({
      where: { id: laneId, contractId },
    });

    if (!lane) {
      throw new NotFoundException('Lane rate not found');
    }

    return this.prisma.contractLaneRate.update({
      where: { id: laneId },
      data: this.mapLaneRateDto(dto as any),
    });
  }

  async deleteLaneRate(tenantId: string, contractId: string, laneId: string, _userId: string) {
    await this.findOne(tenantId, contractId);

    const lane = await this.prisma.contractLaneRate.findFirst({
      where: { id: laneId, contractId },
    });

    if (!lane) {
      throw new NotFoundException('Lane rate not found');
    }

    await this.prisma.contractLaneRate.delete({
      where: { id: laneId },
    });

    return { success: true };
  }

  async renewContract(tenantId: string, id: string, userId: string) {
    const contract = await this.findOne(tenantId, id);

    const newEffectiveDate = new Date(contract.expirationDate);
    newEffectiveDate.setDate(newEffectiveDate.getDate() + 1);

    const newExpirationDate = new Date(newEffectiveDate);
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);

    // Create new contract with updated dates
    const newContract = await this.prisma.rateContract.create({
      data: {
        tenantId,
        contractNumber: `${contract.contractNumber}-R`,
        name: `${contract.name} (Renewed)`,
        companyId: contract.companyId,
        effectiveDate: newEffectiveDate,
        expirationDate: newExpirationDate,
        paymentTerms: contract.paymentTerms,
        autoRenew: contract.autoRenew,
        renewalNoticeDays: contract.renewalNoticeDays,
        defaultFuelSurchargeType: contract.defaultFuelSurchargeType,
        defaultFuelSurchargePercent: contract.defaultFuelSurchargePercent,
        minimumMarginPercent: contract.minimumMarginPercent,
        notes: `Renewed from contract ${contract.contractNumber}`,
        status: 'DRAFT',
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    // Copy lane rates
    const lanesToCopy = await this.prisma.contractLaneRate.findMany({
      where: { contractId: id },
    });

    if (lanesToCopy.length > 0) {
      await this.prisma.contractLaneRate.createMany({
        data: lanesToCopy.map((lane) => ({
          tenantId,
          contractId: newContract.id,
          originCity: lane.originCity,
          originState: lane.originState,
          originZip: lane.originZip,
          originZone: lane.originZone,
          originRadiusMiles: lane.originRadiusMiles,
          destinationCity: lane.destinationCity,
          destinationState: lane.destinationState,
          destinationZip: lane.destinationZip,
          destinationZone: lane.destinationZone,
          destinationRadiusMiles: lane.destinationRadiusMiles,
          serviceType: lane.serviceType,
          equipmentType: lane.equipmentType,
          rateType: lane.rateType,
          rateAmount: lane.rateAmount,
          minimumCharge: lane.minimumCharge,
          fuelIncluded: lane.fuelIncluded,
          fuelSurchargeType: lane.fuelSurchargeType,
          fuelSurchargePercent: lane.fuelSurchargePercent,
          volumeMin: lane.volumeMin,
          volumeMax: lane.volumeMax,
          notes: lane.notes,
        })),
      });
    }

    return newContract;
  }

  async findRate(
    tenantId: string,
    originState: string,
    originCity: string,
    destState: string,
    destCity: string,
    companyId?: string,
    serviceType?: string,
  ) {
    const where: any = {
      tenantId,
      status: 'ACTIVE',
      effectiveDate: { lte: new Date() },
      expirationDate: { gte: new Date() },
      deletedAt: null,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    const contracts = await this.prisma.rateContract.findMany({
      where,
      include: {
        laneRates: {
          where: {
            OR: [
              {
                originState,
                originCity,
                destinationState: destState,
                destinationCity: destCity,
                ...(serviceType && { serviceType }),
              },
              {
                originState,
                destinationState: destState,
                ...(serviceType && { serviceType }),
              },
              {
                originState,
                destinationState: destState,
              },
            ],
          },
          orderBy: { rateAmount: 'asc' },
          take: 1,
        },
      },
    });

    const contractWithRate = contracts.find((c) => c.laneRates.length > 0);

    if (!contractWithRate) {
      return null;
    }

    return {
      contract: {
        id: contractWithRate.id,
        contractNumber: contractWithRate.contractNumber,
        name: contractWithRate.name,
      },
      laneRate: contractWithRate.laneRates[0],
    };
  }

  // Helper to map DTO to database fields
  private mapLaneRateDto(dto: any) {
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
