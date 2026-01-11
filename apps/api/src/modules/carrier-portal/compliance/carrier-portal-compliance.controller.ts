import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierPortalComplianceService } from './carrier-portal-compliance.service';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal/compliance')
export class CarrierPortalComplianceController {
  constructor(private readonly complianceService: CarrierPortalComplianceService) {}

  @Get()
  status(@Req() req: any) {
    return this.complianceService.status(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('documents')
  required() {
    return this.complianceService.requiredDocs();
  }

  @Post('documents')
  upload(@Body() body: any, @Req() req: any) {
    return this.complianceService.upload(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id, body);
  }

  @Get('documents/:id')
  doc(@Param('id') id: string, @Req() req: any) {
    return this.complianceService.docStatus(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Get('expiring')
  expiring(@Req() req: any) {
    return this.complianceService.expiring(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }
}