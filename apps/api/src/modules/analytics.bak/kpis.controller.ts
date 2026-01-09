import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KpisService } from './kpis.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import {
  CreateKpiDefinitionDto,
  UpdateKpiDefinitionDto,
  GetKpiValuesDto,
  KpiBreakdownDto,
  CalculateKpiDto,
  KpiCategory,
} from './dto';

@Controller('analytics/kpis')
@UseGuards(JwtAuthGuard)
export class KpisController {
  constructor(private readonly kpisService: KpisService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: KpiCategory,
    @Query('isActive') isActive?: string,
  ) {
    return this.kpisService.findAll(
      tenantId,
      category,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('current')
  getCurrentValues(@CurrentTenant() tenantId: string) {
    return this.kpisService.getCurrentValues(tenantId);
  }

  @Get('category/:category')
  findByCategory(
    @CurrentTenant() tenantId: string,
    @Param('category') category: KpiCategory,
  ) {
    return this.kpisService.findByCategory(tenantId, category);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.kpisService.findOne(tenantId, id);
  }

  @Get(':id/values')
  getValues(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() dto: GetKpiValuesDto,
  ) {
    return this.kpisService.getValues(tenantId, id, dto);
  }

  @Get(':id/breakdown')
  getBreakdown(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query() dto: KpiBreakdownDto,
  ) {
    return this.kpisService.getBreakdown(tenantId, id, dto);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateKpiDefinitionDto,
  ) {
    return this.kpisService.create(tenantId, userId, dto);
  }

  @Post(':id/calculate')
  calculate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: CalculateKpiDto,
  ) {
    return this.kpisService.calculate(tenantId, id, dto);
  }

  @Patch(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKpiDefinitionDto,
  ) {
    return this.kpisService.update(tenantId, userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.kpisService.delete(tenantId, id);
  }
}
