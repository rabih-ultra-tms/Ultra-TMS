import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import {
  CreateDashboardDto,
  UpdateDashboardDto,
  CloneDashboardDto,
  ShareDashboardDto,
  CreateWidgetDto,
  UpdateWidgetDto,
  UpdateLayoutDto,
  DashboardOwnerType,
} from './dto';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard)
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Query('ownerType') ownerType?: DashboardOwnerType,
  ) {
    return this.dashboardsService.findAll(tenantId, userId, ownerType);
  }

  @Get('slug/:slug')
  findBySlug(@CurrentTenant() tenantId: string, @Param('slug') slug: string) {
    return this.dashboardsService.findBySlug(tenantId, slug);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.dashboardsService.findOne(tenantId, id);
  }

  @Get(':id/data')
  getData(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.dashboardsService.getData(tenantId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardsService.create(tenantId, userId, dto);
  }

  @Post(':id/clone')
  clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: CloneDashboardDto,
  ) {
    return this.dashboardsService.clone(tenantId, userId, id, dto);
  }

  @Post(':id/share')
  share(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: ShareDashboardDto,
  ) {
    return this.dashboardsService.share(tenantId, userId, id, dto);
  }

  @Post(':id/widgets')
  addWidget(
    @CurrentTenant() tenantId: string,
    @Param('id') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.dashboardsService.addWidget(tenantId, dashboardId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(tenantId, userId, id, dto);
  }

  @Patch(':id/layout')
  updateLayout(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') dashboardId: string,
    @Body() dto: UpdateLayoutDto,
  ) {
    return this.dashboardsService.updateLayout(tenantId, userId, dashboardId, dto);
  }

  @Patch(':dashboardId/widgets/:widgetId')
  updateWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
    @Body() dto: UpdateWidgetDto,
  ) {
    return this.dashboardsService.updateWidget(tenantId, dashboardId, widgetId, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.dashboardsService.delete(tenantId, id);
  }

  @Delete(':dashboardId/widgets/:widgetId')
  removeWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.dashboardsService.removeWidget(tenantId, dashboardId, widgetId);
  }
}
