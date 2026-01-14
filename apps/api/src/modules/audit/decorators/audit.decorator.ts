import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit:meta';

export type AuditDecoratorPayload = {
  action?: string;
  entityType?: string;
  entityIdParam?: string;
};

export const Audit = (payload: AuditDecoratorPayload) => SetMetadata(AUDIT_METADATA_KEY, payload);
