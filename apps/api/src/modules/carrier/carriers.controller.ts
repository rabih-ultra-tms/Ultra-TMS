import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { CarriersService } from './carriers.service';
import {
  CreateCarrierDto,
  UpdateCarrierDto,
  UpdateCarrierStatusDto,
  UpdateCarrierTierDto,
  CarrierSearchDto,
  CarrierListQueryDto,
  LookupMcDto,
  LookupDotDto,
} from './dto/carrier.dto';

@UseGuards(JwtAuthGuard)
@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CarrierListQueryDto
  ) {
    return this.carriersService.findAll(tenantId, query);
  }

  @Get('search')
  async search(
    @CurrentTenant() tenantId: string,
    @Query() query: CarrierSearchDto
  ) {
    return this.carriersService.search(tenantId, query);
  }

  @Post('lookup-mc')
  async lookupMc(
    @CurrentTenant() tenantId: string,
    @Body() dto: LookupMcDto
  ) {
    return this.carriersService.lookupMc(tenantId, dto.mcNumber);
  }

  @Post('lookup-dot')
  async lookupDot(
    @CurrentTenant() tenantId: string,
    @Body() dto: LookupDotDto
  ) {
    return this.carriersService.lookupDot(tenantId, dto.dotNumber);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.carriersService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCarrierDto
  ) {
    return this.carriersService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDto
  ) {
    return this.carriersService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string
  ) {
    return this.carriersService.delete(tenantId, id, userId);
  }

  @Get(':id/compliance')
  async getCompliance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.carriersService.getCompliance(tenantId, id);
  }

  @Post(':id/verify-fmcsa')
  async verifyFmcsa(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string
  ) {
    return this.carriersService.verifyFmcsa(tenantId, id, userId);
  }

  @Get(':id/performance')
  async getPerformance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string
  ) {
    return this.carriersService.getPerformance(tenantId, id);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierStatusDto
  ) {
    return this.carriersService.updateStatus(tenantId, id, userId, dto);
  }

  @Patch(':id/tier')
  async updateTier(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierTierDto
  ) {
    return this.carriersService.updateTier(tenantId, id, userId, dto);
  }
}
