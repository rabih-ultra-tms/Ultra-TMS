import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierPortalDashboardService } from './carrier-portal-dashboard.service';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal/dashboard')
export class CarrierPortalDashboardController {
  constructor(private readonly dashboardService: CarrierPortalDashboardService) {}

  @Get()
  dashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id);
  }

  @Get('active-loads')
  active(@Req() req: any) {
    return this.dashboardService.activeLoads(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('payment-summary')
  payment(@Req() req: any) {
    return this.dashboardService.paymentSummary(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('compliance')
  compliance(@Req() req: any) {
    return this.dashboardService.compliance(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Get('alerts')
  alerts(@Req() req: any) {
    return this.dashboardService.alerts(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }
}