import { Injectable, NotFoundException } from '@nestjs/common';
import { ComplianceStatus, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { CreateComplianceCheckpointDto } from '../dto';

@Injectable()
export class CheckpointService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string) {
    return this.prisma.complianceCheckpoint.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, userId: string | null, dto: CreateComplianceCheckpointDto) {
    const stats = await this.buildStats(tenantId);

    const checkpoint = await this.prisma.complianceCheckpoint.create({
      data: {
        tenantId,
        checkpointName: dto.checkpointName,
        entityType: dto.entityType,
        entityId: dto.entityId,
        requirement: dto.requirement ?? 'Auto-generated checkpoint',
        status: ComplianceStatus.PENDING_VERIFICATION,
        verifiedBy: null,
        verifiedAt: null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        customFields: stats as Prisma.InputJsonValue,
        createdById: userId ?? undefined,
      },
    });

    this.events.emit('audit.checkpoint.created', { checkpointId: checkpoint.id });
    return checkpoint;
  }

  async verify(tenantId: string, id: string, userId: string | null) {
    const checkpoint = await this.prisma.complianceCheckpoint.findFirst({ where: { id, tenantId } });
    if (!checkpoint) {
      throw new NotFoundException('Compliance checkpoint not found');
    }

    return this.prisma.complianceCheckpoint.update({
      where: { id },
      data: {
        status: ComplianceStatus.COMPLIANT,
        verifiedAt: new Date(),
        verifiedBy: userId ?? undefined,
      },
    });
  }

  private async buildStats(tenantId: string) {
    const [auditLogs, changes, access, login, api] = await Promise.all([
      this.prisma.auditLog.count({ where: { tenantId } }),
      this.prisma.changeHistory.count({ where: { tenantId } }),
      this.prisma.accessLog.count({ where: { tenantId } }),
      this.prisma.loginAudit.count({ where: { tenantId } }),
      this.prisma.aPIAuditLog.count({ where: { tenantId } }),
    ]);

    return { auditLogs, changes, access, login, api };
  }
}
