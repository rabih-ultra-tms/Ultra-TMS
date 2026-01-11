import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalInvoicesService } from './portal-invoices.service';

@UseGuards(PortalAuthGuard)
@Controller('portal/invoices')
export class PortalInvoicesController {
  constructor(private readonly invoicesService: PortalInvoicesService) {}

  @Get()
  list(@Req() req: any) {
    return this.invoicesService.list(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.detail(req.portalUser.tenantId, req.portalUser.companyId, id);
  }

  @Get(':id/pdf')
  pdf(@Param('id') id: string, @Req() req: any) {
    return { url: `/invoices/${id}.pdf`, tenantId: req.portalUser.tenantId };
  }

  @Get('aging/summary')
  aging(@Req() req: any) {
    return this.invoicesService.aging(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get('/statements/:month')
  statement(@Param('month') month: string, @Req() req: any) {
    return this.invoicesService.statement(req.portalUser.tenantId, req.portalUser.companyId, month);
  }
}