import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CommandCenterService } from './command-center.service';
import {
  CommandCenterKPIsQueryDto,
  CommandCenterAlertsQueryDto,
  AutoMatchDto,
} from './dto/command-center.dto';

@Controller('command-center')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Command Center')
@ApiBearerAuth('JWT-auth')
export class CommandCenterController {
  constructor(private readonly commandCenterService: CommandCenterService) {}

  @Get('kpis')
  @ApiOperation({
    summary: 'Get aggregated KPIs across loads, quotes, carriers, revenue',
  })
  async getKPIs(
    @CurrentTenant() tenantId: string,
    @Query() query: CommandCenterKPIsQueryDto
  ) {
    return this.commandCenterService.getKPIs(tenantId, query.period ?? 'today');
  }

  @Get('alerts')
  @ApiOperation({
    summary:
      'Get consolidated alerts (stale check calls, unassigned loads, expiring insurance)',
  })
  async getAlerts(
    @CurrentTenant() tenantId: string,
    @Query() query: CommandCenterAlertsQueryDto
  ) {
    return this.commandCenterService.getAlerts(
      tenantId,
      query.severity ?? 'all',
      query.limit ?? 50
    );
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get recent activity feed (audit log entries)',
  })
  async getActivity(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.commandCenterService.getActivity(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20
    );
  }

  @Get('carrier-availability')
  @ApiOperation({
    summary: 'Get active carriers with current load counts',
  })
  async getCarrierAvailability(@CurrentTenant() tenantId: string) {
    return this.commandCenterService.getCarrierAvailability(tenantId);
  }

  @Patch('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  async acknowledgeAlert(@Param('id') _alertId: string) {
    // Alerts are computed, not stored. Acknowledging is a no-op for now.
    // In the future, store acknowledged alert IDs per user in Redis.
    return { data: { acknowledged: true } };
  }

  @Post('auto-match')
  @ApiOperation({
    summary: 'Get AI carrier match suggestions for a load (stub)',
  })
  async autoMatch(
    @CurrentTenant() tenantId: string,
    @Body() dto: AutoMatchDto
  ) {
    return this.commandCenterService.autoMatch(tenantId, dto.loadId);
  }
}
