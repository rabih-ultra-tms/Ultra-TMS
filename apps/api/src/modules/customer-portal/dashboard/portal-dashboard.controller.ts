import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PortalDashboardService } from './portal-dashboard.service';
import { PortalAuthGuard } from '../guards/portal-auth.guard';

@UseGuards(PortalAuthGuard)
@Controller('portal/dashboard')
export class PortalDashboardController {
  constructor(private readonly dashboardService: PortalDashboardService) {}

  @Get()
  dashboard(@Req() req: any) {
    return this.dashboardService.getDashboard(req.portalUser.tenantId, req.portalUser.companyId, req.portalUser.id);
  }

  @Get('active-shipments')
  active(@Req() req: any) {
    return this.dashboardService.getActiveShipments(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get('recent-activity')
  recent(@Req() req: any) {
    return this.dashboardService.getRecentActivity(req.portalUser.tenantId, req.portalUser.companyId);
  }

  @Get('alerts')
  alerts(@Req() req: any) {
    return this.dashboardService.getAlerts(req.portalUser.tenantId, req.portalUser.companyId);
  }
}