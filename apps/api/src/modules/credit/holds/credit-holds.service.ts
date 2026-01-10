import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateCreditHoldDto } from '../dto/create-credit-hold.dto';
import { ReleaseCreditHoldDto } from '../dto/release-credit-hold.dto';
import { CreditHoldReason } from '../dto/enums';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class CreditHoldsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: PaginationDto & { reason?: CreditHoldReason; isActive?: boolean }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CreditHoldWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.reason ? { reason: query.reason } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.creditHold.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      this.prisma.creditHold.count({ where }),
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
    return this.requireHold(tenantId, id);
  }

  async findByCustomer(tenantId: string, companyId: string) {
    return this.prisma.creditHold.findMany({
      where: { tenantId, companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateCreditHoldDto) {
    await this.requireCompany(tenantId, dto.companyId);

    const customFields = dto.triggerEvent || dto.notes ? { triggerEvent: dto.triggerEvent, notes: dto.notes } : undefined;

    const created = await this.prisma.creditHold.create({
      data: {
        tenantId,
        companyId: dto.companyId,
        customerId: dto.companyId,
        reason: dto.reason,
        description: dto.description,
        amountHeld: dto.amountHeld,
        isActive: true,
        customFields,
        createdById: userId,
        updatedById: userId,
      },
    });

    this.eventEmitter.emit('credit.hold.placed', {
      holdId: created.id,
      companyId: dto.companyId,
      reason: dto.reason,
      tenantId,
    });

    return created;
  }

  async release(tenantId: string, id: string, dto: ReleaseCreditHoldDto) {
    const hold = await this.requireHold(tenantId, id);

    if (!hold.isActive) {
      return hold;
    }

    const released = await this.prisma.creditHold.update({
      where: { id },
      data: {
        isActive: false,
        resolvedById: dto.releasedById,
        resolvedAt: new Date(),
        resolutionNotes: dto.resolutionNotes,
      },
    });

    this.eventEmitter.emit('credit.hold.released', {
      holdId: released.id,
      companyId: released.companyId,
      tenantId,
    });

    return released;
  }

  private async requireHold(tenantId: string, id: string) {
    const hold = await this.prisma.creditHold.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!hold) {
      throw new NotFoundException('Credit hold not found');
    }
    return hold;
  }

  private async requireCompany(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, tenantId, deletedAt: null } });
    if (!company) {
      throw new NotFoundException('Company not found for this tenant');
    }
    return company;
  }
}
