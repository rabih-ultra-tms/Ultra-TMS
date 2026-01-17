import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaymentPlansService } from './payment-plans.service';
import { PaginationDto } from '../dto/pagination.dto';
import { CreatePaymentPlanDto } from '../dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from '../dto/update-payment-plan.dto';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { CancelPaymentPlanDto } from '../dto/cancel-payment-plan.dto';
import { PaymentPlanStatus } from '../dto/enums';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('credit/payment-plans')
@UseGuards(JwtAuthGuard)
@ApiTags('Credit Applications')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CREDIT_ANALYST')
export class PaymentPlansController {
  constructor(private readonly paymentPlansService: PaymentPlansService) {}

  @Get()
  @ApiOperation({ summary: 'List payment plans' })
  @ApiStandardResponse('Payment plans list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async list(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationDto & { status?: PaymentPlanStatus },
  ) {
    return this.paymentPlansService.list(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment plan by ID' })
  @ApiParam({ name: 'id', description: 'Payment plan ID' })
  @ApiStandardResponse('Payment plan details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CREDIT_ANALYST', 'CREDIT_VIEWER')
  async detail(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.paymentPlansService.detail(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create payment plan' })
  @ApiStandardResponse('Payment plan created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentPlanDto,
  ) {
    return this.paymentPlansService.create(tenantId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment plan' })
  @ApiParam({ name: 'id', description: 'Payment plan ID' })
  @ApiStandardResponse('Payment plan updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePaymentPlanDto,
  ) {
    return this.paymentPlansService.update(tenantId, user.id, id, dto);
  }

  @Post(':id/record-payment')
  @ApiOperation({ summary: 'Record payment on plan' })
  @ApiParam({ name: 'id', description: 'Payment plan ID' })
  @ApiStandardResponse('Payment recorded')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.paymentPlansService.recordPayment(tenantId, user.id, id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel payment plan' })
  @ApiParam({ name: 'id', description: 'Payment plan ID' })
  @ApiStandardResponse('Payment plan canceled')
  @ApiErrorResponses()
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CancelPaymentPlanDto,
  ) {
    return this.paymentPlansService.cancel(tenantId, user.id, id, dto);
  }
}
