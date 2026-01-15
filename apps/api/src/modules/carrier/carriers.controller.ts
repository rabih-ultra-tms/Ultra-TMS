import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  HttpCode,
  HttpStatus,
  SerializeOptions,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CarriersService } from './carriers.service';
import { CarrierQueryDto, CarrierStatus, CarrierTier, CreateCarrierDto, UpdateCarrierDto, OnboardCarrierDto, CarrierResponseDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCarrierDto,
  ) {
    const carrier = await this.carriersService.create(tenantId, user.id, dto);
    return this.serializeCarrier(carrier);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CarrierQueryDto,
  ) {
    const result = await this.carriersService.findAll(tenantId, query);
    return {
      ...result,
      data: this.serializeCarriers(result.data),
    };
  }

  @Get('fmcsa/lookup/mc/:mcNumber')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async lookupByMc(
    @Param('mcNumber') mcNumber: string,
  ) {
    return this.carriersService.lookupByMc(mcNumber);
  }

  @Get('fmcsa/lookup/dot/:dotNumber')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async lookupByDot(
    @Param('dotNumber') dotNumber: string,
  ) {
    return this.carriersService.lookupByDot(dotNumber);
  }

  @Post('onboard')
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async onboardFromFmcsa(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: OnboardCarrierDto,
  ) {
    return this.carriersService.onboardFromFmcsa(tenantId, user.id, dto);
  }

  @Get('expiring-insurance')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async getExpiringInsurance(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.carriersService.getExpiringInsurance(
      tenantId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const carrier = await this.carriersService.findOne(tenantId, id);
    return this.serializeCarrier(carrier);
  }

  @Get(':id/performance')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async getPerformance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('days') days?: string,
  ) {
    return this.carriersService.getCarrierPerformance(
      tenantId,
      id,
      days ? parseInt(days, 10) : 90,
    );
  }

  @Get(':id/loads')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async getLoads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getCarrierLoads(tenantId, id);
  }

  @Get(':id/compliance')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async getCompliance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getCompliance(tenantId, id);
  }

  @Get(':id/scorecard')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'OPERATIONS')
  async getScorecard(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getScorecard(tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    const carrier = await this.carriersService.update(tenantId, id, dto);
    return this.serializeCarrier(carrier);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: CarrierStatus; reason?: string },
  ) {
    const carrier = await this.carriersService.updateStatus(tenantId, id, body.status, body.reason);
    return this.serializeCarrier(carrier);
  }

  @Patch(':id/tier')
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async updateTier(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { tier: CarrierTier },
  ) {
    const carrier = await this.carriersService.updateTier(tenantId, id, body.tier);
    return this.serializeCarrier(carrier);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    const carrier = await this.carriersService.approve(tenantId, id, user.id);
    return this.serializeCarrier(carrier);
  }

  @Post(':id/fmcsa-check')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async fmcsaCheck(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    const carrier = await this.carriersService.runFmcsaCheck(tenantId, id, user.id);
    return this.serializeCarrier(carrier);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async suspend(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const carrier = await this.carriersService.updateStatus(tenantId, id, CarrierStatus.SUSPENDED, body.reason);
    return this.serializeCarrier(carrier);
  }

  @Post(':id/blacklist')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async blacklist(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const carrier = await this.carriersService.updateStatus(tenantId, id, CarrierStatus.BLACKLISTED, body.reason);
    return this.serializeCarrier(carrier);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    const carrier = await this.carriersService.deactivate(tenantId, id, body.reason);
    return this.serializeCarrier(carrier);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.delete(tenantId, id);
  }

  private serializeCarrier(carrier: unknown) {
    const masked = plainToInstance(CarrierResponseDto, carrier, { excludeExtraneousValues: true });
    return { ...(carrier as Record<string, unknown>), ...(masked as Record<string, unknown>) };
  }

  private serializeCarriers(carriers: unknown[]) {
    return carriers.map((carrier) => {
      const masked = plainToInstance(CarrierResponseDto, carrier, { excludeExtraneousValues: true });
      return { ...(carrier as Record<string, unknown>), ...(masked as Record<string, unknown>) };
    });
  }
}
