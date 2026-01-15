import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    companyType?: string;
    status?: string;
    search?: string;
    assignedUserId?: string;
  }) {
    const { page = 1, limit = 20, companyType, status, search, assignedUserId } = options || {};
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: any = { tenantId, deletedAt: null };
    if (companyType) where.companyType = companyType;
    if (status) where.status = status;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { legalName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: { where: { isPrimary: true }, take: 1 },
          _count: { select: { contacts: true, opportunities: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findOne(tenantId: string, id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contacts: { where: { status: 'ACTIVE' }, orderBy: { isPrimary: 'desc' } },
        opportunities: { orderBy: { createdAt: 'desc' }, take: 10 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async create(tenantId: string, userId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        tenantId,
        name: dto.name,
        legalName: dto.legalName,
        dbaName: dto.dbaName,
        companyType: dto.companyType || 'PROSPECT',
        status: dto.status || 'ACTIVE',
        industry: dto.industry,
        segment: dto.segment,
        tier: dto.tier,
        website: dto.website,
        phone: dto.phone,
        email: dto.email,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'USA',
        creditLimit: dto.creditLimit,
        paymentTerms: dto.paymentTerms,
        taxId: dto.taxId,
        assignedUserId: dto.assignedUserId,
        customFields: dto.customFields || {},
        tags: dto.tags || [],
        createdById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateCompanyDto) {
    await this.findOne(tenantId, id);

    return this.prisma.company.update({
      where: { id },
      data: {
        ...dto,
        customFields: dto.customFields || undefined,
        tags: dto.tags || undefined,
        updatedById: userId,
      },
    });
  }

  async delete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async getCompanyOrders(tenantId: string, companyId: string, options?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    await this.findOne(tenantId, companyId);

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { tenantId, customerId: companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          loads: { select: { id: true, status: true } },
        },
      }),
      this.prisma.order.count({ where: { tenantId, customerId: companyId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async syncToHubspot(tenantId: string, id: string, _userId: string) {
    const company = await this.findOne(tenantId, id);

    // Stub for HubSpot sync - will be implemented when HubSpot integration is ready
    await this.prisma.hubspotSyncLog.create({
      data: {
        tenantId,
        entityType: 'COMPANY',
        entityId: id,
        hubspotId: company.hubspotId || 'pending',
        syncDirection: 'TO_HUBSPOT',
        syncStatus: 'PENDING',
        payloadSent: { name: company.name, email: company.email },
      },
    });

    return { success: true, message: 'Sync queued', companyId: id };
  }

  async assignReps(tenantId: string, id: string, userId: string, dto: { salesRepId?: string; opsRepId?: string }) {
    await this.findOne(tenantId, id);

    return this.prisma.company.update({
      where: { id },
      data: {
        assignedUserId: dto.salesRepId,
        updatedById: userId,
      },
    });
  }

  async updateTier(tenantId: string, id: string, userId: string, tier: string) {
    const company = await this.findOne(tenantId, id);
    const oldTier = company.tier;

    const updated = await this.prisma.company.update({
      where: { id },
      data: { tier, updatedById: userId },
    });

    // Could emit tier change event here for analytics

    return { ...updated, previousTier: oldTier };
  }

  async getStats(tenantId: string) {
    const [total, customers, prospects, bySegment] = await Promise.all([
      this.prisma.company.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.company.count({ where: { tenantId, deletedAt: null, companyType: 'CUSTOMER' } }),
      this.prisma.company.count({ where: { tenantId, deletedAt: null, companyType: 'PROSPECT' } }),
      this.prisma.company.groupBy({
        by: ['segment'],
        where: { tenantId, deletedAt: null },
        _count: true,
      }),
    ]);

    return {
      total,
      customers,
      prospects,
      bySegment: bySegment.reduce((acc, s) => ({ ...acc, [s.segment || 'UNKNOWN']: s._count }), {}),
    };
  }
}
