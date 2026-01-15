import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuditLogsController } from './logs/audit-logs.controller';
import { AuditLogsService } from './logs/audit-logs.service';
import { AuditHashService } from './logs/audit-hash.service';
import { ChangeHistoryController } from './history/change-history.controller';
import { ChangeHistoryService } from './history/change-history.service';
import { UserActivityController } from './activity/user-activity.controller';
import { LoginAuditService } from './activity/login-audit.service';
import { AccessLogService } from './activity/access-log.service';
import { ApiAuditController } from './api/api-audit.controller';
import { ApiAuditService } from './api/api-audit.service';
import { ComplianceController } from './compliance/compliance.controller';
import { CheckpointService } from './compliance/checkpoint.service';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';
import { AlertProcessorService } from './alerts/alert-processor.service';
import { RetentionController } from './retention/retention.controller';
import { RetentionService } from './retention/retention.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditEventsListener } from './audit-events.listener';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  controllers: [
    AuditController,
    AuditLogsController,
    ChangeHistoryController,
    UserActivityController,
    ApiAuditController,
    ComplianceController,
    AlertsController,
    RetentionController,
  ],
  providers: [
    PrismaService,
    AuditService,
    AuditLogsService,
    AuditHashService,
    ChangeHistoryService,
    LoginAuditService,
    AccessLogService,
    ApiAuditService,
    CheckpointService,
    AlertsService,
    AlertProcessorService,
    RetentionService,
    AuditEventsListener,
    AuditInterceptor,
  ],
  exports: [AuditLogsService, AuditInterceptor],
})
export class AuditModule {}
