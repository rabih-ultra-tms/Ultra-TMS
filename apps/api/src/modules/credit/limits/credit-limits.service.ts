import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateCreditLimitDto } from '../dto/create-credit-limit.dto';
import { UpdateCreditLimitDto } from '../dto/update-credit-limit.dto';
import { CreditLimitQueryDto } from '../dto/credit-limit-query.dto';
import { IncreaseCreditLimitDto } from '../dto/increase-credit-limit.dto';
import { CreditLimitStatus, PaymentTerms } from '../dto/enums';

@Injectable()
export class CreditLimitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: CreditLimitQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CreditLimitWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { company: { name: { contains: query.search, mode: 'insensitive' } } },
              { company: { dbaName: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.creditLimit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      this.prisma.creditLimit.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneByCustomer(tenantId: string, companyId: string) {
    const limit = await this.prisma.creditLimit.findFirst({
      where: { tenantId, companyId, deletedAt: null },
    });

    if (!limit) {
      throw new NotFoundException('Credit limit not found');
    }

    return limit;
  }

  async create(tenantId: string, userId: string, dto: CreateCreditLimitDto) {
    await this.requireCompany(tenantId, dto.companyId);

    const existing = await this.prisma.creditLimit.findFirst({ where: { tenantId, companyId: dto.companyId, deletedAt: null } });
    if (existing) {
      throw new BadRequestException('Credit limit already exists for this customer');
    }

    const usedCredit = dto.usedCredit ?? 0;
    const availableCredit = Number(dto.creditLimit) - Number(usedCredit);
    const status = dto.status ?? (availableCredit < 0 ? CreditLimitStatus.EXCEEDED : CreditLimitStatus.ACTIVE);

    const created = await this.prisma.creditLimit.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        customerId: dto.companyId,
        creditLimit: dto.creditLimit,
        usedCredit,
        availableCredit,
        status,
        paymentTerms: dto.paymentTerms,
        gracePeriodDays: dto.gracePeriodDays ?? 0,
        singleLoadLimit: dto.singleLoadLimit,
        monthlyLimit: dto.monthlyLimit,
        nextReviewDate: dto.nextReviewDate ? new Date(dto.nextReviewDate) : undefined,
        reviewFrequencyDays: dto.reviewFrequencyDays ?? 90,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('credit.limit.created', {
      creditLimitId: created.id,
      companyId: dto.companyId,
      limit: dto.creditLimit,
      tenantId,
    });

    return created;
  }

  async update(tenantId: string, userId: string, companyId: string, dto: UpdateCreditLimitDto) {
    const limit = await this.requireLimit(tenantId, companyId);

    const nextLimit = dto.creditLimit ?? Number(limit.creditLimit);
    const nextUsed = dto.usedCredit ?? Number(limit.usedCredit ?? 0);
    const availableCredit = nextLimit - nextUsed;
    const status = dto.status ?? (availableCredit < 0 ? CreditLimitStatus.EXCEEDED : CreditLimitStatus.ACTIVE);

    const updated = await this.prisma.creditLimit.update({
      where: { id: limit.id },
      data: {
        creditLimit: dto.creditLimit ?? limit.creditLimit,
        usedCredit: dto.usedCredit ?? limit.usedCredit,
        availableCredit,
        paymentTerms: dto.paymentTerms ?? (limit.paymentTerms as PaymentTerms | null),
        status,
        singleLoadLimit: dto.singleLoadLimit ?? limit.singleLoadLimit,
        monthlyLimit: dto.monthlyLimit ?? limit.monthlyLimit,
        gracePeriodDays: dto.gracePeriodDays ?? limit.gracePeriodDays,
        nextReviewDate: dto.nextReviewDate ? new Date(dto.nextReviewDate) : limit.nextReviewDate,
        reviewFrequencyDays: dto.reviewFrequencyDays ?? limit.reviewFrequencyDays,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('credit.limit.changed', {
      creditLimitId: updated.id,
      oldLimit: limit.creditLimit,
      newLimit: updated.creditLimit,
      companyId,
      tenantId,
    });

    this.emitThresholdEvents(updated);

    return updated;
  }

  async increase(tenantId: string, userId: string, companyId: string, dto: IncreaseCreditLimitDto) {
    if (dto.increaseBy <= 0) {
      throw new BadRequestException('Increase must be positive');
    }

    const limit = await this.requireLimit(tenantId, companyId);
    const newLimit = Number(limit.creditLimit) + dto.increaseBy;
    return this.update(tenantId, userId, companyId, {
      creditLimit: newLimit,
      paymentTerms: dto.paymentTerms,
    });
  }

  async utilization(tenantId: string, companyId: string) {
    const limit = await this.requireLimit(tenantId, companyId);
    const utilization = this.computeUtilization(limit.usedCredit, limit.creditLimit);

    this.emitThresholdEvents(limit);

    return {
      creditLimit: limit.creditLimit,
      usedCredit: limit.usedCredit,
      availableCredit: limit.availableCredit,
      utilization,
      status: limit.status,
    };
  }

  private computeUtilization(used: Prisma.Decimal | number, limit: Prisma.Decimal | number) {
    const usedNum = Number(used || 0);
    const limitNum = Number(limit || 0);
    if (limitNum === 0) {
      return 0;
    }
    return (usedNum / limitNum) * 100;
  }

  private emitThresholdEvents(limit: { usedCredit: Prisma.Decimal; creditLimit: Prisma.Decimal; companyId?: string; tenantId?: string }) {
    const utilization = this.computeUtilization(limit.usedCredit, limit.creditLimit);
    const companyId = (limit as any).companyId;
    const tenantId = (limit as any).tenantId;

    if (utilization >= 80 && utilization < 100) {
      this.eventEmitter.emit('credit.warning.threshold', {
        companyId,
        utilization,
        tenantId,
      });
    }

    if (utilization >= 100) {
      this.eventEmitter.emit('credit.over.limit', {
        companyId,
        balance: limit.usedCredit,
        limit: limit.creditLimit,
        tenantId,
      });
    }
  }

  private async requireLimit(tenantId: string, companyId: string) {
    const limit = await this.prisma.creditLimit.findFirst({ where: { tenantId, companyId, deletedAt: null } });
    if (!limit) {
      throw new NotFoundException('Credit limit not found');
    }
    return limit;
  }

  private async requireCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Company not found for this tenant');
    }
    return company;
  }
}
