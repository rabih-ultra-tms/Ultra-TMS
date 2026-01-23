import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { CreateRateAlertDto } from './dto/create-rate-alert.dto';
import { UpdateRateAlertDto } from './dto/update-rate-alert.dto';
import { RateAlertsService } from './rate-alerts.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Market Rates')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class RateAlertsController {
  constructor(private readonly service: RateAlertsService) {}

  @Get('rates/alerts')
  @ApiOperation({ summary: 'List rate alerts' })
  @ApiStandardResponse('Rate alerts list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('rates/alerts')
  @ApiOperation({ summary: 'Create rate alert' })
  @ApiStandardResponse('Rate alert created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRateAlertDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch('rates/alerts/:id')
  @ApiOperation({ summary: 'Update rate alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Rate alert updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateRateAlertDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete('rates/alerts/:id')
  @ApiOperation({ summary: 'Delete rate alert' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Rate alert deleted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Get('rates/alerts/:id/history')
  @ApiOperation({ summary: 'Get rate alert history' })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiStandardResponse('Rate alert history')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.history(tenantId, id);
  }
}
