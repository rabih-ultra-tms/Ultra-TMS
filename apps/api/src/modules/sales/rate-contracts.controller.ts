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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { RateContractsService } from './rate-contracts.service';
import { 
  CreateRateContractDto, 
  UpdateRateContractDto, 
  CreateLaneRateDto, 
  UpdateLaneRateDto 
} from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('rate-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
export class RateContractsController {
  constructor(private readonly rateContractsService: RateContractsService) {}

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER')
  @ApiOperation({ summary: 'List rate contracts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiStandardResponse('Rate contracts list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.rateContractsService.findAll(tenantId, { page, limit, status, companyId });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER', 'SALES_REP')
  @ApiOperation({ summary: 'Get rate contract by ID' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Rate contract details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rateContractsService.findOne(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Create rate contract' })
  @ApiStandardResponse('Rate contract created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRateContractDto,
  ) {
    return this.rateContractsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Update rate contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Rate contract updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRateContractDto,
  ) {
    return this.rateContractsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Delete rate contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Rate contract deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.delete(tenantId, id, userId);
  }

  @Post(':id/activate')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Activate rate contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Rate contract activated')
  @ApiErrorResponses()
  async activate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.activate(tenantId, id, userId);
  }

  @Get(':id/lanes')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER', 'SALES_REP')
  @ApiOperation({ summary: 'List lane rates for contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Lane rates list')
  @ApiErrorResponses()
  async getLaneRates(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.getLaneRates(tenantId, id);
  }

  @Post(':id/lanes')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Add lane rate to contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Lane rate added')
  @ApiErrorResponses()
  async addLaneRate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateLaneRateDto,
  ) {
    return this.rateContractsService.addLaneRate(tenantId, id, userId, dto);
  }

  @Put(':id/lanes/:laneId')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Update lane rate' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiParam({ name: 'laneId', description: 'Lane ID' })
  @ApiStandardResponse('Lane rate updated')
  @ApiErrorResponses()
  async updateLaneRate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('laneId') laneId: string,
    @Body() dto: UpdateLaneRateDto,
  ) {
    return this.rateContractsService.updateLaneRate(tenantId, id, laneId, userId, dto);
  }

  @Delete(':id/lanes/:laneId')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Delete lane rate' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiParam({ name: 'laneId', description: 'Lane ID' })
  @ApiStandardResponse('Lane rate deleted')
  @ApiErrorResponses()
  async deleteLaneRate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('laneId') laneId: string,
  ) {
    return this.rateContractsService.deleteLaneRate(tenantId, id, laneId, userId);
  }

  @Post(':id/renew')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Renew rate contract' })
  @ApiParam({ name: 'id', description: 'Rate contract ID' })
  @ApiStandardResponse('Rate contract renewed')
  @ApiErrorResponses()
  async renew(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.renewContract(tenantId, id, userId);
  }

  @Get('find-rate')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'ACCOUNT_MANAGER', 'SALES_REP')
  @ApiOperation({ summary: 'Find contract rate' })
  @ApiQuery({ name: 'originState', required: true, type: String })
  @ApiQuery({ name: 'originCity', required: true, type: String })
  @ApiQuery({ name: 'destState', required: true, type: String })
  @ApiQuery({ name: 'destCity', required: true, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'serviceType', required: false, type: String })
  @ApiStandardResponse('Rate lookup result')
  @ApiErrorResponses()
  async findRate(
    @CurrentTenant() tenantId: string,
    @Query('originState') originState: string,
    @Query('originCity') originCity: string,
    @Query('destState') destState: string,
    @Query('destCity') destCity: string,
    @Query('companyId') companyId?: string,
    @Query('serviceType') serviceType?: string,
  ) {
    return this.rateContractsService.findRate(
      tenantId,
      originState,
      originCity,
      destState,
      destCity,
      companyId,
      serviceType,
    );
  }
}
