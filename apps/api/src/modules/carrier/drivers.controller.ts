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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, DriverStatus, DriverResponseDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('carriers/:carrierId/drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
@ApiTags('Carrier')
@ApiBearerAuth('JWT-auth')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @Roles('ADMIN', 'CARRIER_MANAGER')
  @ApiOperation({ summary: 'Create carrier driver' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Driver created')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'List carrier drivers' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiQuery({ name: 'status', required: false, enum: DriverStatus })
  @ApiStandardResponse('Drivers list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'List drivers with expiring credentials' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiStandardResponse('Expiring credentials list')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiStandardResponse('Driver details')
  @ApiErrorResponses()
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const driver = await this.driversService.findOne(tenantId, id);
    return this.serializeDriver(driver);
  }

  @Put(':id')
  @Roles('ADMIN', 'CARRIER_MANAGER', 'SAFETY_MANAGER')
  @ApiOperation({ summary: 'Update driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiStandardResponse('Driver updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Update driver status' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiStandardResponse('Driver status updated')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Delete driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiStandardResponse('Driver deleted')
  @ApiErrorResponses()
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
