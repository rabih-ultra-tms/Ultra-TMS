import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditHoldsService } from './credit-holds.service';
import { CreateCreditHoldDto } from '../dto/create-credit-hold.dto';
import { ReleaseCreditHoldDto } from '../dto/release-credit-hold.dto';
import { CreditHoldReason } from '../dto/enums';
import { PaginationDto } from '../dto/pagination.dto';

@Controller('credit/holds')
@UseGuards(JwtAuthGuard)
export class CreditHoldsController {
  constructor(private readonly creditHoldsService: CreditHoldsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationDto & { reason?: CreditHoldReason; isActive?: boolean },
  ) {
    return this.creditHoldsService.findAll(tenantId, query);
  }

  @Get('customer/:companyId')
  async findByCustomer(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditHoldsService.findByCustomer(tenantId, companyId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.creditHoldsService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditHoldDto,
  ) {
    return this.creditHoldsService.create(tenantId, user.id, dto);
  }

  @Patch(':id/release')
  @HttpCode(HttpStatus.OK)
  async release(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReleaseCreditHoldDto,
  ) {
    return this.creditHoldsService.release(tenantId, id, dto);
  }
}
