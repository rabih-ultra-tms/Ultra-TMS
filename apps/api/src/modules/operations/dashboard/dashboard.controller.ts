import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import {
  DashboardQueryDto,
  DashboardChartsQueryDto,
  DashboardActivityQueryDto,
} from './dashboard.dto';

@Controller('operations/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Operations - Dashboard')
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  async getKPIs(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: CurrentUserData,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getKPIs(
      tenantId,
      query.period ?? 'today',
      query.scope ?? 'personal',
      query.comparisonPeriod ?? 'yesterday',
      user?.id,
    );
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  async getCharts(
    @CurrentTenant() tenantId: string,
    @Query() query: DashboardChartsQueryDto,
  ) {
    return this.dashboardService.getCharts(tenantId, query.period ?? 'today');
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get dashboard alerts' })
  async getAlerts(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getAlerts(tenantId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get dashboard activity feed' })
  async getActivity(
    @CurrentTenant() tenantId: string,
    @Query() query: DashboardActivityQueryDto,
  ) {
    return this.dashboardService.getActivity(
      tenantId,
      query.period ?? 'today',
    );
  }

  @Get('needs-attention')
  @ApiOperation({ summary: 'Get loads needing attention' })
  async getNeedsAttention(@CurrentTenant() tenantId: string) {
    return this.dashboardService.getNeedsAttention(tenantId);
  }
}
