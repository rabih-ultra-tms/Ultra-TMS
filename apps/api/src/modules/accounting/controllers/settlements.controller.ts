import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SettlementsService } from '../services';
import { CreateSettlementDto } from '../dto';

@Controller('settlements')
@UseGuards(JwtAuthGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateSettlementDto,
  ) {
    return this.settlementsService.create(tenantId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('carrierId') carrierId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.settlementsService.findAll(tenantId, {
      status,
      carrierId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('payables-summary')
  async getPayablesSummary(@CurrentTenant() tenantId: string) {
    return this.settlementsService.getPayablesSummary(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.settlementsService.findOne(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: Partial<CreateSettlementDto>,
  ) {
    return this.settlementsService.update(id, tenantId, userId, dto);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.settlementsService.approve(id, tenantId, userId);
  }

  @Post(':id/void')
  async voidSettlement(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.settlementsService.voidSettlement(id, tenantId);
  }

  @Post('generate-from-load/:loadId')
  async generateFromLoad(
    @Param('loadId') loadId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.settlementsService.generateFromLoad(tenantId, userId, loadId);
  }
}
