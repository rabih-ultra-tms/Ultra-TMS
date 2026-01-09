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
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';

@Controller('carriers/:carrierId/drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateDriverDto,
  ) {
    return this.driversService.create(tenantId, carrierId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query('status') status?: string,
  ) {
    return this.driversService.findAllForCarrier(tenantId, carrierId, { status });
  }

  @Get('expiring-credentials')
  async getExpiringCredentials(
    @CurrentTenant() tenantId: string,
    @Query('days') days?: string,
  ) {
    return this.driversService.getExpiringCredentials(
      tenantId,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get(':id')
  async findOne(
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.driversService.delete(tenantId, id);
  }
}
