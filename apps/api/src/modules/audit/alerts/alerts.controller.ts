import { Body, Controller, Get, Param, Put, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AlertsService } from './alerts.service';
import { CreateAuditAlertDto, IncidentQueryDto, UpdateAuditAlertDto } from '../dto';

@Controller('audit/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.service.list(tenantId, active);
  }

  @Get('incidents')
  incidents(@CurrentTenant() tenantId: string, @Query() query: IncidentQueryDto) {
    return this.service.listIncidents(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAuditAlertDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAuditAlertDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }
}
