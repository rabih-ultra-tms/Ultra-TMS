import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierPortalInvoicesService } from './carrier-portal-invoices.service';
import { SubmitInvoiceDto } from './dto/submit-invoice.dto';
import { RequestQuickPayDto } from './dto/request-quick-pay.dto';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal')
export class CarrierPortalInvoicesController {
  constructor(private readonly invoicesService: CarrierPortalInvoicesService) {}

  @Post('invoices')
  submit(@Body() body: SubmitInvoiceDto, @Req() req: any) {
    return this.invoicesService.submitInvoice(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id, body);
  }

  @Get('invoices')
  list(@Req() req: any) {
    return this.invoicesService.listInvoices(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('invoices/:id')
  detail(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.invoiceDetail(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Get('settlements')
  settlements(@Req() req: any) {
    return this.invoicesService.settlements(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('settlements/:id')
  settlementDetail(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.settlementDetail(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Get('settlements/:id/pdf')
  settlementPdf(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.settlementPdf(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Post('quick-pay/:settlementId')
  quickPay(@Param('settlementId') settlementId: string, @Body() dto: RequestQuickPayDto, @Req() req: any) {
    return this.invoicesService.quickPay(
      req.carrierPortalUser.tenantId,
      req.carrierPortalUser.carrierId,
      req.carrierPortalUser.id,
      settlementId,
      dto,
    );
  }

  @Get('payment-history')
  paymentHistory(@Req() req: any) {
    return this.invoicesService.paymentHistory(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }
}