import { Injectable } from '@nestjs/common';
import { AuditLog, AuditSeverityLevel, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { AlertsService } from './alerts.service';

@Injectable()
export class AlertProcessorService {
  constructor(private readonly prisma: PrismaService, private readonly alerts: AlertsService) {}

  async evaluateAlertsForLog(log: AuditLog) {
    if (!log.tenantId) return;

    const activeAlerts = await this.prisma.auditAlert.findMany({ where: { tenantId: log.tenantId, isActive: true } });
    for (const alert of activeAlerts) {
      const conditions = (alert.triggerConditions ?? {}) as Record<string, unknown>;
      if (!this.matchesConditions(conditions, log)) continue;

      await this.alerts.createIncident({
        tenantId: log.tenantId,
        alertId: alert.id,
        severity: alert.severity ?? AuditSeverityLevel.MEDIUM,
        triggerData: { logId: log.id, action: log.action, entityType: log.entityType } as Prisma.InputJsonValue,
        message: `Alert ${alert.alertName} triggered by ${log.action}`,
      });
    }
  }

  private matchesConditions(conditions: Record<string, unknown>, log: AuditLog): boolean {
    const actions = conditions.actions as string[] | undefined;
    if (actions && actions.length && !actions.includes(log.action)) return false;

    const resourceTypes = conditions.resourceTypes as string[] | undefined;
    if (resourceTypes && resourceTypes.length && log.entityType && !resourceTypes.includes(log.entityType)) return false;

    const userIds = conditions.userIds as string[] | undefined;
    if (userIds && userIds.length && log.userId && !userIds.includes(log.userId)) return false;

    const ipAddresses = conditions.ipAddresses as string[] | undefined;
    if (ipAddresses && ipAddresses.length && log.ipAddress && !ipAddresses.includes(log.ipAddress)) return false;

    return true;
  }
}
