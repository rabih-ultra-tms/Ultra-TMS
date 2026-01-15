import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CloseIncidentDto } from './dto/close-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentsService } from './incidents.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Incidents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'List safety incidents' })
  @ApiStandardResponse('Incidents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  list(@CurrentTenant() tenantId: string, @Query() query: IncidentQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create safety incident' })
  @ApiStandardResponse('Incident created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiStandardResponse('Incident details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiStandardResponse('Incident updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close incident' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiStandardResponse('Incident closed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER')
  close(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CloseIncidentDto,
  ) {
    return this.service.close(tenantId, userId, id, dto);
  }

  @Get(':id/violations')
  @ApiOperation({ summary: 'Get incident violations' })
  @ApiParam({ name: 'id', description: 'Incident ID' })
  @ApiStandardResponse('Incident violations')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SAFETY_MANAGER', 'OPERATIONS_MANAGER', 'DISPATCHER')
  violations(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.violations(tenantId, id);
  }
}
