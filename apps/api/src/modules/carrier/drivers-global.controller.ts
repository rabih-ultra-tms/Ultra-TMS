import { Body, Controller, Delete, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { DriversService } from './drivers.service';
import { UpdateDriverDto, DriverStatus } from './dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard)
export class DriversGlobalController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
  ) {
    return this.driversService.findAll(tenantId, { status, carrierId });
  }

  @Get(':id')
  async getOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driversService.update(tenantId, id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: { status: DriverStatus },
  ) {
    return this.driversService.update(tenantId, id, { status: body.status });
  }

  @Delete(':id')
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.delete(tenantId, id);
  }

  @Get(':id/loads')
  async loads(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.getLoads(tenantId, id);
  }
}
