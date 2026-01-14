import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditSeverityLevel, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { CreateAuditAlertDto, IncidentQueryDto, UpdateAuditAlertDto } from '../dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string, isActive?: boolean) {
    const where: Prisma.AuditAlertWhereInput = { tenantId };
    if (isActive !== undefined) where.isActive = isActive;
    return this.prisma.auditAlert.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, userId: string | null, dto: CreateAuditAlertDto) {
    const alert = await this.prisma.auditAlert.create({
      data: {
        tenantId,
        alertName: dto.name,
        triggerConditions: (dto.conditions ?? {}) as Prisma.InputJsonValue,
        severity: dto.severity ?? AuditSeverityLevel.MEDIUM,
        notifyUsers: (dto.notifyUsers ?? []) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
        customFields: {
          description: dto.description,
          actions: dto.actions ?? [],
        } as Prisma.InputJsonValue,
        createdById: userId ?? undefined,
      },
    });

    return alert;
  }

  async update(tenantId: string, id: string, dto: UpdateAuditAlertDto) {
    const existing = await this.prisma.auditAlert.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    const customFields = {
      ...(existing.customFields as Record<string, unknown> | null | undefined),
      ...(dto.description ? { description: dto.description } : {}),
      ...(dto.actions ? { actions: dto.actions } : {}),
    } as Prisma.InputJsonValue;

    return this.prisma.auditAlert.update({
      where: { id },
      data: {
        alertName: dto.name ?? existing.alertName,
        triggerConditions: (dto.conditions ?? existing.triggerConditions) as Prisma.InputJsonValue,
        severity: dto.severity ?? existing.severity,
        notifyUsers: (dto.notifyUsers ?? existing.notifyUsers) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? existing.isActive,
        customFields,
      },
    });
  }

  async listIncidents(tenantId: string, query: IncidentQueryDto) {
    const where: Prisma.AuditAlertIncidentWhereInput = { tenantId };
    if (query.severity) where.severity = query.severity;
    if (query.resolved !== undefined) {
      const resolved = query.resolved === 'true';
      where.resolvedAt = resolved ? { not: null } : null;
    }

    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [incidents, total] = await Promise.all([
      this.prisma.auditAlertIncident.findMany({ where, take, skip, orderBy: { triggeredAt: 'desc' } }),
      this.prisma.auditAlertIncident.count({ where }),
    ]);

    return { data: incidents, total, limit: take, offset: skip };
  }

  async createIncident(params: {
    tenantId: string;
    alertId: string;
    severity: AuditSeverityLevel;
    triggerData: Prisma.InputJsonValue;
    message: string;
  }) {
    const incident = await this.prisma.auditAlertIncident.create({
      data: {
        tenantId: params.tenantId,
        auditAlertId: params.alertId,
        severity: params.severity,
        triggerData: params.triggerData,
        notes: params.message,
        customFields: { message: params.message } as Prisma.InputJsonValue,
      },
    });

    this.events.emit('audit.alert.triggered', { alertId: params.alertId, incident });
    return incident;
  }
}
