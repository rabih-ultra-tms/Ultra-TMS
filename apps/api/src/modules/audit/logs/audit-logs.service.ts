import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditAction, AuditActionCategory, AuditLog, AuditSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ExportAuditLogsDto, QueryAuditLogsDto, VerifyAuditChainDto } from '../dto';
import { AlertProcessorService } from '../alerts/alert-processor.service';
import { AuditHashService } from './audit-hash.service';

const SENSITIVE_FIELDS = ['password', 'ssn', 'taxId', 'bankAccount', 'creditCard', 'apiKey', 'token', 'secret'];

type CreateAuditLogParams = {
  tenantId?: string | null;
  userId?: string | null;
  action: AuditAction;
  category?: AuditActionCategory;
  severity?: AuditSeverity;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  externalId?: string | null;
  sourceSystem?: string | null;
};

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly hashService: AuditHashService,
    private readonly alertProcessor: AlertProcessorService,
  ) {}

  async findAll(tenantId: string, query: QueryAuditLogsDto) {
    const where = this.buildWhere(tenantId, query);
    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map(log => this.toResponse(log)),
      total,
      limit: take,
      offset: skip,
    };
  }

  async findOne(tenantId: string, id: string) {
    const log = await this.prisma.auditLog.findFirst({ where: { id, tenantId } });
    if (!log) {
      throw new NotFoundException('Audit log not found');
    }
    return this.toResponse(log);
  }

  async export(tenantId: string, dto: ExportAuditLogsDto) {
    const where = this.buildWhere(tenantId, dto);
    const take = dto.limit ?? 500;
    const skip = dto.offset ?? 0;

    const logs = await this.prisma.auditLog.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } });

    return {
      format: dto.format,
      count: logs.length,
      data: dto.includeDetails ? logs.map(log => this.toResponse(log)) : logs.map(log => ({
        id: log.id,
        createdAt: log.createdAt,
        action: log.action,
        category: log.category,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId,
        severity: log.severity,
      })),
    };
  }

  async summary(tenantId: string) {
    const where: Prisma.AuditLogWhereInput = { tenantId };

    const [total, byAction, byCategory, bySeverity] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.groupBy({ where, by: ['action'], _count: { _all: true } }),
      this.prisma.auditLog.groupBy({ where, by: ['category'], _count: { _all: true } }),
      this.prisma.auditLog.groupBy({ where, by: ['severity'], _count: { _all: true } }),
    ]);

    return {
      total,
      byAction: byAction.reduce((acc, curr) => ({ ...acc, [curr.action]: curr._count._all }), {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, curr) => ({ ...acc, [curr.category]: curr._count._all }), {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, curr) => ({ ...acc, [curr.severity]: curr._count._all }), {} as Record<string, number>),
    };
  }

  async verifyChain(tenantId: string, dto: VerifyAuditChainDto) {
    const where: Prisma.AuditLogWhereInput = { tenantId };

    if (dto.startId) {
      const start = await this.prisma.auditLog.findUnique({ where: { id: dto.startId } });
      if (start?.createdAt) {
        const existing = (where.createdAt as Prisma.DateTimeFilter | undefined) ?? {};
        where.createdAt = { ...existing, gte: start.createdAt };
      }
    }

    if (dto.endId) {
      const end = await this.prisma.auditLog.findUnique({ where: { id: dto.endId } });
      if (end?.createdAt) {
        const existing = (where.createdAt as Prisma.DateTimeFilter | undefined) ?? {};
        where.createdAt = { ...existing, lte: end.createdAt };
      }
    }

    const logs = await this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'asc' } });
    const result = this.hashService.verifyChain(logs);

    if (!result.valid && result.brokenAt) {
      this.events.emit('audit.integrity.broken', { logId: result.brokenAt });
    }

    return result;
  }

  async log(params: CreateAuditLogParams): Promise<AuditLog> {
    const category = params.category ?? AuditActionCategory.DATA;
    const severity = params.severity ?? AuditSeverity.INFO;
    const sanitizedMetadata = this.redactSensitiveData(params.metadata ?? {}) as Prisma.InputJsonValue;

    const previous = params.tenantId
      ? await this.prisma.auditLog.findFirst({ where: { tenantId: params.tenantId }, orderBy: { createdAt: 'desc' } })
      : null;

    const previousHash = previous ? this.hashService.extractHashes(previous).hash ?? null : null;

    const created = await this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId ?? null,
        userId: params.userId ?? null,
        action: params.action,
        category,
        severity,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        description: params.description ?? null,
        metadata: sanitizedMetadata,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        externalId: params.externalId ?? null,
        sourceSystem: params.sourceSystem ?? null,
      },
    });

    const hashed = this.hashService.withHashMetadata(created, previousHash);
    const updated = await this.prisma.auditLog.update({
      where: { id: created.id },
      data: { metadata: hashed.metadata as Prisma.InputJsonValue },
    });

    this.events.emit('audit.logged', { logId: updated.id, action: updated.action });
    // Fire alert checks asynchronously to keep latency low
    this.alertProcessor
      .evaluateAlertsForLog(updated)
      .catch(() => null);
    return updated;
  }

  private buildWhere(tenantId: string, query: QueryAuditLogsDto): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = { tenantId };

    if (query.action) where.action = query.action;
    if (query.category) where.category = query.category;
    if (query.severity) where.severity = query.severity;
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.userId) where.userId = query.userId;

    if (query.startDate || query.endDate) {
      where.createdAt = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    return where;
  }

  private redactSensitiveData(input: Prisma.InputJsonValue): Prisma.InputJsonValue {
    if (Array.isArray(input)) {
      return input.map(item => this.redactSensitiveData(item)) as Prisma.InputJsonValue;
    }

    if (input && typeof input === 'object') {
      const obj = input as Record<string, unknown>;
      const result: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.includes(key)) {
          result[key] = '[REDACTED]';
          continue;
        }

        result[key] = this.redactSensitiveData(value as Prisma.InputJsonValue) as unknown;
      }

      return result as Prisma.InputJsonValue;
    }

    return input;
  }

  private toResponse(log: AuditLog) {
    const metadata = ((log.metadata ?? {}) as Record<string, unknown>) ?? {};
    return { ...log, metadata };
  }
}
