import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { SafetyReportsService } from './safety-reports.service';

@Controller('safety/reports')
@UseGuards(JwtAuthGuard)
export class SafetyReportsController {
  constructor(private readonly service: SafetyReportsService) {}

  @Get('compliance')
  compliance(@CurrentTenant() tenantId: string) {
    return this.service.complianceReport(tenantId);
  }

  @Get('incidents')
  incidents(@CurrentTenant() tenantId: string) {
    return this.service.incidentReport(tenantId);
  }

  @Get('expiring')
  expiring(@CurrentTenant() tenantId: string) {
    return this.service.expiringReport(tenantId);
  }
}
