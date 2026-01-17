import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ClaimsReportsService } from './reports.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims/reports')
@UseGuards(JwtAuthGuard)
@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
export class ClaimsReportsController {
  constructor(private readonly reportsService: ClaimsReportsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get claim status report' })
  @ApiStandardResponse('Claim status report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
  async status(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.statusSummary(tenantId);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get claim types report' })
  @ApiStandardResponse('Claim types report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
  async types(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.typeSummary(tenantId);
  }

  @Get('financials')
  @ApiOperation({ summary: 'Get claim financials report' })
  @ApiStandardResponse('Claim financials report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
  async financials(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.financials(tenantId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue claims report' })
  @ApiStandardResponse('Overdue claims report')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'CLAIMS_VIEWER')
  async overdue(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.overdue(tenantId);
  }
}
