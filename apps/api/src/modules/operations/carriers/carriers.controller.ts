import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CarriersService } from './carriers.service';
import {
  CreateOperationsCarrierDto,
  UpdateOperationsCarrierDto,
  ListOperationsCarriersDto,
  CreateOperationsCarrierDriverDto,
  UpdateOperationsCarrierDriverDto,
  CreateOperationsCarrierTruckDto,
  UpdateOperationsCarrierTruckDto,
  CreateOperationsCarrierDocumentDto,
} from './dto';

@Controller('operations/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Operations - Carriers')
@ApiBearerAuth('JWT-auth')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  // ============================================================================
  // CARRIERS ENDPOINTS
  // ============================================================================

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create a new carrier' })
  async createCarrier(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateOperationsCarrierDto
  ) {
    return this.carriersService.createCarrier(tenantId, dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'List carriers' })
  async listCarriers(
    @CurrentTenant() tenantId: string,
    @Query() query: ListOperationsCarriersDto
  ) {
    return this.carriersService.listCarriers(tenantId, query);
  }

  @Get('stats')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get carrier statistics' })
  async getCarrierStats(@CurrentTenant() tenantId: string) {
    return this.carriersService.getCarrierStats(tenantId);
  }

  @Get(':carrierId')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get carrier by ID' })
  async getCarrier(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.carriersService.getCarrierById(tenantId, carrierId);
  }

  @Patch(':carrierId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update carrier' })
  async updateCarrier(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: UpdateOperationsCarrierDto
  ) {
    return this.carriersService.updateCarrier(tenantId, carrierId, dto);
  }

  @Delete(':carrierId')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete carrier' })
  async deleteCarrier(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.carriersService.deleteCarrier(tenantId, carrierId);
  }

  // ============================================================================
  // DRIVERS ENDPOINTS
  // ============================================================================

  @Post(':carrierId/drivers')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create driver for carrier' })
  async createDriver(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateOperationsCarrierDriverDto
  ) {
    return this.carriersService.createDriver(tenantId, carrierId, dto);
  }

  @Get(':carrierId/drivers')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'List drivers for carrier' })
  async listDrivers(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.carriersService.listDrivers(tenantId, carrierId);
  }

  @Get(':carrierId/drivers/:driverId')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get driver by ID' })
  async getDriver(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('driverId') driverId: string
  ) {
    return this.carriersService.getDriverById(tenantId, carrierId, driverId);
  }

  @Patch(':carrierId/drivers/:driverId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update driver' })
  async updateDriver(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('driverId') driverId: string,
    @Body() dto: UpdateOperationsCarrierDriverDto
  ) {
    return this.carriersService.updateDriver(
      tenantId,
      carrierId,
      driverId,
      dto
    );
  }

  @Delete(':carrierId/drivers/:driverId')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete driver' })
  async deleteDriver(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('driverId') driverId: string
  ) {
    return this.carriersService.deleteDriver(tenantId, carrierId, driverId);
  }

  // ============================================================================
  // TRUCKS ENDPOINTS
  // ============================================================================

  @Post(':carrierId/trucks')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create truck for carrier' })
  async createTruck(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateOperationsCarrierTruckDto
  ) {
    return this.carriersService.createTruck(tenantId, carrierId, dto);
  }

  @Get(':carrierId/trucks')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'List trucks for carrier' })
  async listTrucks(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.carriersService.listTrucks(tenantId, carrierId);
  }

  @Get(':carrierId/trucks/:truckId')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Get truck by ID' })
  async getTruck(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('truckId') truckId: string
  ) {
    return this.carriersService.getTruckById(tenantId, carrierId, truckId);
  }

  @Patch(':carrierId/trucks/:truckId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update truck' })
  async updateTruck(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('truckId') truckId: string,
    @Body() dto: UpdateOperationsCarrierTruckDto
  ) {
    return this.carriersService.updateTruck(
      tenantId,
      carrierId,
      truckId,
      dto
    );
  }

  @Patch(':carrierId/trucks/:truckId/assign-driver/:driverId')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Assign driver to truck' })
  async assignDriver(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('truckId') truckId: string,
    @Param('driverId') driverId: string
  ) {
    return this.carriersService.assignDriverToTruck(
      tenantId,
      carrierId,
      truckId,
      driverId
    );
  }

  @Delete(':carrierId/trucks/:truckId')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete truck' })
  async deleteTruck(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('truckId') truckId: string
  ) {
    return this.carriersService.deleteTruck(tenantId, carrierId, truckId);
  }

  // ============================================================================
  // DOCUMENTS ENDPOINTS
  // ============================================================================

  @Get(':carrierId/documents')
  @Roles('ADMIN', 'MANAGER', 'SALES_REP', 'SALES_MANAGER')
  @ApiOperation({ summary: 'List documents for carrier' })
  async listDocuments(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.carriersService.listDocuments(tenantId, carrierId);
  }

  @Post(':carrierId/documents')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create document record for carrier' })
  async createDocument(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateOperationsCarrierDocumentDto,
  ) {
    return this.carriersService.createDocument(tenantId, carrierId, dto);
  }

  @Delete(':carrierId/documents/:documentId')
  @Roles('ADMIN', 'MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document record' })
  async deleteDocument(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.carriersService.deleteDocument(tenantId, carrierId, documentId);
  }
}
