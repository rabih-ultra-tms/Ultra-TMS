import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from '../dto/help-desk.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('support/sla-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SUPPORT_MANAGER')
export class SlaPoliciesController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'List SLA policies' })
  @ApiStandardResponse('SLA policies list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SUPPORT_MANAGER', 'SUPPORT_AGENT', 'OPERATIONS_MANAGER')
  list(@CurrentTenant() tenantId: string) {
    return this.slaService.listPolicies(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create SLA policy' })
  @ApiStandardResponse('SLA policy created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateSlaPolicyDto) {
    return this.slaService.createPolicy(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SLA policy' })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiStandardResponse('SLA policy updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSlaPolicyDto,
  ) {
    return this.slaService.updatePolicy(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SLA policy' })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiStandardResponse('SLA policy deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.slaService.deletePolicy(tenantId, id);
  }
}
