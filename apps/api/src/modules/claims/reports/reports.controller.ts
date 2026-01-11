import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ClaimsReportsService } from './reports.service';

@Controller('claims/reports')
@UseGuards(JwtAuthGuard)
export class ClaimsReportsController {
  constructor(private readonly reportsService: ClaimsReportsService) {}

  @Get('status')
  async status(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.statusSummary(tenantId);
  }

  @Get('types')
  async types(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.typeSummary(tenantId);
  }

  @Get('financials')
  async financials(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.financials(tenantId);
  }

  @Get('overdue')
  async overdue(
    @CurrentTenant() tenantId: string,
  ) {
    return this.reportsService.overdue(tenantId);
  }
}
