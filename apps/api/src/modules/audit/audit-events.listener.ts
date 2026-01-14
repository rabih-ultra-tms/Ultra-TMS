import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditAction, AuditActionCategory, AuditSeverity, LoginMethod, Prisma } from '@prisma/client';
import { AuditLogsService } from './logs/audit-logs.service';
import { LoginAuditService } from './activity/login-audit.service';

type EventPayload = {
  tenantId?: string | null;
  userId?: string | null;
  email?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  method?: string | null;
  failureReason?: string | null;
  sessionId?: string | null;
  [key: string]: unknown;
};

@Injectable()
export class AuditEventsListener {
  constructor(private readonly auditLogs: AuditLogsService, private readonly loginAudits: LoginAuditService) {}

  @OnEvent('*.created')
  async handleCreated(payload: EventPayload, event?: string) {
    await this.recordAudit(AuditAction.CREATE, payload, event);
  }

  @OnEvent('*.updated')
  async handleUpdated(payload: EventPayload, event?: string) {
    await this.recordAudit(AuditAction.UPDATE, payload, event);
  }

  @OnEvent('*.deleted')
  async handleDeleted(payload: EventPayload, event?: string) {
    await this.recordAudit(AuditAction.DELETE, payload, event);
  }

  @OnEvent('user.login')
  async handleUserLogin(payload: EventPayload) {
    await this.loginAudits.record({
      tenantId: payload.tenantId ?? null,
      userId: payload.userId ?? null,
      email: payload.email ?? undefined,
      method: payload.method as LoginMethod | undefined,
      success: true,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
      sessionId: payload.sessionId ?? null,
    });
  }

  @OnEvent('user.logout')
  async handleUserLogout(payload: EventPayload) {
    await this.loginAudits.record({
      tenantId: payload.tenantId ?? null,
      userId: payload.userId ?? null,
      email: payload.email ?? undefined,
      method: payload.method as LoginMethod | undefined,
      success: true,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
      sessionId: payload.sessionId ?? null,
    });
  }

  @OnEvent('user.login.failed')
  async handleUserLoginFailed(payload: EventPayload) {
    await this.loginAudits.record({
      tenantId: payload.tenantId ?? null,
      userId: payload.userId ?? null,
      email: payload.email ?? undefined,
      method: payload.method as LoginMethod | undefined,
      success: false,
      failureReason: payload.failureReason ?? 'login_failed',
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
      sessionId: payload.sessionId ?? null,
    });
  }

  private async recordAudit(action: AuditAction, payload: EventPayload, event?: string) {
    const { entityType, entityId } = this.extractEntity(event, payload);
    const metadata: Prisma.InputJsonValue = this.buildMetadata(payload, action, event);

    await this.auditLogs.log({
      tenantId: payload.tenantId ?? null,
      userId: payload.userId ?? null,
      action,
      category: AuditActionCategory.DATA,
      severity: AuditSeverity.INFO,
      entityType,
      entityId,
      description: payload.description ?? `${entityType ?? 'entity'} ${action.toLowerCase()}`,
      metadata,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
    });
  }

  private extractEntity(event: string | undefined, payload: EventPayload) {
    const parts = (event ?? '').split('.').filter(Boolean);
    const entityType = payload.entityType ?? parts[0] ?? 'event';

    const candidateIds = [
      payload.entityId,
      payload.id as string | undefined,
      (parts[0] ? (payload[`${parts[0]}Id`] as string | undefined) : undefined),
      (payload['resourceId'] as string | undefined),
    ];

    const entityId = candidateIds.find(id => !!id) ?? null;
    return { entityType, entityId };
  }

  private buildMetadata(payload: EventPayload, action: AuditAction, event?: string): Prisma.InputJsonValue {
    const sanitized = { ...payload } as Record<string, unknown>;
    delete sanitized.entityType;
    delete sanitized.entityId;
    delete sanitized.description;
    delete sanitized.metadata;
    return {
      ...(payload.metadata as Record<string, unknown> | null | undefined),
      event,
      action,
      payload: sanitized,
    } as Prisma.InputJsonValue;
  }
}