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
    const skip = (page - 1) * limit;

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
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: { where: { isPrimary: true }, take: 1 },
          _count: { select: { contacts: true, opportunities: true } },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
}
