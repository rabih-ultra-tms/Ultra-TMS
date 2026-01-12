import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { KPICategory } from '@prisma/client';
import { KpisService } from './kpis.service';
import { CalculateKpiDto, CreateKpiDto, KpiValuesQueryDto, UpdateKpiDto } from './dto';

@Controller('analytics/kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly service: KpisService) {}

  @Get()
  list(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: KPICategory,
    @Query('status') status?: string,
  ) {
    return this.service.list(tenantId, category, status);
  }

  @Get('current')
  currentValues(@CurrentTenant() tenantId: string) {
    return this.service.currentValues(tenantId);
  }

  @Get('category/:category')
  byCategory(@CurrentTenant() tenantId: string, @Param('category') category: KPICategory) {
    return this.service.getByCategory(tenantId, category);
  }

  @Get(':id')
  get(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.get(tenantId, id);
  }

  @Get(':id/values')
  values(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() query: KpiValuesQueryDto,
  ) {
    return this.service.values(tenantId, id, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKpiDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Post(':id/calculate')
  calculate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CalculateKpiDto,
  ) {
    return this.service.calculate(tenantId, id, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKpiDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
