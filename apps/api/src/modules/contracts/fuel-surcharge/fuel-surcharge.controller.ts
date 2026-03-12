import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FuelSurchargeService } from './fuel-surcharge.service';
import { CreateFuelTableDto } from './dto/create-fuel-table.dto';
import { UpdateFuelTableDto } from './dto/update-fuel-table.dto';
import { CreateFuelTierDto } from './dto/create-fuel-tier.dto';
import { UpdateFuelTierDto } from './dto/update-fuel-tier.dto';
import { CalculateFuelSurchargeDto } from './dto/calculate-fuel-surcharge.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Contract Rates')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CONTRACTS_MANAGER', 'SALES_MANAGER', 'OPERATIONS_MANAGER')
export class FuelSurchargeController {
  constructor(private readonly service: FuelSurchargeService) {}

  @Get('fuel-tables')
  @ApiOperation({ summary: 'List fuel surcharge tables' })
  @ApiStandardResponse('Fuel tables list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  list(@CurrentUser() user: CurrentUserData) {
    return this.service.list(user.tenantId);
  }

  @Post('fuel-tables')
  @ApiOperation({ summary: 'Create fuel surcharge table' })
  @ApiStandardResponse('Fuel table created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(@Body() dto: CreateFuelTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.create(user.tenantId, user.userId, dto);
  }

  @Get('fuel-tables/:id')
  @ApiOperation({ summary: 'Get fuel surcharge table by ID' })
  @ApiParam({ name: 'id', description: 'Fuel table ID' })
  @ApiStandardResponse('Fuel table details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.detail(user.tenantId, id);
  }

  @Put('fuel-tables/:id')
  @ApiOperation({ summary: 'Update fuel surcharge table' })
  @ApiParam({ name: 'id', description: 'Fuel table ID' })
  @ApiStandardResponse('Fuel table updated')
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateFuelTableDto, @CurrentUser() user: CurrentUserData) {
    return this.service.update(user.tenantId, id, dto);
  }

  @Delete('fuel-tables/:id')
  @ApiOperation({ summary: 'Delete fuel surcharge table' })
  @ApiParam({ name: 'id', description: 'Fuel table ID' })
  @ApiStandardResponse('Fuel table deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.delete(user.tenantId, id);
  }

  @Get('fuel-tables/:id/tiers')
  @ApiOperation({ summary: 'List fuel surcharge tiers' })
  @ApiParam({ name: 'id', description: 'Fuel table ID' })
  @ApiStandardResponse('Fuel tiers list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  listTiers(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.service.listTiers(user.tenantId, id);
  }

  @Post('fuel-tables/:id/tiers')
  @ApiOperation({ summary: 'Add fuel surcharge tier' })
  @ApiParam({ name: 'id', description: 'Fuel table ID' })
  @ApiStandardResponse('Fuel tier added')
  @ApiErrorResponses()
  addTier(@Param('id') id: string, @Body() dto: CreateFuelTierDto, @CurrentUser() user: CurrentUserData) {
    return this.service.addTier(user.tenantId, id, user.userId, dto);
  }

  @Put('fuel-tiers/:tierId')
  @ApiOperation({ summary: 'Update fuel surcharge tier' })
  @ApiParam({ name: 'tierId', description: 'Fuel tier ID' })
  @ApiStandardResponse('Fuel tier updated')
  @ApiErrorResponses()
  updateTier(@Param('tierId') tierId: string, @Body() dto: UpdateFuelTierDto, @CurrentUser() user: CurrentUserData) {
    return this.service.updateTier(user.tenantId, tierId, dto);
  }

  @Get('fuel-surcharge/calculate')
  @ApiOperation({ summary: 'Calculate fuel surcharge' })
  @ApiStandardResponse('Fuel surcharge calculation')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CONTRACTS_MANAGER', 'CONTRACTS_VIEWER', 'SALES_MANAGER', 'OPERATIONS_MANAGER', 'ACCOUNTING')
  calculate(@Query() query: CalculateFuelSurchargeDto, @CurrentUser() user: CurrentUserData) {
    return this.service.calculate(user.tenantId, query);
  }
}
