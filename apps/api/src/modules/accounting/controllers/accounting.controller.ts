import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { ReportsService } from '../services';
import { AgingReportDto } from '../dto/reports.dto';
import { ApiStandardResponse, ApiErrorResponses } from '../../../common/swagger';

@Controller('accounting')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'MANAGER', 'SUPER_ADMIN')
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class AccountingController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get accounting dashboard KPIs' })
  @ApiStandardResponse('Accounting dashboard data')
  @ApiErrorResponses()
  async getDashboard(@CurrentTenant() tenantId: string) {
    return this.reportsService.getDashboard(tenantId);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get accounts receivable aging report' })
  @ApiQuery({ name: 'asOfDate', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiStandardResponse('Aging report data')
  @ApiErrorResponses()
  async getAgingReport(
    @CurrentTenant() tenantId: string,
    @Query() query: AgingReportDto,
  ) {
    return this.reportsService.getAgingReport(tenantId, query);
  }
}
