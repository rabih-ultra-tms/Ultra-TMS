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
import { AlertsService, SavedViewsService, DataQueryService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import {
  AcknowledgeAlertDto,
  ResolveAlertDto,
  CreateSavedViewDto,
  UpdateSavedViewDto,
  QueryDataDto,
  ExportDataDto,
  ComparePeriodDto,
  TrendQueryDto,
} from './dto';

@Controller('analytics/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('acknowledged') acknowledged?: string,
    @Query('alertType') alertType?: string,
  ) {
    return this.alertsService.findAll(
      tenantId,
      acknowledged === 'true' ? true : acknowledged === 'false' ? false : undefined,
      alertType,
    );
  }

  @Get('active')
  findActive(@CurrentTenant() tenantId: string) {
    return this.alertsService.findActive(tenantId);
  }

  @Post(':id/acknowledge')
  acknowledge(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: AcknowledgeAlertDto,
  ) {
    return this.alertsService.acknowledge(tenantId, userId, id, dto);
  }

  @Post(':id/resolve')
  resolve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
  ) {
    return this.alertsService.resolve(tenantId, userId, id, dto);
  }
}

@Controller('analytics/views')
@UseGuards(JwtAuthGuard)
export class SavedViewsController {
  constructor(private readonly savedViewsService: SavedViewsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Query('viewType') viewType?: string,
  ) {
    return this.savedViewsService.findAll(tenantId, userId, viewType);
  }

  @Get(':id')
  findOne(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    return this.savedViewsService.findOne(tenantId, userId, id);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateSavedViewDto,
  ) {
    return this.savedViewsService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSavedViewDto,
  ) {
    return this.savedViewsService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ) {
    return this.savedViewsService.delete(tenantId, userId, id);
  }
}

@Controller('analytics/data')
@UseGuards(JwtAuthGuard)
export class DataQueryController {
  constructor(private readonly dataQueryService: DataQueryService) {}

  @Get('dimensions')
  getDimensions(@CurrentTenant() tenantId: string) {
    return this.dataQueryService.getDimensions(tenantId);
  }

  @Get('measures')
  getMeasures(@CurrentTenant() tenantId: string) {
    return this.dataQueryService.getMeasures(tenantId);
  }

  @Get('trends/:kpiCode')
  getTrends(
    @CurrentTenant() tenantId: string,
    @Param('kpiCode') kpiCode: string,
    @Query() dto: TrendQueryDto,
  ) {
    return this.dataQueryService.getTrends(tenantId, kpiCode, dto);
  }

  @Post('query')
  query(@CurrentTenant() tenantId: string, @Body() dto: QueryDataDto) {
    return this.dataQueryService.query(tenantId, dto);
  }

  @Post('export')
  export(@CurrentTenant() tenantId: string, @Body() dto: ExportDataDto) {
    return this.dataQueryService.export(tenantId, dto);
  }

  @Post('compare')
  compare(@CurrentTenant() tenantId: string, @Body() dto: ComparePeriodDto) {
    return this.dataQueryService.compare(tenantId, dto);
  }
}
