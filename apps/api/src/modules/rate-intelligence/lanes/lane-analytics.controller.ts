import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { LaneAnalyticsService } from './lane-analytics.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Rate Benchmarks')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class LaneAnalyticsController {
  constructor(private readonly service: LaneAnalyticsService) {}

  @Get('api/v1/rates/lanes')
  @ApiOperation({ summary: 'List lane analytics' })
  @ApiStandardResponse('Lane analytics list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get('api/v1/rates/lanes/:id')
  @ApiOperation({ summary: 'Get lane analytics by ID' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane analytics details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get('api/v1/rates/lanes/:id/history')
  @ApiOperation({ summary: 'Get lane rate history' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane history')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.historyForLane(tenantId, id);
  }

  @Get('api/v1/rates/lanes/:id/forecast')
  @ApiOperation({ summary: 'Get lane rate forecast' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane forecast')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  forecast(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.forecast(tenantId, id);
  }
}
