import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { AlertsService, DataQueryService, SavedViewsService } from './alerts.service';
import { AcknowledgeAlertDto, ComparePeriodDto, ExportDataDto, QueryDataDto, ResolveAlertDto, SavedViewDto, TrendQueryDto } from './dto';

@Controller('analytics/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.service.list(tenantId, active);
  }

  @Post(':id/acknowledge')
  acknowledge(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
  ) {
    return this.service.acknowledge(tenantId, userId, id, dto);
  }

  @Post(':id/resolve')
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
@UseGuards(JwtAuthGuard)
export class SavedViewsController {
  constructor(private readonly service: SavedViewsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Query('entityType') entityType?: string) {
    return this.service.list(tenantId, userId, entityType);
  }

  @Get(':id')
  get(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.get(tenantId, userId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SavedViewDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SavedViewDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }
}

@Controller('analytics/data')
@UseGuards(JwtAuthGuard)
export class DataQueryController {
  constructor(private readonly service: DataQueryService) {}

  @Get('dimensions')
  dimensions() {
    return this.service.dimensions();
  }

  @Get('measures')
  measures() {
    return this.service.measures();
  }

  @Post('query')
  query(@CurrentTenant() tenantId: string, @Body() dto: QueryDataDto) {
    return this.service.query(tenantId, dto);
  }

  @Post('export')
  export(@CurrentTenant() tenantId: string, @Body() dto: ExportDataDto) {
    return this.service.export(tenantId, dto);
  }

  @Get('trends/:kpiCode')
  trends(
    @CurrentTenant() tenantId: string,
    @Param('kpiCode') kpiCode: string,
    @Query() query: TrendQueryDto,
  ) {
    return this.service.trends(tenantId, kpiCode, query);
  }

  @Post('compare')
  compare(@CurrentTenant() tenantId: string, @Body() dto: ComparePeriodDto) {
    return this.service.compare(tenantId, dto);
  }
}
