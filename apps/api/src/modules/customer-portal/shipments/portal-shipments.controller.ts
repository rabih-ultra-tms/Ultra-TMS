import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { PortalShipmentsService } from './portal-shipments.service';

@UseGuards(PortalAuthGuard)
@Controller('portal/shipments')
export class PortalShipmentsController {
  constructor(private readonly shipmentsService: PortalShipmentsService) {}

  @Get()
  list(@Req() req: any) {
    return this.shipmentsService.list(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get(':id')
  detail(@Param('id') id: string, @Req() req: any) {
    return this.shipmentsService.detail(req.portalUser.tenantId, req.portalUser.companyId, id);
  }

  @Get(':id/tracking')
  tracking(@Param('id') id: string, @Req() req: any) {
    return this.shipmentsService.tracking(req.portalUser.tenantId, req.portalUser.companyId, id);
  }

  @Get(':id/events')
  events(@Param('id') id: string, @Req() req: any) {
    return this.shipmentsService.events(req.portalUser.tenantId, req.portalUser.companyId, id);
  }

  @Get(':id/documents')
  documents(@Param('id') id: string, @Req() req: any) {
    return this.shipmentsService.documents(req.portalUser.tenantId, req.portalUser.companyId, id);
  }

  @Post(':id/contact')
  contact(@Param('id') id: string, @Body('message') message: string, @Req() req: any) {
    return this.shipmentsService.contact(
      req.portalUser.tenantId,
      req.portalUser.companyId,
      id,
      message,
      req.portalUser.id,
    );
  }
}