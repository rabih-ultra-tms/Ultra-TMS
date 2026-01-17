import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AuditLogsService } from './audit-logs.service';
import { ExportAuditLogsDto, QueryAuditLogsDto, VerifyAuditChainDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/logs')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs' })
  @ApiStandardResponse('Audit logs list')
  @ApiErrorResponses()
  findAll(@CurrentTenant() tenantId: string, @Query() query: QueryAuditLogsDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get audit logs summary' })
  @ApiStandardResponse('Audit logs summary')
  @ApiErrorResponses()
  summary(@CurrentTenant() tenantId: string) {
    return this.service.summary(tenantId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiStandardResponse('Audit logs export')
  @ApiErrorResponses()
  export(@CurrentTenant() tenantId: string, @Query() query: ExportAuditLogsDto) {
    return this.service.export(tenantId, query);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify audit log chain' })
  @ApiStandardResponse('Audit chain verification')
  @ApiErrorResponses()
  verify(@CurrentTenant() tenantId: string, @Body() dto: VerifyAuditChainDto) {
    return this.service.verifyChain(tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiStandardResponse('Audit log details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }
}
