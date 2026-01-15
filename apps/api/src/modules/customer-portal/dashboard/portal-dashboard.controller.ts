import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PortalDashboardService } from './portal-dashboard.service';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal/dashboard')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalDashboardController {
  constructor(private readonly dashboardService: PortalDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get customer portal dashboard' })
  @ApiStandardResponse('Customer portal dashboard')
  @ApiErrorResponses()
  dashboard(@CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.dashboardService.getDashboard(scope.tenantId, scope.id, req.portalUser.id);
  }

  @Get('active-shipments')
  @ApiOperation({ summary: 'Get active shipments' })
  @ApiStandardResponse('Active shipments')
  @ApiErrorResponses()
  active(@CompanyScope() scope: CompanyScopeType) {
    return this.dashboardService.getActiveShipments(scope.tenantId, scope.id);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiStandardResponse('Recent activity')
  @ApiErrorResponses()
  recent(@CompanyScope() scope: CompanyScopeType) {
    return this.dashboardService.getRecentActivity(scope.tenantId, scope.id);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get portal alerts' })
  @ApiStandardResponse('Portal alerts')
  @ApiErrorResponses()
  alerts(@CompanyScope() scope: CompanyScopeType) {
    return this.dashboardService.getAlerts(scope.tenantId, scope.id);
  }
}