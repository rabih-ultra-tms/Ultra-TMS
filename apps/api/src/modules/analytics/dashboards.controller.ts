import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CreateDashboardDto, CreateWidgetDto, UpdateDashboardDto, UpdateWidgetDto } from './dto';
import { DashboardsService } from './dashboards.service';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(':id/widgets')
  addWidget(
    @CurrentTenant() tenantId: string,
    @Param('id') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.service.addWidget(tenantId, dashboardId, dto);
  }

  @Patch(':dashboardId/widgets/:widgetId')
  updateWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.service.updateWidget(tenantId, dashboardId, widgetId, dto);
  }

  @Delete(':dashboardId/widgets/:widgetId')
  removeWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.service.removeWidget(tenantId, dashboardId, widgetId);
  }
}
