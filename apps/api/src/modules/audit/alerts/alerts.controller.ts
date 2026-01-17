import { Body, Controller, Get, Param, Put, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { AlertsService } from './alerts.service';
import { CreateAuditAlertDto, IncidentQueryDto, UpdateAuditAlertDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/alerts')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit alerts' })
  @ApiQuery({ name: 'isActive', required: false, type: String })
  @ApiStandardResponse('Audit alerts list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
    const active = isActive === undefined ? undefined : isActive === 'true';
    return this.service.list(tenantId, active);
  }

  @Get('incidents')
  @ApiOperation({ summary: 'List audit incidents' })
  @ApiStandardResponse('Audit incidents list')
  @ApiErrorResponses()
  incidents(@CurrentTenant() tenantId: string, @Query() query: IncidentQueryDto) {
    return this.service.listIncidents(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create audit alert' })
  @ApiStandardResponse('Audit alert created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAuditAlertDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update audit alert' })
  @ApiParam({ name: 'id', description: 'Audit alert ID' })
  @ApiStandardResponse('Audit alert updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAuditAlertDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }
}
