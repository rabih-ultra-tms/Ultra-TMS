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
import { JwtAuthGuard } from '../auth/guards';
import { RateContractsService } from './rate-contracts.service';
import { CreateRateContractDto, UpdateRateContractDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('rate-contracts')
@UseGuards(JwtAuthGuard)
export class RateContractsController {
  constructor(private readonly rateContractsService: RateContractsService) {}

  @Get()
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
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.rateContractsService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRateContractDto,
  ) {
    return this.rateContractsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRateContractDto,
  ) {
    return this.rateContractsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.delete(tenantId, id, userId);
  }

  @Post(':id/activate')
  async activate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.rateContractsService.activate(tenantId, id, userId);
  }
}
