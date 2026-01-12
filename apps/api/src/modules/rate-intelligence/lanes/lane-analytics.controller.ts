import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { LaneAnalyticsService } from './lane-analytics.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class LaneAnalyticsController {
  constructor(private readonly service: LaneAnalyticsService) {}

  @Get('api/v1/rates/lanes')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get('api/v1/rates/lanes/:id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get('api/v1/rates/lanes/:id/history')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.historyForLane(tenantId, id);
  }

  @Get('api/v1/rates/lanes/:id/forecast')
  forecast(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.forecast(tenantId, id);
  }
}
