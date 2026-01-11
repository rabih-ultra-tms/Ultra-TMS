import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalPaymentsService } from './portal-payments.service';
import { MakePaymentDto } from './dto/make-payment.dto';

@UseGuards(PortalAuthGuard)
@Controller('portal/payments')
export class PortalPaymentsController {
  constructor(private readonly paymentsService: PortalPaymentsService) {}

  @Post()
  makePayment(@Body() dto: MakePaymentDto, @Req() req: any) {
    return this.paymentsService.makePayment(
      req.portalUser.tenantId,
      req.portalUser.companyId,
      req.portalUser.id,
      dto,
    );
  }

  @Get()
  history(@Req() req: any) {
    return this.paymentsService.history(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.detail(req.portalUser.tenantId, req.portalUser.companyId, id);
  }
}