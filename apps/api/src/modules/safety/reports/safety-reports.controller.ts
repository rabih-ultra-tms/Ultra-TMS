import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { SafetyReportsService } from './safety-reports.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Safety Scores')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER')
export class SafetyReportsController {
  constructor(private readonly service: SafetyReportsService) {}

  @Get('compliance')
  @ApiOperation({ summary: 'Get safety compliance report' })
  @ApiStandardResponse('Safety compliance report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER')
  compliance(@CurrentTenant() tenantId: string) {
    return this.service.complianceReport(tenantId);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Get safety incidents report' })
  @ApiStandardResponse('Safety incidents report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER')
  incidents(@CurrentTenant() tenantId: string) {
    return this.service.incidentReport(tenantId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring compliance report' })
  @ApiStandardResponse('Expiring compliance report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER')
  expiring(@CurrentTenant() tenantId: string) {
    return this.service.expiringReport(tenantId);
  }
}
