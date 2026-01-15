import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoredPaymentsService } from './factored-payments.service';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { ProcessFactoredPaymentDto } from './dto/process-payment.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Quick Pay')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class FactoredPaymentsController {
  constructor(private readonly service: FactoredPaymentsService) {}

  @Get('factored-payments')
  @ApiOperation({ summary: 'List factored payments' })
  @ApiStandardResponse('Factored payments list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get('factored-payments/:id')
  @ApiOperation({ summary: 'Get factored payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Factored payment details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post('factored-payments/:id/process')
  @ApiOperation({ summary: 'Process factored payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Factored payment processed')
  @ApiErrorResponses()
  async process(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ProcessFactoredPaymentDto,
  ) {
    return this.service.processPayment(tenantId, user.id, id, dto);
  }

  @Get('carriers/:carrierId/factored-payments')
  @ApiOperation({ summary: 'List carrier factored payments' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier factored payments list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async carrierPayments(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.listCarrierPayments(tenantId, carrierId);
  }

  @Get('factoring-companies/:id/payments')
  @ApiOperation({ summary: 'List factoring company payments' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Factoring company payments list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async companyPayments(
    @CurrentTenant() tenantId: string,
    @Param('id') companyId: string,
  ) {
    return this.service.listCompanyPayments(tenantId, companyId);
  }
}
