import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TrackingService } from './tracking.service';
import { LocationHistoryQueryDto, TrackingMapFilterDto } from './dto/tracking.dto';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('map')
  async getMapData(
    @Query() filters: TrackingMapFilterDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.trackingService.getMapData(tenantId, filters);
  }

  @Get('loads/:id/history')
  async getLocationHistory(
    @Param('id') loadId: string,
    @Query() query: LocationHistoryQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.trackingService.getLocationHistory(tenantId, loadId, query);
  }
}
