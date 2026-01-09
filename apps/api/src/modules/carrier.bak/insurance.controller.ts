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
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { InsuranceService } from './insurance.service';
import {
  CreateInsuranceDto,
  UpdateInsuranceDto,
  VerifyInsuranceDto,
  InsuranceListQueryDto,
} from './dto/insurance.dto';

@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get('expiring')
  async getExpiring(
    @CurrentTenant() tenantId: string,
    @Query() query: InsuranceListQueryDto
  ) {
    return this.insuranceService.getExpiring(tenantId, query);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('carriers/:carrierId/insurance')
export class CarrierInsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.insuranceService.findAll(tenantId, carrierId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.insuranceService.findOne(tenantId, carrierId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateInsuranceDto
  ) {
    return this.insuranceService.create(tenantId, carrierId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceDto
  ) {
    return this.insuranceService.update(tenantId, carrierId, id, dto);
  }

  @Patch(':id/verify')
  async verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string,
    @Body() dto: VerifyInsuranceDto
  ) {
    return this.insuranceService.verify(tenantId, carrierId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.insuranceService.delete(tenantId, carrierId, id);
  }
}
