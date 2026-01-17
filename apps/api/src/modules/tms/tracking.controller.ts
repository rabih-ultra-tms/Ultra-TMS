import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TrackingService } from './tracking.service';
import { LocationHistoryQueryDto, TrackingMapFilterDto } from './dto/tracking.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiTags('TMS')
@ApiBearerAuth('JWT-auth')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('map')
  @ApiOperation({ summary: 'Get tracking map data' })
  @ApiStandardResponse('Tracking map data')
  @ApiErrorResponses()
  async getMapData(
    @Query() filters: TrackingMapFilterDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.trackingService.getMapData(tenantId, filters);
  }

  @Get('loads/:id/history')
  @ApiOperation({ summary: 'Get load location history' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load location history')
  @ApiErrorResponses()
  async getLocationHistory(
    @Param('id') loadId: string,
    @Query() query: LocationHistoryQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.trackingService.getLocationHistory(tenantId, loadId, query);
  }
}
