import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AlertsService } from './alerts.service';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('safety/alerts')
@UseGuards(JwtAuthGuard)
@ApiTags('Safety Scores')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List safety alerts' })
  @ApiStandardResponse('Safety alerts list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string, @Query('isActive') isActive?: string) {
    const activeFlag = isActive === undefined ? undefined : isActive === 'true';
    return this.service.list(tenantId, activeFlag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get safety alert by ID' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Safety alert details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create safety alert' })
  @ApiStandardResponse('Safety alert created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAlertDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge safety alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Safety alert acknowledged')
  @ApiErrorResponses()
  acknowledge(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.acknowledge(tenantId, userId, id);
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss safety alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Safety alert dismissed')
  @ApiErrorResponses()
  dismiss(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.dismiss(tenantId, userId, id);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve safety alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Safety alert resolved')
  @ApiErrorResponses()
  resolve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
  ) {
    return this.service.resolve(tenantId, userId, id, dto);
  }
}
