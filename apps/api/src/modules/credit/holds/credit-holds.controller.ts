import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreditHoldsService } from './credit-holds.service';
import { CreateCreditHoldDto } from '../dto/create-credit-hold.dto';
import { ReleaseCreditHoldDto } from '../dto/release-credit-hold.dto';
import { CreditHoldReason } from '../dto/enums';
import { PaginationDto } from '../dto/pagination.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('credit/holds')
@UseGuards(JwtAuthGuard)
@ApiTags('Credit Holds')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CREDIT_ANALYST')
export class CreditHoldsController {
  constructor(private readonly creditHoldsService: CreditHoldsService) {}

  @Get()
  @ApiOperation({ summary: 'List credit holds' })
  @ApiStandardResponse('Credit holds list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationDto & { reason?: CreditHoldReason; isActive?: boolean },
  ) {
    return this.creditHoldsService.findAll(tenantId, query);
  }

  @Get('customer/:companyId')
  @ApiOperation({ summary: 'Get credit holds by customer' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Credit holds for customer')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findByCustomer(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.creditHoldsService.findByCustomer(tenantId, companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit hold by ID' })
  @ApiParam({ name: 'id', description: 'Hold ID' })
  @ApiStandardResponse('Credit hold details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.creditHoldsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create credit hold' })
  @ApiStandardResponse('Credit hold created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCreditHoldDto,
  ) {
    return this.creditHoldsService.create(tenantId, user.id, dto);
  }

  @Patch(':id/release')
  @ApiOperation({ summary: 'Release credit hold' })
  @ApiParam({ name: 'id', description: 'Hold ID' })
  @ApiStandardResponse('Credit hold released')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async release(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReleaseCreditHoldDto,
  ) {
    return this.creditHoldsService.release(tenantId, id, dto);
  }
}
