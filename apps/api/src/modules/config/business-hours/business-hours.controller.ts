import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { CreateHolidayDto, UpdateBusinessHoursDto } from '../dto';
import { BusinessHoursService } from './business-hours.service';

@Controller('config')
@UseGuards(JwtAuthGuard)
export class BusinessHoursController {
  constructor(private readonly service: BusinessHoursService) {}

  @Get('business-hours')
  getHours(@CurrentTenant() tenantId: string) {
    return this.service.getHours(tenantId);
  }

  @Put('business-hours')
  updateHours(@CurrentTenant() tenantId: string, @Body() dto: UpdateBusinessHoursDto) {
    return this.service.updateHours(tenantId, dto);
  }

  @Get('holidays')
  listHolidays(@CurrentTenant() tenantId: string) {
    return this.service.listHolidays(tenantId);
  }

  @Post('holidays')
  addHoliday(@CurrentTenant() tenantId: string, @Body() dto: CreateHolidayDto) {
    return this.service.addHoliday(tenantId, dto);
  }
}
