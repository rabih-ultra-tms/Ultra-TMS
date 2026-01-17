import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { CreateHolidayDto, UpdateBusinessHoursDto } from '../dto';
import { BusinessHoursService } from './business-hours.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class BusinessHoursController {
  constructor(private readonly service: BusinessHoursService) {}

  @Get('business-hours')
  @ApiOperation({ summary: 'Get business hours' })
  @ApiStandardResponse('Business hours')
  @ApiErrorResponses()
  getHours(@CurrentTenant() tenantId: string) {
    return this.service.getHours(tenantId);
  }

  @Put('business-hours')
  @ApiOperation({ summary: 'Update business hours' })
  @ApiStandardResponse('Business hours updated')
  @ApiErrorResponses()
  updateHours(@CurrentTenant() tenantId: string, @Body() dto: UpdateBusinessHoursDto) {
    return this.service.updateHours(tenantId, dto);
  }

  @Get('holidays')
  @ApiOperation({ summary: 'List holidays' })
  @ApiStandardResponse('Holidays list')
  @ApiErrorResponses()
  listHolidays(@CurrentTenant() tenantId: string) {
    return this.service.listHolidays(tenantId);
  }

  @Post('holidays')
  @ApiOperation({ summary: 'Add holiday' })
  @ApiStandardResponse('Holiday added')
  @ApiErrorResponses()
  addHoliday(@CurrentTenant() tenantId: string, @Body() dto: CreateHolidayDto) {
    return this.service.addHoliday(tenantId, dto);
  }

  @Delete('holidays/:id')
  @ApiOperation({ summary: 'Remove holiday' })
  @ApiParam({ name: 'id', description: 'Holiday ID' })
  @ApiStandardResponse('Holiday removed')
  @ApiErrorResponses()
  removeHoliday(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.removeHoliday(tenantId, id);
  }
}
