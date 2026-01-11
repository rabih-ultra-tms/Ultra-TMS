import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CloseIncidentDto } from './dto/close-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentQueryDto } from './dto/incident-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentsService } from './incidents.service';

@Controller('safety/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: IncidentQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Post(':id/close')
  close(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CloseIncidentDto,
  ) {
    return this.service.close(tenantId, userId, id, dto);
  }

  @Get(':id/violations')
  violations(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.violations(tenantId, id);
  }
}
