import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AuditLogsService } from '../logs/audit-logs.service';
import { AccessLogService } from './access-log.service';
import { LoginAuditService } from './login-audit.service';
import { AccessLogQueryDto, LoginAuditQueryDto, UserActivityQueryDto } from '../dto';

@Controller('audit')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
export class UserActivityController {
  constructor(
    private readonly auditLogs: AuditLogsService,
    private readonly loginAudits: LoginAuditService,
    private readonly accessLogs: AccessLogService,
  ) {}

  @Get('users/:userId/activity')
  userActivity(
    @CurrentTenant() tenantId: string,
    @Param('userId') userId: string,
    @Query() query: UserActivityQueryDto,
  ) {
    return this.auditLogs.findAll(tenantId, {
      userId,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    });
  }

  @Get('logins')
  loginAuditsList(@CurrentTenant() tenantId: string, @Query() query: LoginAuditQueryDto) {
    return this.loginAudits.list(tenantId, query);
  }

  @Get('logins/summary')
  loginSummary(@CurrentTenant() tenantId: string) {
    return this.loginAudits.summary(tenantId);
  }

  @Get('access')
  accessLogsList(@CurrentTenant() tenantId: string, @Query() query: AccessLogQueryDto) {
    return this.accessLogs.list(tenantId, query);
  }
}
