import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant } from '../../common/decorators';
import { DriversService } from './drivers.service';
import {
  CreateDriverDto,
  UpdateDriverDto,
  UpdateDriverLocationDto,
  DriverListQueryDto,
} from './dto/driver.dto';

@UseGuards(JwtAuthGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: DriverListQueryDto
  ) {
    return this.driversService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.driversService.findOne(tenantId, id);
  }

  @Get(':id/location')
  async getLocation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.driversService.getLocation(tenantId, id);
  }

  @Patch(':id/location')
  async updateLocation(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverLocationDto
  ) {
    return this.driversService.updateLocation(tenantId, id, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto
  ) {
    return this.driversService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.driversService.delete(tenantId, id);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('carriers/:carrierId/drivers')
export class CarrierDriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async findByCarrier(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query() query: DriverListQueryDto
  ) {
    return this.driversService.findByCarrier(tenantId, carrierId, query);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateDriverDto
  ) {
    return this.driversService.create(tenantId, carrierId, dto);
  }
}
