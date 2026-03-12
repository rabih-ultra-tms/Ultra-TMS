import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AnalyticsService } from './analytics.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Rate Benchmarks')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('rates/analytics/dashboard')
  @ApiOperation({ summary: 'Get rate analytics dashboard' })
  @ApiStandardResponse('Analytics dashboard')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  dashboard(@CurrentTenant() tenantId: string) {
    return this.service.dashboard(tenantId);
  }

  @Get('rates/analytics/margins')
  @ApiOperation({ summary: 'Get margin analytics' })
  @ApiStandardResponse('Margin analytics')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  margins(@CurrentTenant() tenantId: string) {
    return this.service.margins(tenantId);
  }

  @Get('rates/analytics/competitiveness')
  @ApiOperation({ summary: 'Get competitiveness analytics' })
  @ApiStandardResponse('Competitiveness analytics')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  competitiveness(@CurrentTenant() tenantId: string) {
    return this.service.competitiveness(tenantId);
  }

  @Get('rates/analytics/market')
  @ApiOperation({ summary: 'Get market overview analytics' })
  @ApiStandardResponse('Market overview analytics')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  market(@CurrentTenant() tenantId: string) {
    return this.service.marketOverview(tenantId);
  }
}
