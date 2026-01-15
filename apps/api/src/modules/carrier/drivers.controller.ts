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
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, DriverStatus, DriverResponseDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('carriers/:carrierId/drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('ADMIN', 'CARRIER_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateDriverDto,
  ) {
    const driver = await this.driversService.create(tenantId, carrierId, user.id, dto);
    return this.serializeDriver(driver);
  }

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query('status') status?: string,
  ) {
    const drivers = await this.driversService.findAllForCarrier(tenantId, carrierId, { status });
    return this.serializeDrivers(drivers);
  }

  @Get('expiring-credentials')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async getExpiringCredentials(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string,
  ) {
    const drivers = await this.driversService.getExpiringCredentials(
      tenantId,
      days ? parseInt(days, 10) : 30,
    );
    return this.serializeDrivers(drivers as unknown[]);
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const driver = await this.driversService.findOne(tenantId, id);
    return this.serializeDriver(driver);
  }

  @Put(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    const driver = await this.driversService.update(tenantId, id, dto);
    return this.serializeDriver(driver);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: DriverStatus },
  ) {
    const driver = await this.driversService.update(tenantId, id, { status: body.status });
    return this.serializeDriver(driver);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.delete(tenantId, id);
  }

  private serializeDriver(driver: unknown) {
    return plainToInstance(DriverResponseDto, driver, { excludeExtraneousValues: false });
  }

  private serializeDrivers(drivers: unknown[]) {
    return plainToInstance(DriverResponseDto, drivers, { excludeExtraneousValues: false });
  }
}
