import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CreateDashboardDto, CreateWidgetDto, UpdateDashboardDto, UpdateWidgetDto } from './dto';
import { DashboardsService } from './dashboards.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(':id/widgets')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  addWidget(
    @CurrentTenant() tenantId: string,
    @Param('id') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.service.addWidget(tenantId, dashboardId, dto);
  }

  @Patch(':dashboardId/widgets/:widgetId')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  updateWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.service.updateWidget(tenantId, dashboardId, widgetId, dto);
  }

  @Delete(':dashboardId/widgets/:widgetId')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  removeWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.service.removeWidget(tenantId, dashboardId, widgetId);
  }
}
