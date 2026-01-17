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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditLimitsService } from './credit-limits.service';
import { CreateCreditLimitDto } from '../dto/create-credit-limit.dto';
import { UpdateCreditLimitDto } from '../dto/update-credit-limit.dto';
import { CreditLimitQueryDto } from '../dto/credit-limit-query.dto';
import { IncreaseCreditLimitDto } from '../dto/increase-credit-limit.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('credit/limits')
@UseGuards(JwtAuthGuard)
@ApiTags('Credit Limits')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CREDIT_ANALYST')
export class CreditLimitsController {
  constructor(private readonly creditLimitsService: CreditLimitsService) {}

  @Get()
  @ApiOperation({ summary: 'List credit limits' })
  @ApiStandardResponse('Credit limits list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: CreditLimitQueryDto,
  ) {
    return this.creditLimitsService.findAll(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create credit limit' })
  @ApiStandardResponse('Credit limit created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditLimitDto,
  ) {
    return this.creditLimitsService.create(tenantId, user.id, dto);
  }

  @Put(':companyId')
  @ApiOperation({ summary: 'Update credit limit' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Credit limit updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('companyId') companyId: string,
    @Body() dto: UpdateCreditLimitDto,
  ) {
    return this.creditLimitsService.update(tenantId, user.id, companyId, dto);
  }

  @Patch(':companyId/increase')
  @ApiOperation({ summary: 'Increase credit limit' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Credit limit increased')
  @ApiErrorResponses()
  @Roles('ADMIN')
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
  @ApiOperation({ summary: 'Get credit utilization' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Credit utilization')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async utilization(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditLimitsService.utilization(tenantId, companyId);
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Get credit limit by company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Credit limit details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditLimitsService.findOneByCustomer(tenantId, companyId);
  }
}
