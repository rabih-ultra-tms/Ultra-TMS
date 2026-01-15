import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { PortalInvoicesService } from './portal-invoices.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal/invoices')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalInvoicesController {
  constructor(private readonly invoicesService: PortalInvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List portal invoices' })
  @ApiStandardResponse('Portal invoices list')
  @ApiErrorResponses()
  list(@CompanyScope() scope: CompanyScopeType) {
    return this.invoicesService.list(scope.tenantId, scope.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice details')
  @ApiErrorResponses()
  detail(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.invoicesService.detail(scope.tenantId, scope.id, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Get invoice PDF' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice PDF')
  @ApiErrorResponses()
  pdf(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return { url: `/invoices/${id}.pdf`, tenantId: scope.tenantId };
  }

  @Get('aging/summary')
  @ApiOperation({ summary: 'Get invoice aging summary' })
  @ApiStandardResponse('Invoice aging summary')
  @ApiErrorResponses()
  aging(@CompanyScope() scope: CompanyScopeType) {
    return this.invoicesService.aging(scope.tenantId, scope.id);
  }

  @Get('/statements/:month')
  @ApiOperation({ summary: 'Get monthly statement' })
  @ApiParam({ name: 'month', description: 'Statement month (YYYY-MM)' })
  @ApiStandardResponse('Monthly statement')
  @ApiErrorResponses()
  statement(@Param('month') month: string, @CompanyScope() scope: CompanyScopeType) {
    return this.invoicesService.statement(scope.tenantId, scope.id, month);
  }
}