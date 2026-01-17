import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { ApiAuditService } from './api-audit.service';
import { ApiAuditQueryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/api')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class ApiAuditController {
  constructor(private readonly service: ApiAuditService) {}

  @Get()
  @ApiOperation({ summary: 'List API audits' })
  @ApiStandardResponse('API audits list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Get('errors')
  @ApiOperation({ summary: 'List API audit errors' })
  @ApiStandardResponse('API audit errors list')
  @ApiErrorResponses()
  listErrors(@CurrentTenant() tenantId: string, @Query() query: ApiAuditQueryDto) {
    return this.service.listErrors(tenantId, query);
  }

  @Get(':requestId')
  @ApiOperation({ summary: 'Get API audit by request ID' })
  @ApiParam({ name: 'requestId', description: 'Request ID' })
  @ApiStandardResponse('API audit details')
  @ApiErrorResponses()
  detail(@CurrentTenant() tenantId: string, @Param('requestId') requestId: string) {
    return this.service.findById(tenantId, requestId);
  }
}
