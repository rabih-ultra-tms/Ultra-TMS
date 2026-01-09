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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto, UpdateCarrierDto } from './dto';

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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('carrierType') carrierType?: string,
  ) {
    return this.carriersService.findAll(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      search,
      carrierType,
    });
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

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    return this.carriersService.update(tenantId, id, dto);
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
