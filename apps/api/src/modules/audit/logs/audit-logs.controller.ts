import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AuditLogsService } from './audit-logs.service';
import { ExportAuditLogsDto, QueryAuditLogsDto, VerifyAuditChainDto } from '../dto';

@Controller('audit/logs')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: QueryAuditLogsDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('summary')
  summary(@CurrentTenant() tenantId: string) {
    return this.service.summary(tenantId);
  }

  @Get('export')
  export(@CurrentTenant() tenantId: string, @Query() query: ExportAuditLogsDto) {
    return this.service.export(tenantId, query);
  }

  @Post('verify')
  verify(@CurrentTenant() tenantId: string, @Body() dto: VerifyAuditChainDto) {
    return this.service.verifyChain(tenantId, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }
}
