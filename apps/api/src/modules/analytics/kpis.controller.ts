import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { KPICategory } from '@prisma/client';
import { KpisService } from './kpis.service';
import { CalculateKpiDto, CreateKpiDto, KpiValuesQueryDto, UpdateKpiDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('analytics/kpis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KpisController {
  constructor(private readonly service: KpisService) {}

  @Get()
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  list(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: KPICategory,
    @Query('status') status?: string,
  ) {
    return this.service.list(tenantId, category, status);
  }

  @Get('current')
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  currentValues(@CurrentTenant() tenantId: string) {
    return this.service.currentValues(tenantId);
  }

  @Get('category/:category')
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  byCategory(@CurrentTenant() tenantId: string, @Param('category') category: KPICategory) {
    return this.service.getByCategory(tenantId, category);
  }

  @Get(':id')
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Get(':id/values')
  @Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  values(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: KpiValuesQueryDto,
  ) {
    return this.service.values(tenantId, id, query);
  }

  @Post()
  @Roles('ADMIN', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKpiDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Post(':id/calculate')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  calculate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CalculateKpiDto,
  ) {
    return this.service.calculate(tenantId, id, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKpiDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ACCOUNTING_MANAGER', 'EXECUTIVE')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
