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
import { AccessorialRatesService } from './accessorial-rates.service';
import { CreateAccessorialRateDto, UpdateAccessorialRateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('accessorial-rates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
export class AccessorialRatesController {
  constructor(private readonly accessorialRatesService: AccessorialRatesService) {}

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'List accessorial rates' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'accessorialType', required: false, type: String })
  @ApiStandardResponse('Accessorial rates list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('contractId') contractId?: string,
    @Query('status') status?: string,
    @Query('accessorialType') accessorialType?: string,
  ) {
    return this.accessorialRatesService.findAll(tenantId, {
      page,
      limit,
      contractId,
      status,
      accessorialType,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST', 'DISPATCHER', 'OPERATIONS')
  @ApiOperation({ summary: 'Get accessorial rate by ID' })
  @ApiParam({ name: 'id', description: 'Accessorial rate ID' })
  @ApiStandardResponse('Accessorial rate details')
  @ApiErrorResponses()
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accessorialRatesService.findOne(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Create accessorial rate' })
  @ApiStandardResponse('Accessorial rate created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Update accessorial rate' })
  @ApiParam({ name: 'id', description: 'Accessorial rate ID' })
  @ApiStandardResponse('Accessorial rate updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Delete accessorial rate' })
  @ApiParam({ name: 'id', description: 'Accessorial rate ID' })
  @ApiStandardResponse('Accessorial rate deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.accessorialRatesService.delete(tenantId, id, userId);
  }

  @Post('seed-defaults')
  @Roles('ADMIN', 'SALES_MANAGER', 'PRICING_ANALYST')
  @ApiOperation({ summary: 'Seed default accessorial rates' })
  @ApiStandardResponse('Default accessorial rates seeded')
  @ApiErrorResponses()
  async seedDefaults(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.accessorialRatesService.seedDefaultAccessorials(tenantId, userId);
  }
}
