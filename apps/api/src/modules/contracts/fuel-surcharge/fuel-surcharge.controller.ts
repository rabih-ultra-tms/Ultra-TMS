import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FuelSurchargeService } from './fuel-surcharge.service';
import { CreateFuelTableDto } from './dto/create-fuel-table.dto';
import { UpdateFuelTableDto } from './dto/update-fuel-table.dto';
import { CreateFuelTierDto } from './dto/create-fuel-tier.dto';
import { UpdateFuelTierDto } from './dto/update-fuel-tier.dto';
import { CalculateFuelSurchargeDto } from './dto/calculate-fuel-surcharge.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser, CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class FuelSurchargeController {
  constructor(private readonly service: FuelSurchargeService) {}

  @Get('fuel-tables')
  list(@CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId);
  }

  @Post('fuel-tables')
  create(@Body() dto: CreateFuelTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, user.userId, dto);
  }

  @Get('fuel-tables/:id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(user.tenantId, id);
  }

  @Put('fuel-tables/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFuelTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(user.tenantId, id, dto);
  }

  @Delete('fuel-tables/:id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(user.tenantId, id);
  }

  @Get('fuel-tables/:id/tiers')
  listTiers(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.listTiers(user.tenantId, id);
  }

  @Post('fuel-tables/:id/tiers')
  addTier(@Param('id') id: string, @Body() dto: CreateFuelTierDto, @CurrentUser() user: CurrentUserData) {
    return this.service.addTier(user.tenantId, id, user.userId, dto);
  }

  @Put('fuel-tiers/:tierId')
  updateTier(@Param('tierId') tierId: string, @Body() dto: UpdateFuelTierDto, @CurrentUser() user: CurrentUserData) {
    return this.service.updateTier(user.tenantId, tierId, dto);
  }

  @Get('fuel-surcharge/calculate')
  calculate(@Query() query: CalculateFuelSurchargeDto, @CurrentUser() user: CurrentUserData) {
    return this.service.calculate(user.tenantId, query);
  }
}
