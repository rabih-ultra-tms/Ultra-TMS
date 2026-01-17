import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CreateDashboardDto, CreateWidgetDto, UpdateDashboardDto, UpdateWidgetDto } from './dto';
import { DashboardsService } from './dashboards.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('analytics/dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'List analytics dashboards' })
  @ApiStandardResponse('Dashboards list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'Get dashboard by ID' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiStandardResponse('Dashboard details')
  @ApiErrorResponses()
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'Create dashboard' })
  @ApiStandardResponse('Dashboard created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'Update dashboard' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiStandardResponse('Dashboard updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete dashboard' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiStandardResponse('Dashboard deleted')
  @ApiErrorResponses()
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(':id/widgets')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'Add dashboard widget' })
  @ApiParam({ name: 'id', description: 'Dashboard ID' })
  @ApiStandardResponse('Widget added')
  @ApiErrorResponses()
  addWidget(
    @CurrentTenant() tenantId: string,
    @Param('id') dashboardId: string,
    @Body() dto: CreateWidgetDto,
  ) {
    return this.service.addWidget(tenantId, dashboardId, dto);
  }

  @Patch(':dashboardId/widgets/:widgetId')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  @ApiOperation({ summary: 'Update dashboard widget' })
  @ApiParam({ name: 'dashboardId', description: 'Dashboard ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID' })
  @ApiStandardResponse('Widget updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Remove dashboard widget' })
  @ApiParam({ name: 'dashboardId', description: 'Dashboard ID' })
  @ApiParam({ name: 'widgetId', description: 'Widget ID' })
  @ApiStandardResponse('Widget removed')
  @ApiErrorResponses()
  removeWidget(
    @CurrentTenant() tenantId: string,
    @Param('dashboardId') dashboardId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.service.removeWidget(tenantId, dashboardId, widgetId);
  }
}
