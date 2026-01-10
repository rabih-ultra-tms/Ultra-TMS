import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import {
  CarrierStatus,
  CarrierTier,
  CreateCarrierDto,
  UpdateCarrierDto,
  CarrierQueryDto,
  InsuranceType,
  DocumentStatus,
  DocumentType,
  OnboardCarrierDto,
  FmcsaLookupResult,
} from './dto';

const INSURANCE_MINIMUMS: Record<InsuranceType, number> = {
  [InsuranceType.AUTO_LIABILITY]: 1_000_000,
  [InsuranceType.CARGO]: 100_000,
  [InsuranceType.GENERAL_LIABILITY]: 500_000,
  [InsuranceType.WORKERS_COMP]: 0,
};

const TIER_CRITERIA: Record<CarrierTier, { minLoads: number; minOnTimeRate: number; maxClaimsRatio: number; minMonths: number }> = {
  [CarrierTier.PLATINUM]: { minLoads: 100, minOnTimeRate: 0.95, maxClaimsRatio: 0.01, minMonths: 12 },
  [CarrierTier.GOLD]: { minLoads: 50, minOnTimeRate: 0.9, maxClaimsRatio: 0.02, minMonths: 6 },
  [CarrierTier.SILVER]: { minLoads: 25, minOnTimeRate: 0.85, maxClaimsRatio: 0.03, minMonths: 3 },
  [CarrierTier.BRONZE]: { minLoads: 10, minOnTimeRate: 0, maxClaimsRatio: 1, minMonths: 0 },
  [CarrierTier.UNQUALIFIED]: { minLoads: 0, minOnTimeRate: 0, maxClaimsRatio: 1, minMonths: 0 },
};

@Injectable()
export class CarriersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateCarrierDto) {
    await this.ensureUniqueIdentifiers(tenantId, dto.dotNumber, dto.mcNumber);

    const primary = dto.contacts?.find((c) => c.isPrimary);

    const carrier = await this.prisma.carrier.create({
      data: {
        tenantId,
        dotNumber: dto.dotNumber,
        mcNumber: dto.mcNumber,
        legalName: dto.legalName || dto.name,
        dbaName: dto.dbaName,
        status: dto.status ?? CarrierStatus.PENDING,
        qualificationTier: dto.tier,
        addressLine1: dto.address1,
        addressLine2: dto.address2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'USA',
        primaryContactName:
          dto.primaryContactName ||
          (primary ? `${primary.firstName} ${primary.lastName}` : undefined),
        primaryContactPhone: dto.primaryContactPhone || primary?.phone || primary?.mobilePhone,
        primaryContactEmail: dto.primaryContactEmail || primary?.email,
        dispatchPhone: dto.dispatchPhone,
        dispatchEmail: dto.dispatchEmail,
        taxId: dto.taxId,
        paymentTerms: dto.paymentTerms,
        quickPayFeePercent: dto.quickpayPercent,
        w9OnFile: dto.w9OnFile ?? false,
        equipmentTypes: dto.equipmentTypes ?? [],
        serviceStates: dto.serviceStates ?? [],
        customFields: dto.customFields ?? {},
        createdById: userId,
        updatedById: userId,
        contacts: dto.contacts?.length
          ? {
              create: dto.contacts.map((c) => ({
                tenantId,
                firstName: c.firstName,
                lastName: c.lastName,
                title: c.title,
                role: c.role,
                email: c.email,
                phone: c.phone || c.mobilePhone,
                mobile: c.mobilePhone,
                isPrimary: c.isPrimary ?? false,
                receivesPayments: c.isAccounting ?? false,
                receivesRateConfirms: c.isDispatch ?? false,
                receivesPodRequests: false,
                isActive: true,
              })),
            }
          : undefined,
        insuranceCertificates: dto.insurance?.length
          ? {
              create: dto.insurance.map((i) => ({
                tenantId,
                insuranceType: i.type,
                insuranceCompany: i.insuranceCompany,
                policyNumber: i.policyNumber,
                coverageAmount: i.coverageAmount,
                deductible: i.deductible,
                effectiveDate: new Date(i.effectiveDate),
                expirationDate: new Date(i.expirationDate),
                certificateHolderName: i.certificateHolder,
                additionalInsured: i.additionalInsured ?? false,
                documentUrl: i.documentUrl,
                status: 'ACTIVE',
              })),
            }
          : undefined,
      },
      include: {
        contacts: true,
        insuranceCertificates: true,
      },
    });

    this.eventEmitter.emit('carrier.created', {
      carrierId: carrier.id,
      dotNumber: carrier.dotNumber,
      name: carrier.legalName,
      tenantId,
    });

    return carrier;
  }

  async findAll(tenantId: string, query: CarrierQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CarrierWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.tier ? { qualificationTier: query.tier } : {}),
      ...(query.state ? { state: query.state } : {}),
      ...(query.equipmentTypes?.length
        ? { equipmentTypes: { hasSome: query.equipmentTypes } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { legalName: { contains: query.search, mode: 'insensitive' } },
              { dbaName: { contains: query.search, mode: 'insensitive' } },
              { mcNumber: { contains: query.search, mode: 'insensitive' } },
              { dotNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.hasExpiredInsurance
        ? {
            insuranceCertificates: {
              some: { expirationDate: { lt: new Date() }, status: 'ACTIVE' },
            },
          }
        : {}),
      ...(query.hasExpiredDocuments
        ? {
            documents: {
              some: { expirationDate: { lt: new Date() } },
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.carrier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: { where: { isActive: true }, orderBy: { isPrimary: 'desc' } },
          insuranceCertificates: { where: { status: 'ACTIVE' }, orderBy: { expirationDate: 'asc' } },
          _count: { select: { drivers: true, loads: true } },
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
        drivers: { where: { deletedAt: null } },
        insuranceCertificates: { orderBy: { expirationDate: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        loads: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, loadNumber: true, status: true, carrierRate: true, createdAt: true },
        },
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    return carrier;
  }

  async update(tenantId: string, id: string, dto: UpdateCarrierDto) {
    const carrier = await this.requireCarrier(tenantId, id);

    if (carrier.status === CarrierStatus.BLACKLISTED) {
      throw new BadRequestException('Blacklisted carriers cannot be updated');
    }

    if (dto.dotNumber && dto.dotNumber !== carrier.dotNumber) {
      await this.ensureUniqueIdentifiers(tenantId, dto.dotNumber, undefined, id);
    }
    if (dto.mcNumber && dto.mcNumber !== carrier.mcNumber) {
      await this.ensureUniqueIdentifiers(tenantId, undefined, dto.mcNumber, id);
    }

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        dotNumber: dto.dotNumber ?? carrier.dotNumber,
        mcNumber: dto.mcNumber ?? carrier.mcNumber,
        legalName: dto.legalName ?? dto.name ?? carrier.legalName,
        dbaName: dto.dbaName ?? carrier.dbaName,
        status: dto.status ?? carrier.status,
        qualificationTier: dto.tier ?? carrier.qualificationTier,
        addressLine1: dto.address1 ?? carrier.addressLine1,
        addressLine2: dto.address2 ?? carrier.addressLine2,
        city: dto.city ?? carrier.city,
        state: dto.state ?? carrier.state,
        postalCode: dto.postalCode ?? carrier.postalCode,
        country: dto.country ?? carrier.country,
        primaryContactName: dto.primaryContactName ?? carrier.primaryContactName,
        primaryContactPhone: dto.primaryContactPhone ?? carrier.primaryContactPhone,
        primaryContactEmail: dto.primaryContactEmail ?? carrier.primaryContactEmail,
        dispatchPhone: dto.dispatchPhone ?? carrier.dispatchPhone,
        dispatchEmail: dto.dispatchEmail ?? carrier.dispatchEmail,
        taxId: dto.taxId ?? carrier.taxId,
        paymentTerms: dto.paymentTerms ?? carrier.paymentTerms,
        quickPayFeePercent: dto.quickpayPercent ?? carrier.quickPayFeePercent,
        w9OnFile: dto.w9OnFile ?? carrier.w9OnFile,
        equipmentTypes: dto.equipmentTypes ?? carrier.equipmentTypes,
        serviceStates: dto.serviceStates ?? carrier.serviceStates,
        customFields: dto.customFields ?? carrier.customFields,
        updatedAt: new Date(),
      },
    });

    this.eventEmitter.emit('carrier.updated', {
      carrierId: updated.id,
      changes: dto,
      tenantId,
    });

    return updated;
  }

  async updateStatus(tenantId: string, id: string, status: CarrierStatus, reason?: string) {
    const carrier = await this.requireCarrier(tenantId, id);

    if (status === CarrierStatus.SUSPENDED || status === CarrierStatus.BLACKLISTED) {
      if (!reason) {
        throw new BadRequestException('Reason is required for suspension/blacklist');
      }
    }

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        status,
        internalNotes: reason
          ? `${carrier.internalNotes || ''}\n${status}: ${reason}`
          : carrier.internalNotes,
        updatedAt: new Date(),
      },
    });

    if (status === CarrierStatus.SUSPENDED) {
      this.eventEmitter.emit('carrier.suspended', { carrierId: id, reason, tenantId });
    }

    if (status === CarrierStatus.BLACKLISTED) {
      this.eventEmitter.emit('carrier.blacklisted', { carrierId: id, reason, tenantId });
    }

    return updated;
  }

  async updateTier(tenantId: string, id: string, newTier: CarrierTier) {
    const carrier = await this.requireCarrier(tenantId, id);
    const updated = await this.prisma.carrier.update({
      where: { id },
      data: { qualificationTier: newTier, updatedAt: new Date() },
    });

    this.eventEmitter.emit('carrier.tier.changed', {
      carrierId: id,
      oldTier: carrier.qualificationTier,
      newTier,
      tenantId,
    });

    return updated;
  }

  async approve(tenantId: string, id: string, userId: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        insuranceCertificates: { where: { status: 'ACTIVE' } },
        documents: true,
      },
    });

    if (!carrier) throw new NotFoundException('Carrier not found');

    if (carrier.status !== CarrierStatus.PENDING) {
      throw new BadRequestException('Only pending carriers can be approved');
    }

    const hasW9 = carrier.documents?.some((d) => d.documentType === 'W9' && d.status === 'APPROVED');
    const hasAgreement = carrier.documents?.some(
      (d) => d.documentType === 'CARRIER_AGREEMENT' && d.status === 'APPROVED',
    );

    if (!hasW9) throw new BadRequestException('W9 document is required for approval');
    if (!hasAgreement) throw new BadRequestException('Carrier agreement is required for approval');

    this.ensureInsuranceCompliance(carrier.insuranceCertificates);

    const updated = await this.prisma.carrier.update({
      where: { id },
      data: {
        status: CarrierStatus.ACTIVE,
        qualificationDate: new Date(),
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('carrier.approved', {
      carrierId: id,
      approvedBy: userId,
      tenantId,
    });

    return updated;
  }

  async deactivate(tenantId: string, id: string, reason?: string) {
    const carrier = await this.requireCarrier(tenantId, id);

    const activeLoads = await this.prisma.load.count({
      where: { carrierId: id, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    });

    if (activeLoads > 0) {
      throw new BadRequestException(`Cannot deactivate carrier with ${activeLoads} active loads`);
    }

    return this.prisma.carrier.update({
      where: { id },
      data: {
        status: CarrierStatus.INACTIVE,
        internalNotes: reason
          ? `${carrier.internalNotes || ''}\nDeactivation reason: ${reason}`
          : carrier.internalNotes,
        updatedAt: new Date(),
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.requireCarrier(tenantId, id);

    const loadCount = await this.prisma.load.count({ where: { carrierId: id } });
    if (loadCount > 0) {
      throw new BadRequestException('Cannot delete carrier with load history');
    }

    await this.prisma.carrier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Carrier deleted successfully' };
  }

  async getCarrierPerformance(tenantId: string, id: string, days: number = 90) {
    const carrier = await this.requireCarrier(tenantId, id);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const loads = await this.prisma.load.findMany({
      where: { carrierId: id, tenantId, createdAt: { gte: cutoffDate } },
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
    const totalRevenue = loads.reduce((sum, l) => sum + (l.carrierRate?.toNumber?.() || 0), 0);

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
        completionRate: totalLoads > 0 ? ((completedLoads / totalLoads) * 100).toFixed(1) : '0',
        cancellationRate: totalLoads > 0 ? ((cancelledLoads / totalLoads) * 100).toFixed(1) : '0',
        onTimeRate: deliveriesWithData > 0 ? ((onTimeDeliveries / deliveriesWithData) * 100).toFixed(1) : 'N/A',
        totalRevenue,
        averageLoadValue: totalLoads > 0 ? (totalRevenue / totalLoads).toFixed(2) : '0',
      },
    };
  }

  async getCarrierLoads(tenantId: string, id: string) {
    await this.requireCarrier(tenantId, id);
    return this.prisma.load.findMany({
      where: { tenantId, carrierId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
      },
    });
  }

  async getCompliance(tenantId: string, id: string) {
    const carrier = await this.requireCarrier(tenantId, id);
    const [insurances, documents, fmcsaLogs] = await Promise.all([
      this.prisma.insuranceCertificate.findMany({ where: { carrierId: id, tenantId, status: { not: 'CANCELLED' } } }),
      this.prisma.carrierDocument.findMany({ where: { carrierId: id, tenantId, deletedAt: null } }),
      this.prisma.fmcsaComplianceLog.findMany({ where: { carrierId: id, tenantId }, orderBy: { checkedAt: 'desc' }, take: 5 }),
    ]);

    const now = new Date();
    const hasExpiredInsurance = insurances.some((i) => new Date(i.expirationDate) < now);
    const hasExpiredDocuments = documents.some((d) => d.expirationDate && new Date(d.expirationDate) < now);
    const hasPendingW9 = !documents.some((d) => d.documentType === DocumentType.W9 && d.status === DocumentStatus.APPROVED);
    const hasPendingAgreement = !documents.some(
      (d) => d.documentType === DocumentType.CARRIER_AGREEMENT && d.status === DocumentStatus.APPROVED,
    );

    return {
      carrier: {
        id: carrier.id,
        legalName: carrier.legalName,
        status: carrier.status,
        qualificationTier: carrier.qualificationTier,
      },
      insurance: insurances,
      documents,
      fmcsaHistory: fmcsaLogs,
      issues: {
        hasExpiredInsurance,
        hasExpiredDocuments,
        missingW9: hasPendingW9,
        missingAgreement: hasPendingAgreement,
        isOutOfService: carrier.fmcsaOutOfService,
      },
    };
  }

  async runFmcsaCheck(tenantId: string, id: string, userId: string) {
    const carrier = await this.requireCarrier(tenantId, id);

    const mockResponse = {
      dotNumber: carrier.dotNumber || 'UNKNOWN',
      mcNumber: carrier.mcNumber || 'UNKNOWN',
      legalName: carrier.legalName,
      operatingStatus: 'AUTHORIZED',
      safetyRating: 'SATISFACTORY',
      outOfService: false,
      insuranceOnFile: 1_000_000,
    };

    const log = await this.prisma.fmcsaComplianceLog.create({
      data: {
        tenantId,
        carrierId: id,
        dotNumber: mockResponse.dotNumber,
        mcNumber: mockResponse.mcNumber,
        authorityStatus: mockResponse.operatingStatus,
        safetyRating: mockResponse.safetyRating,
        outOfService: mockResponse.outOfService,
        fmcsaInsuranceOnFile: mockResponse.insuranceOnFile,
        rawResponse: mockResponse,
        createdById: userId,
      },
    });

    await this.prisma.carrier.update({
      where: { id },
      data: {
        fmcsaAuthorityStatus: mockResponse.operatingStatus,
        fmcsaSafetyRating: mockResponse.safetyRating,
        fmcsaOutOfService: mockResponse.outOfService,
        fmcsaLastChecked: new Date(),
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('carrier.fmcsa.checked', {
      carrierId: id,
      isCompliant: !mockResponse.outOfService,
      issues: mockResponse.outOfService ? ['OUT_OF_SERVICE'] : [],
      tenantId,
    });

    if (mockResponse.outOfService) {
      this.eventEmitter.emit('carrier.compliance.issue', {
        carrierId: id,
        issues: ['OUT_OF_SERVICE'],
        tenantId,
      });
    }

    return { carrierId: id, log };
  }

  async getExpiringInsurance(tenantId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const expiring = await this.prisma.insuranceCertificate.findMany({
      where: { tenantId, status: 'ACTIVE', expirationDate: { lte: cutoffDate } },
      include: {
        carrier: {
          select: { id: true, legalName: true, mcNumber: true, primaryContactEmail: true },
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    return expiring;
  }

  async lookupByMc(mcNumber: string): Promise<FmcsaLookupResult> {
    return this.buildFmcsaMock({ mcNumber });
  }

  async lookupByDot(dotNumber: string): Promise<FmcsaLookupResult> {
    return this.buildFmcsaMock({ dotNumber });
  }

  async onboardFromFmcsa(tenantId: string, userId: string, dto: OnboardCarrierDto) {
    if (!dto.dotNumber && !dto.mcNumber) {
      throw new BadRequestException('DOT or MC number is required');
    }

    const fmcsaData = dto.dotNumber ? await this.lookupByDot(dto.dotNumber) : await this.lookupByMc(dto.mcNumber as string);

    const existing = await this.prisma.carrier.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          fmcsaData.dotNumber ? { dotNumber: fmcsaData.dotNumber } : undefined,
          fmcsaData.mcNumber ? { mcNumber: fmcsaData.mcNumber } : undefined,
        ].filter(Boolean) as Prisma.CarrierWhereInput[],
      },
    });

    if (existing) {
      return { carrier: existing, fmcsa: fmcsaData, existing: true };
    }

    const email = dto.email || `onboard+${(fmcsaData.dotNumber || fmcsaData.mcNumber || 'carrier').toLowerCase()}@example.com`;
    const phone = dto.phone || fmcsaData.phone || '555-0100';

    const carrier = await this.create(tenantId, userId, {
      dotNumber: fmcsaData.dotNumber,
      mcNumber: fmcsaData.mcNumber,
      name: fmcsaData.legalName,
      legalName: fmcsaData.legalName,
      dbaName: fmcsaData.dbaName,
      address1: fmcsaData.address.street || 'Pending Address',
      city: fmcsaData.address.city || 'Unknown',
      state: dto.state || fmcsaData.address.state || 'NA',
      postalCode: fmcsaData.address.zip || '00000',
      country: fmcsaData.address.country || 'USA',
      phone,
      email,
      status: CarrierStatus.PENDING,
      tier: CarrierTier.UNQUALIFIED,
    });

    await this.prisma.fmcsaComplianceLog.create({
      data: {
        tenantId,
        carrierId: carrier.id,
        dotNumber: fmcsaData.dotNumber,
        mcNumber: fmcsaData.mcNumber,
        authorityStatus: fmcsaData.operatingStatus,
        safetyRating: fmcsaData.safetyRating,
        outOfService: false,
        fmcsaInsuranceOnFile: true,
        fmcsaInsuranceAmount: fmcsaData.insurance?.bipdOnFile ?? null,
        rawResponse: fmcsaData,
        createdById: userId,
      },
    });

    return { carrier, fmcsa: fmcsaData, existing: false };
  }

  async getScorecard(tenantId: string, id: string) {
    const carrier = await this.requireCarrier(tenantId, id);

    const [loads, insurances, documents] = await Promise.all([
      this.prisma.load.findMany({
        where: { tenantId, carrierId: id },
        include: { order: { include: { stops: true } } },
      }),
      this.prisma.insuranceCertificate.findMany({ where: { tenantId, carrierId: id, status: { not: 'CANCELLED' } } }),
      this.prisma.carrierDocument.findMany({ where: { tenantId, carrierId: id, deletedAt: null } }),
    ]);

    const totalLoads = loads.length;
    const completedLoads = loads.filter((l) => l.status === 'COMPLETED').length;
    const cancelledLoads = loads.filter((l) => l.status === 'CANCELLED').length;
    const totalRevenue = loads.reduce((sum, l) => sum + (l.carrierRate?.toNumber?.() || 0), 0);

    let deliveriesWithData = 0;
    let onTimeDeliveries = 0;
    for (const load of loads) {
      if (load.status !== 'COMPLETED' || !load.order?.stops) continue;
      const lastStop = load.order.stops.find((s) => (s as any).stopType === 'DELIVERY');
      if (lastStop?.appointmentTimeEnd && lastStop?.arrivedAt) {
        deliveriesWithData++;
        if (new Date(lastStop.arrivedAt) <= new Date(lastStop.appointmentTimeEnd)) {
          onTimeDeliveries++;
        }
      }
    }

    const onTimeRate = deliveriesWithData > 0 ? onTimeDeliveries / deliveriesWithData : 0;
    const claimsRatio = 0; // Claims data not yet tracked in this module
    const monthsActive = Math.max(0, Math.floor((Date.now() - carrier.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const recommendedTier = this.recommendTier(totalLoads, onTimeRate, claimsRatio, monthsActive);

    const now = new Date();
    const hasExpiredInsurance = insurances.some((i) => new Date(i.expirationDate) < now);
    const hasExpiredDocuments = documents.some((d) => d.expirationDate && new Date(d.expirationDate) < now);

    return {
      carrier: {
        id,
        legalName: carrier.legalName,
        status: carrier.status,
        currentTier: carrier.qualificationTier,
        recommendedTier,
        createdAt: carrier.createdAt,
      },
      metrics: {
        totalLoads,
        completedLoads,
        cancelledLoads,
        completionRate: totalLoads ? Number(((completedLoads / totalLoads) * 100).toFixed(1)) : 0,
        cancellationRate: totalLoads ? Number(((cancelledLoads / totalLoads) * 100).toFixed(1)) : 0,
        onTimeRate: Number((onTimeRate * 100).toFixed(1)),
        totalRevenue,
        averageLoadValue: totalLoads ? Number((totalRevenue / totalLoads).toFixed(2)) : 0,
        monthsActive,
      },
      compliance: {
        hasExpiredInsurance,
        hasExpiredDocuments,
        outOfService: carrier.fmcsaOutOfService ?? false,
        lastFmcsaCheck: carrier.fmcsaLastChecked,
      },
    };
  }

  private async ensureUniqueIdentifiers(
    tenantId: string,
    dotNumber?: string,
    mcNumber?: string,
    ignoreId?: string,
  ) {
    const ors: Prisma.CarrierWhereInput[] = [];
    if (dotNumber) ors.push({ dotNumber });
    if (mcNumber) ors.push({ mcNumber });
    if (!ors.length) return;

    const existing = await this.prisma.carrier.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        OR: ors,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
    });

    if (existing) {
      throw new BadRequestException('Carrier with this MC/DOT already exists');
    }
  }

  private recommendTier(totalLoads: number, onTimeRate: number, claimsRatio: number, monthsActive: number): CarrierTier {
    const candidates = Object.entries(TIER_CRITERIA)
      .map(([tier, criteria]) => ({ tier: tier as CarrierTier, criteria }))
      .filter(({ criteria }) =>
        totalLoads >= criteria.minLoads &&
        onTimeRate >= criteria.minOnTimeRate &&
        claimsRatio <= criteria.maxClaimsRatio &&
        monthsActive >= criteria.minMonths,
      )
      .sort((a, b) => TIER_CRITERIA[b.tier].minLoads - TIER_CRITERIA[a.tier].minLoads);

    return candidates[0]?.tier ?? CarrierTier.UNQUALIFIED;
  }

  private buildFmcsaMock(params: { dotNumber?: string; mcNumber?: string }): FmcsaLookupResult {
    const normalizedDot = params.dotNumber || params.mcNumber?.replace(/[^0-9]/g, '') || '0000000';

    return {
      dotNumber: normalizedDot,
      mcNumber: params.mcNumber || `MC${normalizedDot}`,
      legalName: `Carrier ${normalizedDot}`,
      dbaName: `DBA ${normalizedDot}`,
      address: {
        street: '123 FMCSA Ave',
        city: 'Arlington',
        state: 'VA',
        zip: '22202',
        country: 'USA',
      },
      phone: '555-555-5555',
      operatingStatus: 'AUTHORIZED',
      entityType: 'Carrier',
      carrierOperation: ['Interstate'],
      safetyRating: 'SATISFACTORY',
      safetyRatingDate: new Date().toISOString(),
      insurance: {
        bipdRequired: 1_000_000,
        bipdOnFile: 1_000_000,
        cargoRequired: 100_000,
        cargoOnFile: 100_000,
        bondRequired: 0,
        bondOnFile: 0,
      },
      isAuthorized: true,
      complianceIssues: [],
    };
  }

  private async requireCarrier(tenantId: string, id: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }

  private ensureInsuranceCompliance(
    insurance: Array<{ insuranceType: string; coverageAmount: Prisma.Decimal | number; expirationDate: Date | string }>,
  ) {
    const now = new Date();
    const auto = insurance.find((i) => i.insuranceType === InsuranceType.AUTO_LIABILITY);
    const cargo = insurance.find((i) => i.insuranceType === InsuranceType.CARGO);

    if (!auto || new Date(auto.expirationDate) < now || Number(auto.coverageAmount) < INSURANCE_MINIMUMS[InsuranceType.AUTO_LIABILITY]) {
      throw new BadRequestException('Active auto liability insurance of at least $1,000,000 is required');
    }

    if (!cargo || new Date(cargo.expirationDate) < now || Number(cargo.coverageAmount) < INSURANCE_MINIMUMS[InsuranceType.CARGO]) {
      throw new BadRequestException('Active cargo insurance of at least $100,000 is required');
    }
  }
}
