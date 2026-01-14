import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { ApiAuditService } from './api-audit.service';
import { ApiAuditQueryDto } from '../dto';

@Controller('audit/api')
@UseGuards(JwtAuthGuard)
export class ApiAuditController {
  constructor(private readonly service: ApiAuditService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Get('errors')
  listErrors(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.service.listErrors(tenantId, query);
  }

  @Get(':requestId')
  detail(@CurrentTenant() tenantId: string, @Param('requestId') requestId: string) {
    return this.service.findById(tenantId, requestId);
  }
}
