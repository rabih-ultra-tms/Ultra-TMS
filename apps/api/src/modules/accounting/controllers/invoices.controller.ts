import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { InvoicesService, PdfService } from '../services';
import { CreateInvoiceDto, SendInvoiceDto, StatementQueryDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'ACCOUNTING', 'ACCOUNTING_MANAGER', 'SUPER_ADMIN')
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiStandardResponse('Invoice created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Invoices list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.invoicesService.findAll(tenantId, {
      status,
      companyId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get aging report' })
  @ApiStandardResponse('Aging report')
  @ApiErrorResponses()
  async getAgingReport(@CurrentTenant() tenantId: string) {
    return this.invoicesService.getAgingReport(tenantId);
  }

  @Get('statements/:companyId')
  @ApiOperation({ summary: 'Download customer statement PDF' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Statement PDF')
  @ApiErrorResponses()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="statement.pdf"')
  async getStatement(
    @Param('companyId') companyId: string,
    @CurrentTenant() tenantId: string,
    @Query() query: StatementQueryDto,
  ) {
    const { company, invoices, fromDate, toDate } =
      await this.invoicesService.getStatementData(tenantId, companyId, query);

    return this.pdfService.generateStatementPdf(company, invoices, {
      from: fromDate,
      to: toDate,
    });
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice PDF')
  @ApiErrorResponses()
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="invoice.pdf"')
  async getInvoicePdf(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    const invoice = await this.invoicesService.findOne(id, tenantId);
    if (!invoice.company) {
      throw new Error('Invoice has no associated company');
    }
    return this.pdfService.generateInvoicePdf(invoice as typeof invoice & { company: NonNullable<typeof invoice.company> });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice details')
  @ApiErrorResponses()
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.invoicesService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice updated')
  @ApiErrorResponses()
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: Partial<CreateInvoiceDto>,
  ) {
    return this.invoicesService.update(id, tenantId, userId, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({ type: SendInvoiceDto })
  @ApiStandardResponse('Invoice sent')
  @ApiErrorResponses()
  async sendInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: SendInvoiceDto,
  ) {
    return this.invoicesService.sendInvoice(id, tenantId, dto);
  }

  @Post(':id/remind')
  @ApiOperation({ summary: 'Send invoice reminder' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice reminder sent')
  @ApiErrorResponses()
  async sendReminder(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.invoicesService.sendReminder(id, tenantId);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiStandardResponse('Invoice voided')
  @ApiErrorResponses()
  async voidInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body('reason') reason: string,
  ) {
    return this.invoicesService.voidInvoice(id, tenantId, userId, reason);
  }

  @Post('generate-from-load/:loadId')
  @ApiOperation({ summary: 'Generate invoice from load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Invoice generated')
  @ApiErrorResponses()
  async generateFromLoad(
    @Param('loadId') loadId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.invoicesService.generateFromLoad(tenantId, userId, loadId);
  }
}
