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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { InvoicesService, PdfService } from '../services';
import { CreateInvoiceDto, SendInvoiceDto, StatementQueryDto } from '../dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(tenantId, userId, dto);
  }

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('companyId') companyId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.invoicesService.findAll(tenantId, {
      status,
      companyId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('aging')
  async getAgingReport(@CurrentTenant() tenantId: string) {
    return this.invoicesService.getAgingReport(tenantId);
  }

  @Get('statements/:companyId')
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
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="invoice.pdf"')
  async getInvoicePdf(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    const invoice = await this.invoicesService.findOne(id, tenantId);
    return this.pdfService.generateInvoicePdf(invoice);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.invoicesService.findOne(id, tenantId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body() dto: Partial<CreateInvoiceDto>,
  ) {
    return this.invoicesService.update(id, tenantId, userId, dto);
  }

  @Post(':id/send')
  async sendInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: SendInvoiceDto,
  ) {
    return this.invoicesService.sendInvoice(id, tenantId, dto);
  }

  @Post(':id/remind')
  async sendReminder(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.invoicesService.sendReminder(id, tenantId);
  }

  @Post(':id/void')
  async voidInvoice(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
    @Body('reason') reason: string,
  ) {
    return this.invoicesService.voidInvoice(id, tenantId, userId, reason);
  }

  @Post('generate-from-load/:loadId')
  async generateFromLoad(
    @Param('loadId') loadId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser() userId: string,
  ) {
    return this.invoicesService.generateFromLoad(tenantId, userId, loadId);
  }
}
