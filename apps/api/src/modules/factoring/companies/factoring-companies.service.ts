import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { FactoringCompanyStatus } from '../dto/enums';
import { CreateFactoringCompanyDto } from './dto/create-factoring-company.dto';
import { FactoringCompanyQueryDto } from './dto/factoring-company-query.dto';
import { UpdateFactoringCompanyDto } from './dto/update-factoring-company.dto';

@Injectable()
export class FactoringCompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateFactoringCompanyDto) {
    const existing = await this.prisma.factoringCompany.findFirst({
      where: { companyCode: dto.companyCode, deletedAt: null },
    });

    if (existing) {
      throw new BadRequestException('Factoring company code already exists');
    }

    const company = await this.prisma.factoringCompany.create({
      data: {
        tenantId,
        companyCode: dto.companyCode,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        fax: dto.fax,
        address: dto.address,
        verificationMethod: dto.verificationMethod ?? 'EMAIL',
        apiEndpoint: dto.apiEndpoint,
        apiKey: dto.apiKey,
        verificationSLAHours: dto.verificationSLAHours ?? 24,
        status: dto.status ?? FactoringCompanyStatus.ACTIVE,
        createdById: userId,
        updatedById: userId,
        customFields: Prisma.JsonNull,
      },
    });

    this.eventEmitter.emit('factoring.company.created', {
      companyId: company.id,
      tenantId,
    });

    return company;
  }

  async findAll(tenantId: string, query: FactoringCompanyQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.FactoringCompanyWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { companyCode: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.factoringCompany.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.factoringCompany.count({ where }),
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
    return this.requireCompany(tenantId, id);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateFactoringCompanyDto) {
    const company = await this.requireCompany(tenantId, id);

    if (dto.companyCode && dto.companyCode !== company.companyCode) {
      const conflict = await this.prisma.factoringCompany.findFirst({
        where: { companyCode: dto.companyCode, deletedAt: null },
      });
      if (conflict) {
        throw new BadRequestException('Factoring company code already exists');
      }
    }

    return this.prisma.factoringCompany.update({
      where: { id: company.id },
      data: {
        ...(dto.companyCode ? { companyCode: dto.companyCode } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.fax !== undefined ? { fax: dto.fax } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.verificationMethod !== undefined ? { verificationMethod: dto.verificationMethod } : {}),
        ...(dto.apiEndpoint !== undefined ? { apiEndpoint: dto.apiEndpoint } : {}),
        ...(dto.apiKey !== undefined ? { apiKey: dto.apiKey } : {}),
        ...(dto.verificationSLAHours !== undefined ? { verificationSLAHours: dto.verificationSLAHours } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        updatedById: userId,
      },
    });
  }

  async toggleStatus(tenantId: string, userId: string, id: string, status?: FactoringCompanyStatus) {
    const company = await this.requireCompany(tenantId, id);
    const nextStatus = status ?? (company.status === FactoringCompanyStatus.ACTIVE ? FactoringCompanyStatus.INACTIVE : FactoringCompanyStatus.ACTIVE);

    return this.prisma.factoringCompany.update({
      where: { id },
      data: { status: nextStatus, updatedById: userId },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.requireCompany(tenantId, id);

    await this.prisma.factoringCompany.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId, status: FactoringCompanyStatus.INACTIVE },
    });

    return { success: true };
  }

  private async requireCompany(tenantId: string, id: string) {
    const company = await this.prisma.factoringCompany.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!company) {
      throw new NotFoundException('Factoring company not found');
    }

    return company;
  }
}
