import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { AlertsService, DataQueryService, SavedViewsService } from './alerts.service';
import { AcknowledgeAlertDto, ComparePeriodDto, ExportDataDto, QueryDataDto, ResolveAlertDto, SavedViewDto, TrendQueryDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('analytics/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS', 'DISPATCHER', 'ACCOUNTING', 'SALES_MANAGER', 'EXECUTIVE')
  list(@CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.service.list(tenantId, active);
  }

  @Post(':id/acknowledge')
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS', 'DISPATCHER', 'ACCOUNTING', 'SALES_MANAGER', 'EXECUTIVE')
  acknowledge(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
  ) {
    return this.service.acknowledge(tenantId, userId, id, dto);
  }

  @Post(':id/resolve')
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS', 'DISPATCHER', 'ACCOUNTING', 'SALES_MANAGER', 'EXECUTIVE')
  resolve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
  ) {
    return this.service.resolve(tenantId, userId, id, dto);
  }
}

@Controller('analytics/views')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedViewsController {
  constructor(private readonly service: SavedViewsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Query('entityType') entityType?: string) {
    return this.service.list(tenantId, userId, entityType);
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  get(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.get(tenantId, userId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SavedViewDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SavedViewDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_REP', 'DISPATCHER', 'ACCOUNTING', 'OPERATIONS')
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }
}

@Controller('analytics/data')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DataQueryController {
  constructor(private readonly service: DataQueryService) {}

  @Get('dimensions')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  dimensions() {
    return this.service.dimensions();
  }

  @Get('measures')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  measures() {
    return this.service.measures();
  }

  @Post('query')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  query(@CurrentTenant() tenantId: string, @Body() dto: QueryDataDto) {
    return this.service.query(tenantId, dto);
  }

  @Post('export')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  export(@CurrentTenant() tenantId: string, @Body() dto: ExportDataDto) {
    return this.service.export(tenantId, dto);
  }

  @Get('trends/:kpiCode')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  trends(
    @CurrentTenant() tenantId: string,
    @Param('kpiCode') kpiCode: string,
    @Query() query: TrendQueryDto,
  ) {
    return this.service.trends(tenantId, kpiCode, query);
  }

  @Post('compare')
  @Roles('ADMIN', 'ACCOUNTING', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'EXECUTIVE')
  compare(@CurrentTenant() tenantId: string, @Body() dto: ComparePeriodDto) {
    return this.service.compare(tenantId, dto);
  }
}
