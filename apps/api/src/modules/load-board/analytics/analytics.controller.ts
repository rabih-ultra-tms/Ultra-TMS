import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { AnalyticsService } from './analytics.service';

@Controller('api/v1/load-board/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts')
  postMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.postMetrics(tenantId);
  }

  @Get('leads')
  leadMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.leadMetrics(tenantId);
  }

  @Get('boards')
  boardComparison(@CurrentTenant() tenantId: string) {
    return this.analyticsService.boardComparison(tenantId);
  }
}
