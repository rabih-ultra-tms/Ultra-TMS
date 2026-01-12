import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { AnalyticsService } from './analytics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('api/v1/rates/analytics/dashboard')
  dashboard(@CurrentTenant() tenantId: string) {
    return this.service.dashboard(tenantId);
  }

  @Get('api/v1/rates/analytics/margins')
  margins(@CurrentTenant() tenantId: string) {
    return this.service.margins(tenantId);
  }

  @Get('api/v1/rates/analytics/competitiveness')
  competitiveness(@CurrentTenant() tenantId: string) {
    return this.service.competitiveness(tenantId);
  }

  @Get('api/v1/rates/analytics/market')
  market(@CurrentTenant() tenantId: string) {
    return this.service.marketOverview(tenantId);
  }
}
