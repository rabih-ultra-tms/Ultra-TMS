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
import { InsurancesService } from './insurances.service';
import { CreateInsuranceDto, UpdateInsuranceDto } from './dto';

@Controller('carriers/:carrierId/insurance')
@UseGuards(JwtAuthGuard)
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateInsuranceDto,
  ) {
    return this.insurancesService.create(tenantId, carrierId, user.id, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query('status') status?: string,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.insurancesService.findAllForCarrier(tenantId, carrierId, {
      status,
      includeExpired: includeExpired === 'true',
    });
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.insurancesService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceDto,
  ) {
    return this.insurancesService.update(tenantId, id, dto);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  async verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.insurancesService.verify(tenantId, id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.insurancesService.delete(tenantId, id);
  }

  @Post('check-expired')
  @HttpCode(HttpStatus.OK)
  async checkExpired(
    @CurrentTenant() tenantId: string,
  ) {
    return this.insurancesService.checkExpiredInsurance(tenantId);
  }
}
