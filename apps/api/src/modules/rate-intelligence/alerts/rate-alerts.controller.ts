import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateRateAlertDto } from './dto/create-rate-alert.dto';
import { UpdateRateAlertDto } from './dto/update-rate-alert.dto';
import { RateAlertsService } from './rate-alerts.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RateAlertsController {
  constructor(private readonly service: RateAlertsService) {}

  @Get('api/v1/rates/alerts')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post('api/v1/rates/alerts')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRateAlertDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Patch('api/v1/rates/alerts/:id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateRateAlertDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete('api/v1/rates/alerts/:id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Get('api/v1/rates/alerts/:id/history')
  history(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.history(tenantId, id);
  }
}
