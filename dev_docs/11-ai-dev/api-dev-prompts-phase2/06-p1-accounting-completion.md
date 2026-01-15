# Prompt 06: Accounting Service Completion

**Priority:** P1 (High)  
**Estimated Time:** 4-6 hours  
**Dependencies:** P0 prompts completed  
**Current Coverage:** 65% → Target: 95%

---

## Objective

Complete the Accounting service by implementing missing invoice PDF generation, financial reporting endpoints, customer statements, and QuickBooks integration stubs to enable full invoicing and payment workflows.

---

## Missing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invoices/:id/pdf` | GET | Download invoice PDF |
| `/invoices/:id/send` | POST | Email invoice to customer |
| `/invoices/statements/:customerId` | GET | Customer statement PDF |
| `/reports/revenue` | GET | Revenue summary report |
| `/reports/aging` | GET | A/R aging report |
| `/reports/payables` | GET | A/P aging report |
| `/quickbooks/sync` | POST | Trigger QuickBooks sync (stub) |
| `/quickbooks/status` | GET | Get sync status (stub) |
| `/payments/batch` | POST | Batch payment processing |

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/modules/accounting/pdf.service.ts` | PDF generation logic |
| `apps/api/src/modules/accounting/reports.controller.ts` | Financial reports |
| `apps/api/src/modules/accounting/reports.service.ts` | Reports business logic |
| `apps/api/src/modules/accounting/quickbooks.controller.ts` | QuickBooks stubs |
| `apps/api/src/modules/accounting/dto/reports.dto.ts` | Report query DTOs |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/modules/accounting/invoices.controller.ts` | Add PDF & send endpoints |
| `apps/api/src/modules/accounting/invoices.service.ts` | Add PDF generation |
| `apps/api/src/modules/accounting/payments.controller.ts` | Add batch endpoint |
| `apps/api/src/modules/accounting/accounting.module.ts` | Register new services |

---

## Implementation Steps

### Step 1: Create PDF Service

**File: `apps/api/src/modules/accounting/pdf.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Invoice, Payment, Customer } from '@prisma/client';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateInvoicePdf(
    invoice: Invoice & {
      customer: Customer;
      lineItems: any[];
      payments: Payment[];
    },
    tenantSettings?: any,
  ): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Header
    doc.fontSize(24).text(tenantSettings?.companyName || 'TMS Company', { align: 'left' });
    doc.fontSize(10).text(tenantSettings?.address || '');
    doc.text(tenantSettings?.phone || '');
    
    doc.moveDown();
    doc.fontSize(20).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, { align: 'right' });

    doc.moveDown(2);

    // Bill To
    doc.fontSize(12).text('BILL TO:', { underline: true });
    doc.fontSize(10);
    doc.text(invoice.customer.name);
    doc.text(invoice.customer.billingAddress || '');
    doc.text(`${invoice.customer.billingCity || ''}, ${invoice.customer.billingState || ''} ${invoice.customer.billingZip || ''}`);

    doc.moveDown(2);

    // Line Items Table
    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const rateX = 400;
    const amountX = 480;

    doc.fontSize(10);
    doc.text('Item', itemCodeX, tableTop, { bold: true });
    doc.text('Description', descriptionX, tableTop);
    doc.text('Qty', quantityX, tableTop);
    doc.text('Rate', rateX, tableTop);
    doc.text('Amount', amountX, tableTop);

    doc.moveTo(itemCodeX, tableTop + 15)
       .lineTo(540, tableTop + 15)
       .stroke();

    let y = tableTop + 25;
    for (const item of invoice.lineItems) {
      doc.text(item.itemCode || '', itemCodeX, y);
      doc.text(item.description || '', descriptionX, y, { width: 180 });
      doc.text(item.quantity?.toString() || '1', quantityX, y);
      doc.text(`$${item.rate?.toFixed(2) || '0.00'}`, rateX, y);
      doc.text(`$${item.amount?.toFixed(2) || '0.00'}`, amountX, y);
      y += 20;
    }

    // Totals
    y += 20;
    doc.moveTo(350, y).lineTo(540, y).stroke();
    y += 10;

    doc.text('Subtotal:', 350, y);
    doc.text(`$${invoice.subtotal?.toFixed(2) || '0.00'}`, amountX, y);
    y += 15;

    if (invoice.taxAmount && invoice.taxAmount > 0) {
      doc.text('Tax:', 350, y);
      doc.text(`$${invoice.taxAmount.toFixed(2)}`, amountX, y);
      y += 15;
    }

    doc.fontSize(12);
    doc.text('TOTAL:', 350, y);
    doc.text(`$${invoice.totalAmount?.toFixed(2) || '0.00'}`, amountX, y, { bold: true });

    // Payments Applied
    const totalPaid = invoice.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    if (totalPaid > 0) {
      y += 20;
      doc.fontSize(10);
      doc.text('Payments Applied:', 350, y);
      doc.text(`-$${totalPaid.toFixed(2)}`, amountX, y);
      y += 15;
      doc.fontSize(12);
      doc.text('BALANCE DUE:', 350, y);
      doc.text(`$${(invoice.totalAmount - totalPaid).toFixed(2)}`, amountX, y);
    }

    // Footer
    doc.fontSize(8);
    doc.text('Thank you for your business!', 50, doc.page.height - 50, { align: 'center' });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generateStatementPdf(
    customer: Customer,
    invoices: any[],
    dateRange: { from: Date; to: Date },
    tenantSettings?: any,
  ): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Header
    doc.fontSize(24).text(tenantSettings?.companyName || 'TMS Company');
    doc.moveDown();
    doc.fontSize(16).text('CUSTOMER STATEMENT', { align: 'center' });
    doc.fontSize(10).text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(2);

    // Customer Info
    doc.text(`Customer: ${customer.name}`);
    doc.text(`Account: ${customer.accountNumber || 'N/A'}`);

    doc.moveDown(2);

    // Invoice Table
    const tableTop = doc.y;
    doc.text('Date', 50, tableTop);
    doc.text('Invoice #', 120, tableTop);
    doc.text('Description', 200, tableTop);
    doc.text('Amount', 380, tableTop);
    doc.text('Balance', 450, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();

    let y = tableTop + 25;
    let runningBalance = 0;

    for (const inv of invoices) {
      const balance = (inv.totalAmount || 0) - (inv.paidAmount || 0);
      runningBalance += balance;

      doc.text(inv.invoiceDate?.toLocaleDateString() || '', 50, y);
      doc.text(inv.invoiceNumber || '', 120, y);
      doc.text(inv.description?.substring(0, 30) || 'Services', 200, y);
      doc.text(`$${inv.totalAmount?.toFixed(2) || '0.00'}`, 380, y);
      doc.text(`$${balance.toFixed(2)}`, 450, y);
      y += 20;
    }

    // Total
    y += 20;
    doc.moveTo(350, y).lineTo(540, y).stroke();
    y += 10;
    doc.fontSize(12);
    doc.text('TOTAL BALANCE DUE:', 350, y);
    doc.text(`$${runningBalance.toFixed(2)}`, 450, y);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
```

### Step 2: Add Invoice PDF Endpoints

**File: `apps/api/src/modules/accounting/invoices.controller.ts`** - Add:

```typescript
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

// In constructor
constructor(
  private readonly invoicesService: InvoicesService,
  private readonly pdfService: PdfService,
) {}

@Get(':id/pdf')
@UseGuards(JwtAuthGuard)
async downloadPdf(
  @Param('id') invoiceId: string,
  @CurrentTenant() tenantId: string,
  @Res() res: Response,
) {
  const invoice = await this.invoicesService.findOneWithDetails(tenantId, invoiceId);
  const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
}

@Post(':id/send')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ACCOUNTING')
async sendInvoice(
  @Param('id') invoiceId: string,
  @Body() dto: SendInvoiceDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: AuthUser,
) {
  const result = await this.invoicesService.sendInvoice(
    tenantId,
    invoiceId,
    dto,
    user.id,
  );
  return ok(result, 'Invoice sent successfully');
}

@Get('statements/:customerId')
@UseGuards(JwtAuthGuard)
async getCustomerStatement(
  @Param('customerId') customerId: string,
  @Query() query: StatementQueryDto,
  @CurrentTenant() tenantId: string,
  @Res() res: Response,
) {
  const pdfBuffer = await this.invoicesService.generateStatement(
    tenantId,
    customerId,
    query,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="statement-${customerId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
}
```

**Add DTOs:**

```typescript
// dto/send-invoice.dto.ts
import { IsEmail, IsOptional, IsString, IsArray } from 'class-validator';

export class SendInvoiceDto {
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  to?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;
}

// dto/statement-query.dto.ts
import { IsOptional, IsDateString } from 'class-validator';

export class StatementQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
```

### Step 3: Create Reports Controller

**File: `apps/api/src/modules/accounting/dto/reports.dto.ts`**

```typescript
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export enum ReportGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export class ReportQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy = ReportGroupBy.MONTH;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;
}

export class AgingReportDto {
  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}
```

**File: `apps/api/src/modules/accounting/reports.controller.ts`**

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ReportsService } from './reports.service';
import { ReportQueryDto, AgingReportDto } from './dto/reports.dto';
import { ok } from '../../common/helpers/response.helper';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ACCOUNTING', 'MANAGER')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  async getRevenueReport(
    @Query() query: ReportQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const report = await this.reportsService.getRevenueReport(tenantId, query);
    return ok(report);
  }

  @Get('aging')
  async getAgingReport(
    @Query() query: AgingReportDto,
    @CurrentTenant() tenantId: string,
  ) {
    const report = await this.reportsService.getAgingReport(tenantId, query);
    return ok(report);
  }

  @Get('payables')
  async getPayablesReport(
    @Query() query: AgingReportDto,
    @CurrentTenant() tenantId: string,
  ) {
    const report = await this.reportsService.getPayablesReport(tenantId, query);
    return ok(report);
  }
}
```

**File: `apps/api/src/modules/accounting/reports.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ReportQueryDto, AgingReportDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueReport(tenantId: string, query: ReportQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    // Revenue by period
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        deletedAt: null,
        invoiceDate: { gte: fromDate, lte: toDate },
        ...(query.customerId && { customerId: query.customerId }),
      },
      select: {
        invoiceDate: true,
        totalAmount: true,
        paidAmount: true,
        customer: { select: { id: true, name: true } },
      },
    });

    // Group by period
    const grouped = this.groupByPeriod(invoices, query.groupBy || 'month');

    // Calculate totals
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalOutstanding = totalRevenue - totalCollected;

    return {
      summary: {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        invoiceCount: invoices.length,
      },
      periods: grouped,
      byCustomer: this.groupByCustomer(invoices),
    };
  }

  async getAgingReport(tenantId: string, query: AgingReportDto) {
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['SENT', 'OVERDUE', 'PARTIAL'] },
      },
      include: {
        customer: { select: { id: true, name: true, creditLimit: true } },
      },
    });

    // Calculate aging buckets
    const buckets = {
      current: { min: 0, max: 30, amount: 0, invoices: [] as any[] },
      '31-60': { min: 31, max: 60, amount: 0, invoices: [] as any[] },
      '61-90': { min: 61, max: 90, amount: 0, invoices: [] as any[] },
      '91-120': { min: 91, max: 120, amount: 0, invoices: [] as any[] },
      '120+': { min: 121, max: Infinity, amount: 0, invoices: [] as any[] },
    };

    for (const invoice of invoices) {
      const balance = (invoice.totalAmount || 0) - (invoice.paidAmount || 0);
      if (balance <= 0) continue;

      const daysOld = Math.floor(
        (asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let bucket: keyof typeof buckets;
      if (daysOld <= 0) bucket = 'current';
      else if (daysOld <= 30) bucket = 'current';
      else if (daysOld <= 60) bucket = '31-60';
      else if (daysOld <= 90) bucket = '61-90';
      else if (daysOld <= 120) bucket = '91-120';
      else bucket = '120+';

      buckets[bucket].amount += balance;
      buckets[bucket].invoices.push({
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customer?.name,
        balance,
        daysOld: Math.max(0, daysOld),
      });
    }

    return {
      asOfDate,
      totalOutstanding: Object.values(buckets).reduce((sum, b) => sum + b.amount, 0),
      buckets,
    };
  }

  async getPayablesReport(tenantId: string, query: AgingReportDto) {
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

    const carrierPayables = await this.prisma.carrierPayable.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['PENDING', 'APPROVED', 'PARTIAL'] },
      },
      include: {
        carrier: { select: { id: true, name: true } },
        load: { select: { loadNumber: true } },
      },
    });

    // Aging buckets
    const buckets = {
      current: { amount: 0, items: [] as any[] },
      '31-60': { amount: 0, items: [] as any[] },
      '61-90': { amount: 0, items: [] as any[] },
      '91+': { amount: 0, items: [] as any[] },
    };

    for (const payable of carrierPayables) {
      const balance = (payable.amount || 0) - (payable.paidAmount || 0);
      if (balance <= 0) continue;

      const daysOld = Math.floor(
        (asOfDate.getTime() - payable.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let bucket: keyof typeof buckets;
      if (daysOld <= 30) bucket = 'current';
      else if (daysOld <= 60) bucket = '31-60';
      else if (daysOld <= 90) bucket = '61-90';
      else bucket = '91+';

      buckets[bucket].amount += balance;
      buckets[bucket].items.push({
        carrierId: payable.carrierId,
        carrierName: payable.carrier?.name,
        loadNumber: payable.load?.loadNumber,
        balance,
        daysOld: Math.max(0, daysOld),
      });
    }

    return {
      asOfDate,
      totalPayables: Object.values(buckets).reduce((sum, b) => sum + b.amount, 0),
      buckets,
    };
  }

  private groupByPeriod(items: any[], groupBy: string) {
    // Implementation of period grouping
    const groups: Record<string, { period: string; amount: number; count: number }> = {};
    
    for (const item of items) {
      const date = new Date(item.invoiceDate);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          key = `${date.getFullYear()}`;
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups[key]) {
        groups[key] = { period: key, amount: 0, count: 0 };
      }
      groups[key].amount += item.totalAmount || 0;
      groups[key].count += 1;
    }

    return Object.values(groups).sort((a, b) => a.period.localeCompare(b.period));
  }

  private groupByCustomer(items: any[]) {
    const groups: Record<string, { customerId: string; customerName: string; amount: number; count: number }> = {};

    for (const item of items) {
      const customerId = item.customer?.id || 'unknown';
      if (!groups[customerId]) {
        groups[customerId] = {
          customerId,
          customerName: item.customer?.name || 'Unknown',
          amount: 0,
          count: 0,
        };
      }
      groups[customerId].amount += item.totalAmount || 0;
      groups[customerId].count += 1;
    }

    return Object.values(groups).sort((a, b) => b.amount - a.amount);
  }
}
```

### Step 4: Create QuickBooks Stub Controller

**File: `apps/api/src/modules/accounting/quickbooks.controller.ts`**

```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators';
import { ok } from '../../common/helpers/response.helper';

class QuickBooksSyncDto {
  syncType?: 'full' | 'incremental';
  entities?: string[];
}

@Controller('quickbooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ACCOUNTING')
export class QuickBooksController {
  @Post('sync')
  async triggerSync(
    @Body() dto: QuickBooksSyncDto,
    @CurrentTenant() tenantId: string,
  ) {
    // STUB: QuickBooks integration placeholder
    // TODO: Implement actual QuickBooks Online API integration
    return ok({
      status: 'queued',
      message: 'QuickBooks sync queued - integration pending implementation',
      syncType: dto.syncType || 'incremental',
      entities: dto.entities || ['invoices', 'payments', 'customers'],
      queuedAt: new Date().toISOString(),
    });
  }

  @Get('status')
  async getSyncStatus(@CurrentTenant() tenantId: string) {
    // STUB: Return mock status
    return ok({
      connected: false,
      lastSync: null,
      message: 'QuickBooks integration not configured',
      configuration: {
        clientId: null,
        realmId: null,
        configured: false,
      },
    });
  }
}
```

### Step 5: Add Batch Payment Endpoint

**File: `apps/api/src/modules/accounting/dto/batch-payment.dto.ts`**

```typescript
import { IsArray, IsUUID, IsNumber, IsOptional, IsString, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAllocationDto {
  @IsUUID()
  invoiceId: string;

  @IsNumber()
  amount: number;
}

export class BatchPaymentItemDto {
  @IsUUID()
  customerId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  checkNumber?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}

export class BatchPaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchPaymentItemDto)
  payments: BatchPaymentItemDto[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;
}
```

**File: `apps/api/src/modules/accounting/payments.controller.ts`** - Add:

```typescript
@Post('batch')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ACCOUNTING')
async processBatchPayment(
  @Body() dto: BatchPaymentDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: AuthUser,
) {
  const results = await this.paymentsService.processBatch(tenantId, dto, user.id);
  return ok(results, 'Batch payment processed');
}
```

**File: `apps/api/src/modules/accounting/payments.service.ts`** - Add:

```typescript
async processBatch(
  tenantId: string,
  dto: BatchPaymentDto,
  userId: string,
): Promise<{ processed: number; failed: number; results: any[] }> {
  const results: any[] = [];
  let processed = 0;
  let failed = 0;

  for (const paymentItem of dto.payments) {
    try {
      // Create payment
      const payment = await this.prisma.payment.create({
        data: {
          tenantId,
          customerId: paymentItem.customerId,
          amount: paymentItem.amount,
          paymentMethod: dto.paymentMethod || 'CHECK',
          checkNumber: paymentItem.checkNumber,
          referenceNumber: paymentItem.referenceNumber,
          paymentDate: paymentItem.paymentDate 
            ? new Date(paymentItem.paymentDate) 
            : new Date(),
          status: 'COMPLETED',
          createdById: userId,
        },
      });

      // Apply to invoices if allocations provided
      if (paymentItem.allocations?.length) {
        for (const allocation of paymentItem.allocations) {
          await this.prisma.paymentAllocation.create({
            data: {
              paymentId: payment.id,
              invoiceId: allocation.invoiceId,
              amount: allocation.amount,
            },
          });

          // Update invoice paid amount
          await this.prisma.invoice.update({
            where: { id: allocation.invoiceId },
            data: {
              paidAmount: { increment: allocation.amount },
            },
          });
        }
      }

      results.push({ customerId: paymentItem.customerId, paymentId: payment.id, status: 'success' });
      processed++;
    } catch (error) {
      results.push({ customerId: paymentItem.customerId, status: 'failed', error: error.message });
      failed++;
    }
  }

  return { processed, failed, results };
}
```

### Step 6: Update Accounting Module

**File: `apps/api/src/modules/accounting/accounting.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ReportsController } from './reports.controller';    // ADD
import { ReportsService } from './reports.service';          // ADD
import { QuickBooksController } from './quickbooks.controller'; // ADD
import { PdfService } from './pdf.service';                  // ADD
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [
    InvoicesController,
    PaymentsController,
    ReportsController,    // ADD
    QuickBooksController, // ADD
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    ReportsService,       // ADD
    PdfService,           // ADD
    PrismaService,
  ],
  exports: [InvoicesService, PaymentsService, ReportsService, PdfService],
})
export class AccountingModule {}
```

---

## Acceptance Criteria

- [ ] `GET /invoices/:id/pdf` generates properly formatted PDF
- [ ] `POST /invoices/:id/send` queues email delivery
- [ ] `GET /invoices/statements/:customerId` generates statement PDF
- [ ] `GET /reports/revenue` returns grouped revenue data
- [ ] `GET /reports/aging` returns A/R aging buckets (current, 31-60, 61-90, 91-120, 120+)
- [ ] `GET /reports/payables` returns A/P aging data
- [ ] `POST /quickbooks/sync` returns stub response
- [ ] `GET /quickbooks/status` returns configuration status
- [ ] `POST /payments/batch` processes multiple payments
- [ ] All new endpoints have proper role guards

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 06 row in the status table:
```markdown
| 06 | [Accounting Completion](...) | P1 | 4-6h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Endpoint Coverage | [prev]% | 91% | 95% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 06: Accounting Completion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Invoice PDF generation implemented
- Customer statements endpoint added
- Financial reports (revenue, aging, payables) created
- QuickBooks integration stubs added
- Batch payment processing implemented
- Accounting now at 95% endpoint coverage

#### Metrics Updated
- Endpoint Coverage: [prev]% → 91%
```
