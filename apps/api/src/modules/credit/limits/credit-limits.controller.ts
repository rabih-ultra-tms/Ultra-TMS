import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditLimitsService } from './credit-limits.service';
import { CreateCreditLimitDto } from '../dto/create-credit-limit.dto';
import { UpdateCreditLimitDto } from '../dto/update-credit-limit.dto';
import { CreditLimitQueryDto } from '../dto/credit-limit-query.dto';
import { IncreaseCreditLimitDto } from '../dto/increase-credit-limit.dto';

@Controller('credit/limits')
@UseGuards(JwtAuthGuard)
export class CreditLimitsController {
  constructor(private readonly creditLimitsService: CreditLimitsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CreditLimitQueryDto,
  ) {
    return this.creditLimitsService.findAll(tenantId, query);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditLimitDto,
  ) {
    return this.creditLimitsService.create(tenantId, user.id, dto);
  }

  @Put(':companyId')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('companyId') companyId: string,
    @Body() dto: UpdateCreditLimitDto,
  ) {
    return this.creditLimitsService.update(tenantId, user.id, companyId, dto);
  }

  @Patch(':companyId/increase')
  @HttpCode(HttpStatus.OK)
  async increase(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('companyId') companyId: string,
    @Body() dto: IncreaseCreditLimitDto,
  ) {
    return this.creditLimitsService.increase(tenantId, user.id, companyId, dto);
  }

  @Get(':companyId/utilization')
  async utilization(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditLimitsService.utilization(tenantId, companyId);
  }

  @Get(':companyId')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditLimitsService.findOneByCustomer(tenantId, companyId);
  }
}
