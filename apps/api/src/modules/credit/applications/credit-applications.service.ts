import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ApproveCreditApplicationDto } from '../dto/approve-application.dto';
import { CreateCreditApplicationDto, UpdateCreditApplicationDto } from '../dto/create-application.dto';
import { CreditApplicationQueryDto } from '../dto/application-query.dto';
import { RejectCreditApplicationDto } from '../dto/reject-application.dto';
import { CreditApplicationStatus, CreditLimitStatus, PaymentTerms } from '../dto/enums';

@Injectable()
export class CreditApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateCreditApplicationDto) {
    await this.requireCompany(tenantId, dto.companyId);

    const applicationNumber = await this.generateApplicationNumber(tenantId);
    const customFields: Record<string, unknown> = {};

    if (dto.requestedTerms) {
      customFields.requestedTerms = dto.requestedTerms;
    }
    if (dto.submittedAt) {
      customFields.submittedAt = dto.submittedAt;
    }

    return this.prisma.creditApplication.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        customerId: dto.companyId,
        applicationNumber,
        status: CreditApplicationStatus.PENDING,
        requestedLimit: dto.requestedLimit,
        businessName: dto.businessName,
        dbaName: dto.dbaName,
        federalTaxId: dto.federalTaxId,
        dunsNumber: dto.dunsNumber,
        yearsInBusiness: dto.yearsInBusiness,
        annualRevenue: dto.annualRevenue,
        bankName: dto.bankName,
        bankContactName: dto.bankContactName,
        bankContactPhone: dto.bankContactPhone,
        tradeReferences: dto.tradeReferences ? (dto.tradeReferences as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        ownerName: dto.ownerName,
        ownerAddress: dto.ownerAddress,
        ownerSSN: dto.ownerSSN,
        customFields: Object.keys(customFields).length ? (customFields as Prisma.InputJsonValue) : undefined,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(tenantId: string, query: CreditApplicationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CreditApplicationWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { businessName: { contains: query.search, mode: 'insensitive' } },
              { dbaName: { contains: query.search, mode: 'insensitive' } },
              { applicationNumber: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.creditApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.creditApplication.count({ where }),
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
    return this.requireApplication(tenantId, id);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateCreditApplicationDto) {
    const application = await this.requireApplication(tenantId, id);

    if ([CreditApplicationStatus.APPROVED, CreditApplicationStatus.DENIED, CreditApplicationStatus.EXPIRED].includes(application.status as CreditApplicationStatus)) {
      throw new BadRequestException('Approved or denied applications cannot be updated');
    }

    if (dto.companyId && dto.companyId !== application.companyId) {
      await this.requireCompany(tenantId, dto.companyId);
    }

    const customFields = (application.customFields as Record<string, unknown>) || {};
    const nextCustomFields = {
      ...customFields,
      ...(dto.requestedTerms !== undefined ? { requestedTerms: dto.requestedTerms } : {}),
      ...(dto.submittedAt !== undefined ? { submittedAt: dto.submittedAt } : {}),
    };

    const data: Prisma.CreditApplicationUpdateInput = {
      ...(dto.businessName !== undefined ? { businessName: dto.businessName } : {}),
      ...(dto.dbaName !== undefined ? { dbaName: dto.dbaName } : {}),
      ...(dto.federalTaxId !== undefined ? { federalTaxId: dto.federalTaxId } : {}),
      ...(dto.dunsNumber !== undefined ? { dunsNumber: dto.dunsNumber } : {}),
      ...(dto.requestedLimit !== undefined ? { requestedLimit: dto.requestedLimit } : {}),
      ...(dto.yearsInBusiness !== undefined ? { yearsInBusiness: dto.yearsInBusiness } : {}),
      ...(dto.annualRevenue !== undefined ? { annualRevenue: dto.annualRevenue } : {}),
      ...(dto.bankName !== undefined ? { bankName: dto.bankName } : {}),
      ...(dto.bankContactName !== undefined ? { bankContactName: dto.bankContactName } : {}),
      ...(dto.bankContactPhone !== undefined ? { bankContactPhone: dto.bankContactPhone } : {}),
      ...(dto.tradeReferences !== undefined
        ? { tradeReferences: (dto.tradeReferences as unknown as Prisma.InputJsonValue) ?? Prisma.JsonNull }
        : {}),
      ...(dto.ownerName !== undefined ? { ownerName: dto.ownerName } : {}),
      ...(dto.ownerAddress !== undefined ? { ownerAddress: dto.ownerAddress } : {}),
      ...(dto.ownerSSN !== undefined ? { ownerSSN: dto.ownerSSN } : {}),
      ...(dto.companyId !== undefined
        ? { company: { connect: { id: dto.companyId } }, customerId: dto.companyId }
        : {}),
      ...(Object.keys(nextCustomFields).length ? { customFields: nextCustomFields as Prisma.InputJsonValue } : {}),
      updatedById: userId,
    };

    return this.prisma.creditApplication.update({
      where: { id },
      data,
    });
  }

  async delete(tenantId: string, userId: string, id: string) {
    const application = await this.requireApplication(tenantId, id);

    if (application.status !== CreditApplicationStatus.PENDING && application.status !== CreditApplicationStatus.UNDER_REVIEW) {
      throw new BadRequestException('Only pending applications can be deleted');
    }

    await this.prisma.creditApplication.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async submit(tenantId: string, id: string, userId: string) {
    const application = await this.requireApplication(tenantId, id);

    if (application.status !== CreditApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be submitted');
    }

    const updated = await this.prisma.creditApplication.update({
      where: { id },
      data: {
        status: CreditApplicationStatus.UNDER_REVIEW,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });

    this.eventEmitter.emit('credit.application.submitted', {
      applicationId: id,
      companyId: application.companyId,
      tenantId,
    });

    return updated;
  }

  async approve(tenantId: string, id: string, userId: string, dto: ApproveCreditApplicationDto) {
    const application = await this.requireApplication(tenantId, id);

    if (![CreditApplicationStatus.PENDING, CreditApplicationStatus.UNDER_REVIEW, CreditApplicationStatus.CONDITIONAL_APPROVAL].includes(application.status as CreditApplicationStatus)) {
      throw new BadRequestException('Application is not in a reviewable state');
    }

    const updated = await this.prisma.creditApplication.update({
      where: { id },
      data: {
        status: CreditApplicationStatus.APPROVED,
        approvedLimit: dto.approvedLimit,
        approvedAt: new Date(),
        reviewedById: userId,
        reviewedAt: new Date(),
        conditions: dto.decisionNotes,
        updatedById: userId,
      },
    });

    await this.upsertCreditLimit(tenantId, application.companyId, dto.approvedLimit, dto.paymentTerms, userId);

    this.eventEmitter.emit('credit.application.approved', {
      applicationId: id,
      companyId: application.companyId,
      approvedAmount: dto.approvedLimit,
      tenantId,
    });

    return updated;
  }

  async reject(tenantId: string, id: string, userId: string, dto: RejectCreditApplicationDto) {
    const application = await this.requireApplication(tenantId, id);

    if (![CreditApplicationStatus.PENDING, CreditApplicationStatus.UNDER_REVIEW, CreditApplicationStatus.CONDITIONAL_APPROVAL].includes(application.status as CreditApplicationStatus)) {
      throw new BadRequestException('Application is not in a reviewable state');
    }

    const updated = await this.prisma.creditApplication.update({
      where: { id },
      data: {
        status: CreditApplicationStatus.DENIED,
        denialReason: dto.reason,
        reviewedById: userId,
        reviewedAt: new Date(),
        conditions: dto.decisionNotes,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('credit.application.rejected', {
      applicationId: id,
      companyId: application.companyId,
      reason: dto.reason,
      tenantId,
    });

    return updated;
  }

  private async upsertCreditLimit(
    tenantId: string,
    companyId: string,
    limitAmount: number,
    paymentTerms: PaymentTerms | undefined,
    userId: string,
  ) {
    const existing = await this.prisma.creditLimit.findFirst({
      where: { tenantId, companyId, deletedAt: null },
    });

    if (existing) {
      const availableCredit = Number(limitAmount) - Number(existing.usedCredit || 0);
      const updated = await this.prisma.creditLimit.update({
        where: { id: existing.id },
        data: {
          creditLimit: limitAmount,
          availableCredit,
          status: availableCredit < 0 ? CreditLimitStatus.EXCEEDED : CreditLimitStatus.ACTIVE,
          paymentTerms: paymentTerms ?? existing.paymentTerms,
          approvedById: userId,
          approvedAt: new Date(),
          updatedById: userId,
        },
      });

      this.eventEmitter.emit('credit.limit.changed', {
        creditLimitId: existing.id,
        oldLimit: existing.creditLimit,
        newLimit: limitAmount,
        companyId,
        tenantId,
      });

      return updated;
    }

    const created = await this.prisma.creditLimit.create({
      data: {
        tenantId,
        companyId,
        customerId: companyId,
        creditLimit: limitAmount,
        availableCredit: limitAmount,
        usedCredit: 0,
        status: CreditLimitStatus.ACTIVE,
        paymentTerms: paymentTerms,
        approvedById: userId,
        approvedAt: new Date(),
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('credit.limit.created', {
      creditLimitId: created.id,
      companyId,
      limit: limitAmount,
      tenantId,
    });

    return created;
  }

  private async requireApplication(tenantId: string, id: string) {
    const application = await this.prisma.creditApplication.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!application) {
      throw new NotFoundException('Credit application not found');
    }

    return application;
  }

  private async requireCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Company not found for this tenant');
    }
    return company;
  }

  private async generateApplicationNumber(tenantId: string, attempt = 0): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomPart = Math.floor(Math.random() * 10_000)
      .toString()
      .padStart(4, '0');
    const applicationNumber = `CRA-${datePart}-${randomPart}`;

    const existing = await this.prisma.creditApplication.count({
      where: { tenantId, applicationNumber },
    });

    if (existing === 0) {
      return applicationNumber;
    }

    if (attempt > 3) {
      throw new BadRequestException('Unable to generate unique application number');
    }

    return this.generateApplicationNumber(tenantId, attempt + 1);
  }
}
