import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../common/decorators';
import { ApiAuditService } from './api/api-audit.service';
import { ChangeHistoryService } from './history/change-history.service';
import { HistoryQueryDto, ApiAuditQueryDto } from './dto';
import { AuditService } from './audit.service';
import { AdvancedSearchDto, ComplianceReportDto, UserActivityReportDto } from './dto/audit.dto';

@Controller('audit')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly changeHistory: ChangeHistoryService,
    private readonly apiAudits: ApiAuditService,
  ) {}

  @Get('entities/:entityType')
  listEntityHistory(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.changeHistory.listByEntityType(tenantId, entityType, query);
  }

  @Get('entities/:entityType/:entityId')
  listEntityHistoryById(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.changeHistory.list(tenantId, entityType, entityId, query);
  }

  @Get('api-calls')
  listApiCalls(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.apiAudits.list(tenantId, query);
  }

  @Get('reports/compliance')
  complianceReport(@CurrentTenant() tenantId: string, @Query() query: ComplianceReportDto) {
    return this.auditService.complianceReport(tenantId, query);
  }

  @Get('reports/user-activity')
  userActivityReport(@CurrentTenant() tenantId: string, @Query() query: UserActivityReportDto) {
    return this.auditService.userActivityReport(tenantId, query);
  }

  @Post('search')
  advancedSearch(@CurrentTenant() tenantId: string, @Body() query: AdvancedSearchDto) {
    return this.auditService.advancedSearch(tenantId, query);
  }
}
