import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { CreateHolidayDto, UpdateBusinessHoursDto } from '../dto';
import { BusinessHoursService } from './business-hours.service';

@Controller('config')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
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

  @Delete('holidays/:id')
  removeHoliday(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.removeHoliday(tenantId, id);
  }
}
