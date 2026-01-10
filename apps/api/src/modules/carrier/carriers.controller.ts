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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CarriersService } from './carriers.service';
import { CarrierQueryDto, CarrierStatus, CarrierTier, CreateCarrierDto, UpdateCarrierDto, OnboardCarrierDto } from './dto';

@Controller('carriers')
@UseGuards(JwtAuthGuard)
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCarrierDto,
  ) {
    return this.carriersService.create(tenantId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CarrierQueryDto,
  ) {
    return this.carriersService.findAll(tenantId, query);
  }

  @Get('fmcsa/lookup/mc/:mcNumber')
  async lookupByMc(
    @Param('mcNumber') mcNumber: string,
  ) {
    return this.carriersService.lookupByMc(mcNumber);
  }

  @Get('fmcsa/lookup/dot/:dotNumber')
  async lookupByDot(
    @Param('dotNumber') dotNumber: string,
  ) {
    return this.carriersService.lookupByDot(dotNumber);
  }

  @Post('onboard')
  async onboardFromFmcsa(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: OnboardCarrierDto,
  ) {
    return this.carriersService.onboardFromFmcsa(tenantId, user.id, dto);
  }

  @Get('expiring-insurance')
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
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.findOne(tenantId, id);
  }

  @Get(':id/performance')
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
  async getLoads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getCarrierLoads(tenantId, id);
  }

  @Get(':id/compliance')
  async getCompliance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getCompliance(tenantId, id);
  }

  @Get(':id/scorecard')
  async getScorecard(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.getScorecard(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    return this.carriersService.update(tenantId, id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: CarrierStatus; reason?: string },
  ) {
    return this.carriersService.updateStatus(tenantId, id, body.status, body.reason);
  }

  @Patch(':id/tier')
  async updateTier(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { tier: CarrierTier },
  ) {
    return this.carriersService.updateTier(tenantId, id, body.tier);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.carriersService.approve(tenantId, id, user.id);
  }

  @Post(':id/fmcsa-check')
  @HttpCode(HttpStatus.OK)
  async fmcsaCheck(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.carriersService.runFmcsaCheck(tenantId, id, user.id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspend(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.carriersService.updateStatus(tenantId, id, CarrierStatus.SUSPENDED, body.reason);
  }

  @Post(':id/blacklist')
  @HttpCode(HttpStatus.OK)
  async blacklist(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.carriersService.updateStatus(tenantId, id, CarrierStatus.BLACKLISTED, body.reason);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.carriersService.deactivate(tenantId, id, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.carriersService.delete(tenantId, id);
  }
}
