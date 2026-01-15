import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditActionCategory, AuditSeverity } from '@prisma/client';

export const AUDIT_METADATA_KEY = 'audit:meta';

export type AuditDecoratorPayload = {
  action: AuditAction;
  category?: AuditActionCategory;
  severity?: AuditSeverity;
  entityType: string;
  entityIdParam?: string;
  description?: string;
  sensitiveFields?: string[];
  metadata?: Record<string, unknown>;
};

export const Audit = (payload: AuditDecoratorPayload) => SetMetadata(AUDIT_METADATA_KEY, payload);
