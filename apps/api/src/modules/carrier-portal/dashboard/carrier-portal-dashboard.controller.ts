import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { CarrierPortalDashboardService } from './carrier-portal-dashboard.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal/dashboard')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalDashboardController {
  constructor(private readonly dashboardService: CarrierPortalDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get carrier portal dashboard' })
  @ApiStandardResponse('Carrier portal dashboard')
  @ApiErrorResponses()
  dashboard(@CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.dashboardService.getDashboard(scope.tenantId, scope.id, req.carrierPortalUser.id);
  }

  @Get('active-loads')
  @ApiOperation({ summary: 'Get active loads' })
  @ApiStandardResponse('Active loads')
  @ApiErrorResponses()
  active(@CarrierScope() scope: CarrierScopeType) {
    return this.dashboardService.activeLoads(scope.tenantId, scope.id);
  }

  @Get('payment-summary')
  @ApiOperation({ summary: 'Get payment summary' })
  @ApiStandardResponse('Payment summary')
  @ApiErrorResponses()
  payment(@CarrierScope() scope: CarrierScopeType) {
    return this.dashboardService.paymentSummary(scope.tenantId, scope.id);
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Get compliance summary' })
  @ApiStandardResponse('Compliance summary')
  @ApiErrorResponses()
  compliance(@CarrierScope() scope: CarrierScopeType) {
    return this.dashboardService.compliance(scope.tenantId, scope.id);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get carrier alerts' })
  @ApiStandardResponse('Carrier alerts')
  @ApiErrorResponses()
  alerts(@CarrierScope() scope: CarrierScopeType) {
    return this.dashboardService.alerts(scope.tenantId, scope.id);
  }
}