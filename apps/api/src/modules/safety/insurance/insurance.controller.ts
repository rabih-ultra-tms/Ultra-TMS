import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { InsuranceQueryDto } from './dto/insurance-query.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { InsuranceService } from './insurance.service';

@Controller('safety/insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: InsuranceQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInsuranceDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get('expiring')
  getExpiring(@CurrentTenant() tenantId: string, @Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.service.expiring(tenantId, Number.isFinite(numDays) ? numDays : 30);
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
    @Body() dto: UpdateInsuranceDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }

  @Post(':id/verify')
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.verify(tenantId, userId, id);
  }
}
