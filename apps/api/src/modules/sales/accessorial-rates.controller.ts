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
import { AccessorialRatesService } from './accessorial-rates.service';
import { CreateAccessorialRateDto, UpdateAccessorialRateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('accessorial-rates')
@UseGuards(JwtAuthGuard)
export class AccessorialRatesController {
  constructor(private readonly accessorialRatesService: AccessorialRatesService) {}

  @Get()
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
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.accessorialRatesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccessorialRateDto,
  ) {
    return this.accessorialRatesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.accessorialRatesService.delete(tenantId, id, userId);
  }

  @Post('seed-defaults')
  async seedDefaults(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.accessorialRatesService.seedDefaultAccessorials(tenantId, userId);
  }
}
