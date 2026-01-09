import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateCarrierDto,
  UpdateCarrierDto,
  UpdateCarrierStatusDto,
  UpdateCarrierTierDto,
  CarrierSearchDto,
  CarrierListQueryDto,
  CarrierStatus,
} from './dto/carrier.dto';

@Injectable()
export class CarriersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: CarrierListQueryDto) {
    const {
      page = 1,
      limit = 20,
      status,
      tier,
      search,
      equipmentTypes,
      serviceStates,
      includeContacts,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (tier) {
      where.qualificationTier = tier;
    }

    if (search) {
      where.OR = [
        { legalName: { contains: search, mode: 'insensitive' } },
        { dbaName: { contains: search, mode: 'insensitive' } },
        { mcNumber: { contains: search, mode: 'insensitive' } },
        { dotNumber: { contains: search, mode: 'insensitive' } },
        { scacCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (equipmentTypes && equipmentTypes.length > 0) {
      where.equipmentTypes = { hasSome: equipmentTypes };
    }

    if (serviceStates && serviceStates.length > 0) {
      where.serviceStates = { hasSome: serviceStates };
    }

    const [data, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: includeContacts
            ? { where: { isActive: true }, orderBy: { isPrimary: 'desc' } }
            : false,
        },
      }),
      this.prisma.carrier.count({ where }),
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
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contacts: { where: { isActive: true }, orderBy: { isPrimary: 'desc' } },
        insuranceCertificates: { orderBy: { expirationDate: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        drivers: { where: { deletedAt: null } },
      },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    return carrier;
  }

  async create(tenantId: string, userId: string, dto: CreateCarrierDto) {
    // Check for duplicate MC/DOT numbers
    const existing = await this.prisma.carrier.findFirst({
      where: {
        tenantId,
        OR: [{ mcNumber: dto.mcNumber }, { dotNumber: dto.dotNumber }],
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Carrier with MC# ${dto.mcNumber} or DOT# ${dto.dotNumber} already exists`
      );
    }

    const { preferredLanes, customFields, ...carrierData } = dto;

    const carrier = await this.prisma.carrier.create({
      data: {
        ...carrierData,
        tenantId,
        preferredLanes: preferredLanes
          ? JSON.parse(JSON.stringify(preferredLanes))
          : [],
        customFields: customFields
          ? JSON.parse(JSON.stringify(customFields))
          : {},
        status: CarrierStatus.PENDING,
        createdBy: userId,
      },
      include: {
        contacts: true,
      },
    });

    return carrier;
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateCarrierDto
  ) {
    const carrier = await this.findOne(tenantId, id);

    const { preferredLanes, customFields, ...updateData } = dto;

    const updatePayload: Record<string, unknown> = {
      ...updateData,
      updatedBy: userId,
    };

    if (preferredLanes) {
      updatePayload.preferredLanes = JSON.parse(JSON.stringify(preferredLanes));
    }

    if (customFields) {
      const merged = {
        ...(carrier.customFields as Record<string, unknown>),
        ...customFields,
      };
      updatePayload.customFields = JSON.parse(JSON.stringify(merged));
    }

    const updated = await this.prisma.carrier.update({
      where: { id: carrier.id },
      data: updatePayload,
      include: {
        contacts: { where: { isActive: true } },
      },
    });

    return updated;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateCarrierStatusDto
  ) {
    const carrier = await this.findOne(tenantId, id);

    const updateData: Record<string, unknown> = {
      status: dto.status,
      updatedBy: userId,
    };

    if (dto.status === CarrierStatus.ACTIVE) {
      updateData.activatedAt = new Date();
    } else if (dto.status === CarrierStatus.SUSPENDED) {
      updateData.suspendedAt = new Date();
    } else if (dto.status === CarrierStatus.BLACKLISTED) {
      updateData.blacklistReason = dto.reason;
    }

    const updated = await this.prisma.carrier.update({
      where: { id: carrier.id },
      data: updateData,
    });

    return updated;
  }

  async updateTier(
    tenantId: string,
    id: string,
    userId: string,
    dto: UpdateCarrierTierDto
  ) {
    const carrier = await this.findOne(tenantId, id);

    const updated = await this.prisma.carrier.update({
      where: { id: carrier.id },
      data: {
        qualificationTier: dto.tier,
        updatedBy: userId,
      },
    });

    return updated;
  }

  async delete(tenantId: string, id: string, userId: string) {
    const carrier = await this.findOne(tenantId, id);

    await this.prisma.carrier.update({
      where: { id: carrier.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });

    return { success: true, message: 'Carrier deleted successfully' };
  }

  async getCompliance(tenantId: string, id: string) {
    const carrier = await this.findOne(tenantId, id);

    const [insurances, documents, fmcsaLogs] = await Promise.all([
      this.prisma.insuranceCertificate.findMany({
        where: { carrierId: id },
        orderBy: { expirationDate: 'asc' },
      }),
      this.prisma.carrierDocument.findMany({
        where: { carrierId: id },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fmcsaComplianceLog.findMany({
        where: { carrierId: id },
        orderBy: { checkedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate compliance issues
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiredInsurance = insurances.filter(
      (ins) => new Date(ins.expirationDate) < now
    );
    const expiringInsurance = insurances.filter(
      (ins) =>
        new Date(ins.expirationDate) >= now &&
        new Date(ins.expirationDate) <= thirtyDaysFromNow
    );
    const pendingDocuments = documents.filter(
      (doc) => doc.reviewStatus === 'PENDING'
    );

    return {
      carrier: {
        id: carrier.id,
        legalName: carrier.legalName,
        mcNumber: carrier.mcNumber,
        dotNumber: carrier.dotNumber,
        status: carrier.status,
        fmcsaAuthorityStatus: carrier.fmcsaAuthorityStatus,
        fmcsaSafetyRating: carrier.fmcsaSafetyRating,
        fmcsaOutOfService: carrier.fmcsaOutOfService,
        fmcsaLastChecked: carrier.fmcsaLastChecked,
        complianceScore: carrier.complianceScore,
        safetyScore: carrier.safetyScore,
      },
      insurance: {
        all: insurances,
        expired: expiredInsurance,
        expiringSoon: expiringInsurance,
      },
      documents: {
        all: documents,
        pending: pendingDocuments,
      },
      fmcsaHistory: fmcsaLogs,
      issues: {
        hasExpiredInsurance: expiredInsurance.length > 0,
        hasExpiringInsurance: expiringInsurance.length > 0,
        hasPendingDocuments: pendingDocuments.length > 0,
        isOutOfService: carrier.fmcsaOutOfService,
      },
    };
  }

  async verifyFmcsa(tenantId: string, id: string, userId: string) {
    const carrier = await this.findOne(tenantId, id);

    // In production, this would call the actual FMCSA API
    // For now, we simulate the response
    const fmcsaData = {
      authorityStatus: 'AUTHORIZED',
      safetyRating: 'SATISFACTORY',
      operatingStatus: 'ACTIVE',
      outOfService: false,
      legalName: carrier.legalName,
      address: carrier.address,
      city: carrier.city,
      state: carrier.state,
      zipCode: carrier.zipCode,
    };

    // Log the FMCSA check
    await this.prisma.fmcsaComplianceLog.create({
      data: {
        tenantId,
        carrierId: id,
        checkType: 'MANUAL',
        mcNumber: carrier.mcNumber,
        dotNumber: carrier.dotNumber,
        authorityStatus: fmcsaData.authorityStatus,
        safetyRating: fmcsaData.safetyRating,
        operatingStatus: fmcsaData.operatingStatus,
        outOfService: fmcsaData.outOfService,
        rawResponse: fmcsaData,
        success: true,
        checkedBy: userId,
      },
    });

    // Update carrier with FMCSA data
    const updated = await this.prisma.carrier.update({
      where: { id: carrier.id },
      data: {
        fmcsaAuthorityStatus: fmcsaData.authorityStatus,
        fmcsaSafetyRating: fmcsaData.safetyRating,
        fmcsaOperatingStatus: fmcsaData.operatingStatus,
        fmcsaOutOfService: fmcsaData.outOfService,
        fmcsaLastChecked: new Date(),
        fmcsaData: fmcsaData,
        updatedBy: userId,
      },
    });

    return {
      carrier: updated,
      fmcsaData,
      checkedAt: new Date(),
    };
  }

  async getPerformance(tenantId: string, id: string) {
    const carrier = await this.findOne(tenantId, id);

    const history = await this.prisma.carrierPerformanceHistory.findMany({
      where: { carrierId: id },
      orderBy: { periodStart: 'desc' },
      take: 12, // Last 12 periods
    });

    return {
      carrier: {
        id: carrier.id,
        legalName: carrier.legalName,
        qualificationTier: carrier.qualificationTier,
        totalLoadsCompleted: carrier.totalLoadsCompleted,
        onTimePickupRate: carrier.onTimePickupRate,
        onTimeDeliveryRate: carrier.onTimeDeliveryRate,
        claimsRate: carrier.claimsRate,
        avgRating: carrier.avgRating,
      },
      history,
    };
  }

  async search(tenantId: string, dto: CarrierSearchDto) {
    const {
      page = 1,
      limit = 20,
      equipmentTypes,
      serviceStates,
      originState,
      destinationState,
      tiers,
      minRating,
      minLoads,
    } = dto;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      tenantId,
      status: CarrierStatus.ACTIVE,
      deletedAt: null,
    };

    if (equipmentTypes && equipmentTypes.length > 0) {
      where.equipmentTypes = { hasSome: equipmentTypes };
    }

    if (serviceStates && serviceStates.length > 0) {
      where.serviceStates = { hasSome: serviceStates };
    }

    if (originState) {
      where.serviceStates = {
        ...(where.serviceStates as Record<string, unknown>),
        has: originState,
      };
    }

    if (tiers && tiers.length > 0) {
      where.qualificationTier = { in: tiers };
    }

    if (minRating) {
      where.avgRating = { gte: minRating };
    }

    if (minLoads) {
      where.totalLoadsCompleted = { gte: minLoads };
    }

    const [data, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ qualificationTier: 'asc' }, { avgRating: 'desc' }],
        select: {
          id: true,
          legalName: true,
          dbaName: true,
          mcNumber: true,
          dotNumber: true,
          city: true,
          state: true,
          phone: true,
          dispatchPhone: true,
          equipmentTypes: true,
          serviceStates: true,
          qualificationTier: true,
          totalLoadsCompleted: true,
          onTimeDeliveryRate: true,
          avgRating: true,
          preferredLanguage: true,
        },
      }),
      this.prisma.carrier.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async lookupMc(tenantId: string, mcNumber: string) {
    // Check if carrier already exists
    const existing = await this.prisma.carrier.findFirst({
      where: { tenantId, mcNumber, deletedAt: null },
    });

    if (existing) {
      return {
        exists: true,
        carrier: existing,
      };
    }

    // In production, call FMCSA API to lookup MC number
    // For now, return simulated data
    return {
      exists: false,
      fmcsaData: {
        mcNumber,
        dotNumber: '1234567',
        legalName: 'Sample Carrier LLC',
        address: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        authorityStatus: 'AUTHORIZED',
        safetyRating: 'SATISFACTORY',
      },
    };
  }

  async lookupDot(tenantId: string, dotNumber: string) {
    // Check if carrier already exists
    const existing = await this.prisma.carrier.findFirst({
      where: { tenantId, dotNumber, deletedAt: null },
    });

    if (existing) {
      return {
        exists: true,
        carrier: existing,
      };
    }

    // In production, call FMCSA API to lookup DOT number
    return {
      exists: false,
      fmcsaData: {
        dotNumber,
        mcNumber: 'MC123456',
        legalName: 'Sample Carrier LLC',
        address: '123 Main St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        authorityStatus: 'AUTHORIZED',
        safetyRating: 'SATISFACTORY',
      },
    };
  }
}
