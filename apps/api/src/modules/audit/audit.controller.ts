import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../common/decorators';
import { ApiAuditService } from './api/api-audit.service';
import { ChangeHistoryService } from './history/change-history.service';
import { HistoryQueryDto, ApiAuditQueryDto } from './dto';
import { AuditService } from './audit.service';
import { AdvancedSearchDto, ComplianceReportDto, UserActivityReportDto } from './dto/audit.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

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
  @ApiOperation({ summary: 'List entity history by type' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiStandardResponse('Entity history list')
  @ApiErrorResponses()
  listEntityHistory(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.changeHistory.listByEntityType(tenantId, entityType, query);
  }

  @Get('entities/:entityType/:entityId')
  @ApiOperation({ summary: 'List entity history by ID' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiStandardResponse('Entity history list')
  @ApiErrorResponses()
  listEntityHistoryById(
    @CurrentTenant() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.changeHistory.list(tenantId, entityType, entityId, query);
  }

  @Get('api-calls')
  @ApiOperation({ summary: 'List API audit calls' })
  @ApiStandardResponse('API audit calls list')
  @ApiErrorResponses()
  listApiCalls(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.apiAudits.list(tenantId, query);
  }

  @Get('reports/compliance')
  @ApiOperation({ summary: 'Get compliance report' })
  @ApiStandardResponse('Compliance report')
  @ApiErrorResponses()
  complianceReport(@CurrentTenant() tenantId: string, @Query() query: ComplianceReportDto) {
    return this.auditService.complianceReport(tenantId, query);
  }

  @Get('reports/user-activity')
  @ApiOperation({ summary: 'Get user activity report' })
  @ApiStandardResponse('User activity report')
  @ApiErrorResponses()
  userActivityReport(@CurrentTenant() tenantId: string, @Query() query: UserActivityReportDto) {
    return this.auditService.userActivityReport(tenantId, query);
  }

  @Post('search')
  @ApiOperation({ summary: 'Advanced audit search' })
  @ApiStandardResponse('Advanced search results')
  @ApiErrorResponses()
  advancedSearch(@CurrentTenant() tenantId: string, @Body() query: AdvancedSearchDto) {
    return this.auditService.advancedSearch(tenantId, query);
  }
}
