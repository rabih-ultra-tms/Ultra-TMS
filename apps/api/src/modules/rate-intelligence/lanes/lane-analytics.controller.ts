import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { LaneAnalyticsService } from './lane-analytics.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Rate Benchmarks')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
export class LaneAnalyticsController {
  constructor(private readonly service: LaneAnalyticsService) {}

  @Get('rates/lanes')
  @ApiOperation({ summary: 'List lane analytics' })
  @ApiStandardResponse('Lane analytics list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get('rates/lanes/:id')
  @ApiOperation({ summary: 'Get lane analytics by ID' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane analytics details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get('rates/lanes/:id/history')
  @ApiOperation({ summary: 'Get lane rate history' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane history')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.historyForLane(tenantId, id);
  }

  @Get('rates/lanes/:id/forecast')
  @ApiOperation({ summary: 'Get lane rate forecast' })
  @ApiParam({ name: 'id', description: 'Lane ID' })
  @ApiStandardResponse('Lane forecast')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'SALES_REP', 'DISPATCHER', 'CARRIER_MANAGER')
  forecast(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.forecast(tenantId, id);
  }
}
