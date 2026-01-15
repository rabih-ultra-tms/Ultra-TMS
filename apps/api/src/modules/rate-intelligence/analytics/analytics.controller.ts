import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { AnalyticsService } from './analytics.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Rate Benchmarks')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('api/v1/rates/analytics/dashboard')
  @ApiOperation({ summary: 'Get rate analytics dashboard' })
  @ApiStandardResponse('Analytics dashboard')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  dashboard(@CurrentTenant() tenantId: string) {
    return this.service.dashboard(tenantId);
  }

  @Get('api/v1/rates/analytics/margins')
  @ApiOperation({ summary: 'Get margin analytics' })
  @ApiStandardResponse('Margin analytics')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  margins(@CurrentTenant() tenantId: string) {
    return this.service.margins(tenantId);
  }

  @Get('api/v1/rates/analytics/competitiveness')
  @ApiOperation({ summary: 'Get competitiveness analytics' })
  @ApiStandardResponse('Competitiveness analytics')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  competitiveness(@CurrentTenant() tenantId: string) {
    return this.service.competitiveness(tenantId);
  }

  @Get('api/v1/rates/analytics/market')
  @ApiOperation({ summary: 'Get market overview analytics' })
  @ApiStandardResponse('Market overview analytics')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  market(@CurrentTenant() tenantId: string) {
    return this.service.marketOverview(tenantId);
  }
}
