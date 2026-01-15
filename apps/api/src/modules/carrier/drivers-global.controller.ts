import { Body, Controller, Delete, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { DriversService } from './drivers.service';
import { UpdateDriverDto, DriverStatus } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversGlobalController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async list(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
  ) {
    return this.driversService.findAll(tenantId, { status, carrierId });
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async getOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driversService.update(tenantId, id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: DriverStatus },
  ) {
    return this.driversService.update(tenantId, id, { status: body.status });
  }

  @Delete(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.delete(tenantId, id);
  }

  @Get(':id/loads')
  @Roles('ADMIN', 'DISPATCHER', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  async loads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.getLoads(tenantId, id);
  }
}
