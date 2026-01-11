import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { UpdateAmendmentDto } from './dto/update-amendment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AmendmentsService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  list(tenantId: string, contractId: string) {
    return this.prisma.contractAmendment.findMany({ where: { tenantId, contractId, deletedAt: null }, orderBy: { amendmentNumber: 'desc' } });
  }

  async create(tenantId: string, contractId: string, userId: string, dto: CreateAmendmentDto) {
    const currentCount = await this.prisma.contractAmendment.count({ where: { tenantId, contractId } });
    const amendment = await this.prisma.contractAmendment.create({
      data: {
        tenantId,
        contractId,
        amendmentNumber: currentCount + 1,
        effectiveDate: new Date(dto.effectiveDate),
        description: dto.description ?? '',
        changedFields: dto.changedFields ?? [],
        previousValues: Prisma.JsonNull,
        newValues: (dto.changes as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
        changedBy: userId,
        createdById: userId,
      },
    });
    this.eventEmitter.emit('amendment.created', { amendmentId: amendment.id, contractId, tenantId });
    return amendment;
  }

  async detail(tenantId: string, id: string) {
    const amend = await this.prisma.contractAmendment.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!amend) throw new NotFoundException('Amendment not found');
    return amend;
  }

  async update(id: string, tenantId: string, dto: UpdateAmendmentDto) {
    await this.detail(tenantId, id);
    return this.prisma.contractAmendment.update({ where: { id }, data: dto });
  }

  async approve(id: string, tenantId: string, userId: string) {
    await this.detail(tenantId, id);
    const amendment = await this.prisma.contractAmendment.update({ where: { id }, data: { approvedBy: userId, approvedAt: new Date() } });
    this.eventEmitter.emit('amendment.approved', { amendmentId: amendment.id, contractId: amendment.contractId, tenantId });
    return amendment;
  }

  async apply(id: string, tenantId: string) {
    const amend = await this.detail(tenantId, id);
    // For now, mark as applied using customFields flag
    return this.prisma.contractAmendment.update({
      where: { id },
      data: {
        customFields: {
          ...(((amend.customFields as Prisma.JsonObject | null) ?? {}) as Record<string, unknown>),
          appliedAt: new Date(),
        } as Prisma.InputJsonValue,
      },
    });
  }
}
