import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AuditLogsService } from '../logs/audit-logs.service';
import { AccessLogService } from './access-log.service';
import { LoginAuditService } from './login-audit.service';
import { AccessLogQueryDto, LoginAuditQueryDto, UserActivityQueryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class UserActivityController {
  constructor(
    private readonly auditLogs: AuditLogsService,
    private readonly loginAudits: LoginAuditService,
    private readonly accessLogs: AccessLogService,
  ) {}

  @Get('users/:userId/activity')
  @ApiOperation({ summary: 'Get user activity' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiStandardResponse('User activity')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'List login audits' })
  @ApiStandardResponse('Login audits list')
  @ApiErrorResponses()
  loginAuditsList(@CurrentTenant() tenantId: string, @Query() query: LoginAuditQueryDto) {
    return this.loginAudits.list(tenantId, query);
  }

  @Get('logins/summary')
  @ApiOperation({ summary: 'Get login audit summary' })
  @ApiStandardResponse('Login audit summary')
  @ApiErrorResponses()
  loginSummary(@CurrentTenant() tenantId: string) {
    return this.loginAudits.summary(tenantId);
  }

  @Get('access')
  @ApiOperation({ summary: 'List access logs' })
  @ApiStandardResponse('Access logs list')
  @ApiErrorResponses()
  accessLogsList(@CurrentTenant() tenantId: string, @Query() query: AccessLogQueryDto) {
    return this.accessLogs.list(tenantId, query);
  }
}
