import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { CarrierPortalInvoicesService } from './carrier-portal-invoices.service';
import { SubmitInvoiceDto } from './dto/submit-invoice.dto';
import { RequestQuickPayDto } from './dto/request-quick-pay.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalInvoicesController {
  constructor(private readonly invoicesService: CarrierPortalInvoicesService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Submit carrier invoice' })
  @ApiStandardResponse('Invoice submitted')
  @ApiErrorResponses()
  submit(@Body() body: SubmitInvoiceDto, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.invoicesService.submitInvoice(scope.tenantId, scope.id, req.carrierPortalUser.id, body);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List carrier invoices' })
  @ApiStandardResponse('Carrier invoices list')
  @ApiErrorResponses()
  list(@CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.listInvoices(scope.tenantId, scope.id);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get carrier invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Carrier invoice details')
  @ApiErrorResponses()
  detail(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.invoiceDetail(scope.tenantId, scope.id, id);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'List settlements' })
  @ApiStandardResponse('Settlements list')
  @ApiErrorResponses()
  settlements(@CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.settlements(scope.tenantId, scope.id);
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Get settlement by ID' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement details')
  @ApiErrorResponses()
  settlementDetail(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.settlementDetail(scope.tenantId, scope.id, id);
  }

  @Get('settlements/:id/pdf')
  @ApiOperation({ summary: 'Get settlement PDF' })
  @ApiParam({ name: 'id', description: 'Settlement ID' })
  @ApiStandardResponse('Settlement PDF')
  @ApiErrorResponses()
  settlementPdf(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.settlementPdf(scope.tenantId, scope.id, id);
  }

  @Post('quick-pay/:settlementId')
  @ApiOperation({ summary: 'Request quick pay' })
  @ApiParam({ name: 'settlementId', description: 'Settlement ID' })
  @ApiStandardResponse('Quick pay requested')
  @ApiErrorResponses()
  quickPay(@Param('settlementId') settlementId: string, @Body() dto: RequestQuickPayDto, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.invoicesService.quickPay(
      scope.tenantId,
      scope.id,
      req.carrierPortalUser.id,
      settlementId,
      dto,
    );
  }

  @Get('payment-history')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiStandardResponse('Payment history')
  @ApiErrorResponses()
  paymentHistory(@CarrierScope() scope: CarrierScopeType) {
    return this.invoicesService.paymentHistory(scope.tenantId, scope.id);
  }
}