import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { InvoicesService } from '../services';
import { CreateInvoiceDto } from '../dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

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
  async sendInvoice(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.invoicesService.sendInvoice(id, tenantId);
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
