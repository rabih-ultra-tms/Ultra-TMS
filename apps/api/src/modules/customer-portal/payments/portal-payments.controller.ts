import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { PortalPaymentsService } from './portal-payments.service';
import { MakePaymentDto } from './dto/make-payment.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal/payments')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalPaymentsController {
  constructor(private readonly paymentsService: PortalPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Make a payment' })
  @ApiStandardResponse('Payment submitted')
  @ApiErrorResponses()
  makePayment(@Body() dto: MakePaymentDto, @CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.paymentsService.makePayment(
      scope.tenantId,
      scope.id,
      req.portalUser.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get payment history' })
  @ApiStandardResponse('Payment history')
  @ApiErrorResponses()
  history(@CompanyScope() scope: CompanyScopeType) {
    return this.paymentsService.history(scope.tenantId, scope.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiStandardResponse('Payment details')
  @ApiErrorResponses()
  detail(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.paymentsService.detail(scope.tenantId, scope.id, id);
  }
}