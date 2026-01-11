import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FactoredPaymentsService } from './factored-payments.service';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { ProcessFactoredPaymentDto } from './dto/process-payment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class FactoredPaymentsController {
  constructor(private readonly service: FactoredPaymentsService) {}

  @Get('factored-payments')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get('factored-payments/:id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post('factored-payments/:id/process')
  async process(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: ProcessFactoredPaymentDto,
  ) {
    return this.service.processPayment(tenantId, user.id, id, dto);
  }

  @Get('carriers/:carrierId/factored-payments')
  async carrierPayments(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.service.listCarrierPayments(tenantId, carrierId);
  }

  @Get('factoring-companies/:id/payments')
  async companyPayments(
    @CurrentTenant() tenantId: string,
    @Param('id') companyId: string,
  ) {
    return this.service.listCompanyPayments(tenantId, companyId);
  }
}
