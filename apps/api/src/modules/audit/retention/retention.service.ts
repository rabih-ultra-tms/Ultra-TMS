import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateRetentionPolicyDto, UpdateRetentionPolicyDto } from '../dto';

@Injectable()
export class RetentionService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string) {
    return this.prisma.auditRetentionPolicy.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, dto: CreateRetentionPolicyDto) {
    const archiveAfterDays = dto.archiveAfterDays ?? (dto.archiveFirst ? dto.retentionDays : null);
    const deleteAfterDays = dto.deleteAfterDays ?? dto.retentionDays;

    const policy = await this.prisma.auditRetentionPolicy.create({
      data: {
        tenantId,
        entityType: dto.logType,
        retentionDays: dto.retentionDays,
        archiveAfterDays: archiveAfterDays ?? null,
        deleteAfterDays: deleteAfterDays ?? null,
        isActive: dto.isActive ?? true,
        customFields: dto.archiveLocation ? ({ archiveLocation: dto.archiveLocation } as Prisma.InputJsonValue) : undefined,
      },
    });

    this.events.emit('audit.retention.completed', { policyId: policy.id, records: 0 });
    return policy;
  }

  async update(tenantId: string, id: string, dto: UpdateRetentionPolicyDto) {
    const existing = await this.prisma.auditRetentionPolicy.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new NotFoundException('Retention policy not found');
    }

    const archiveAfterDays = dto.archiveAfterDays ?? (dto.archiveFirst ? dto.retentionDays ?? existing.retentionDays : existing.archiveAfterDays);
    const deleteAfterDays = dto.deleteAfterDays ?? existing.deleteAfterDays;

    return this.prisma.auditRetentionPolicy.update({
      where: { id },
      data: {
        entityType: dto.logType ?? existing.entityType,
        retentionDays: dto.retentionDays ?? existing.retentionDays,
        archiveAfterDays: archiveAfterDays ?? null,
        deleteAfterDays: deleteAfterDays ?? null,
        isActive: dto.isActive ?? existing.isActive,
        customFields: dto.archiveLocation
          ? ({ ...(existing.customFields as Record<string, unknown> | null | undefined), archiveLocation: dto.archiveLocation } as Prisma.InputJsonValue)
          : (existing.customFields as Prisma.InputJsonValue),
      },
    });
  }
}
