import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateInvoiceDto,
  InvoiceLineItemType,
  SendInvoiceDto,
  StatementQueryDto,
} from '../dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    });

    if (!lastInvoice) {
      return 'INV-000001';
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace('INV-', ''), 10);
    return `INV-${String(lastNumber + 1).padStart(6, '0')}`;
  }

  async create(tenantId: string, userId: string, data: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    return this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        companyId: data.companyId,
        orderId: data.orderId,
        loadId: data.loadId,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: new Date(data.dueDate),
        subtotal: data.subtotal,
        taxAmount: data.taxAmount ?? 0,
        totalAmount: data.totalAmount,
        amountPaid: 0,
        balanceDue: data.balanceDue,
        currency: data.currency ?? 'USD',
        status: data.status ?? 'DRAFT',
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        internalNotes: data.internalNotes,
        revenueAccountId: data.revenueAccountId,
        arAccountId: data.arAccountId,
        createdById: userId,
        lineItems: data.lineItems
          ? {
              create: data.lineItems.map((item) => ({
                tenantId,
                lineNumber: item.lineNumber,
                description: item.description,
                itemType: item.itemType,
                loadId: item.loadId,
                orderId: item.orderId,
                quantity: item.quantity ?? 1,
                unitPrice: item.unitPrice,
                amount: item.amount,
                revenueAccountId: item.revenueAccountId,
              })),
            }
          : undefined,
      },
      include: {
        company: { select: { id: true, name: true } },
        lineItems: true,
      },
    });
  }

  async findAll(
    tenantId: string,
    options?: {
      status?: string;
      companyId?: string;
      fromDate?: Date;
      toDate?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const where = {
      tenantId,
      ...(options?.status && { status: options.status }),
      ...(options?.companyId && { companyId: options.companyId }),
      ...(options?.fromDate &&
        options?.toDate && {
          invoiceDate: { gte: options.fromDate, lte: options.toDate },
        }),
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { invoiceDate: 'desc' },
        skip: options?.skip,
        take: options?.take,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  async findOne(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        order: { select: { id: true, orderNumber: true } },
        load: { select: { id: true, loadNumber: true } },
        lineItems: { orderBy: { lineNumber: 'asc' } },
        applications: {
          include: {
            payment: { select: { id: true, paymentNumber: true, paymentDate: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, tenantId: string, userId: string, data: Partial<CreateInvoiceDto>) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'VOID') {
      throw new BadRequestException('Cannot update a voided invoice');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        balanceDue: data.balanceDue,
        status: data.status,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        internalNotes: data.internalNotes,
        updatedById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        lineItems: true,
      },
    });
  }

  async sendInvoice(id: string, tenantId: string, dto?: SendInvoiceDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return {
      invoice: updated,
      delivery: dto ?? null,
    };
  }

  async voidInvoice(id: string, tenantId: string, userId: string, reason: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (Number(invoice.amountPaid) > 0) {
      throw new BadRequestException('Cannot void an invoice with payments applied');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'VOID',
        voidedAt: new Date(),
        voidedById: userId,
        voidReason: reason,
      },
    });
  }

  async sendReminder(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'VOID') {
      throw new BadRequestException('Cannot remind a voided invoice');
    }

    const now = new Date();
    const shouldMarkOverdue = invoice.dueDate < now && invoice.status !== 'PAID';

    return this.prisma.invoice.update({
      where: { id },
      data: {
        lastReminderDate: now,
        reminderCount: { increment: 1 },
        status: shouldMarkOverdue ? 'OVERDUE' : invoice.status,
      },
    });
  }

  async getAgingReport(tenantId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] },
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    const now = new Date();
    const aging = {
      current: [] as typeof invoices,
      days1to30: [] as typeof invoices,
      days31to60: [] as typeof invoices,
      days61to90: [] as typeof invoices,
      over90: [] as typeof invoices,
    };

    invoices.forEach((invoice) => {
      const daysOutstanding = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOutstanding <= 0) {
        aging.current.push(invoice);
      } else if (daysOutstanding <= 30) {
        aging.days1to30.push(invoice);
      } else if (daysOutstanding <= 60) {
        aging.days31to60.push(invoice);
      } else if (daysOutstanding <= 90) {
        aging.days61to90.push(invoice);
      } else {
        aging.over90.push(invoice);
      }
    });

    return {
      aging,
      totals: {
        current: aging.current.reduce((sum, i) => sum + Number(i.balanceDue), 0),
        days1to30: aging.days1to30.reduce((sum, i) => sum + Number(i.balanceDue), 0),
        days31to60: aging.days31to60.reduce((sum, i) => sum + Number(i.balanceDue), 0),
        days61to90: aging.days61to90.reduce((sum, i) => sum + Number(i.balanceDue), 0),
        over90: aging.over90.reduce((sum, i) => sum + Number(i.balanceDue), 0),
      },
    };
  }

  async generateFromLoad(tenantId: string, userId: string, loadId: string) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    if (!load.order) {
      throw new BadRequestException('Load is not associated with an order');
    }

    const totalAmount = Number(load.order.totalCharges ?? 0);

    return this.create(tenantId, userId, {
      companyId: load.order.customerId,
      orderId: load.orderId,
      loadId: load.id,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // NET30
      subtotal: totalAmount,
      totalAmount: totalAmount,
      balanceDue: totalAmount,
      paymentTerms: load.order.customer?.paymentTerms ?? 'NET30',
      lineItems: [
        {
          lineNumber: 1,
          description: `Freight charges for Load ${load.loadNumber}`,
          itemType: InvoiceLineItemType.FREIGHT,
          loadId: load.id,
          orderId: load.orderId,
          quantity: 1,
          unitPrice: totalAmount,
          amount: totalAmount,
        },
      ],
    });
  }

  async getStatementData(
    tenantId: string,
    companyId: string,
    query: StatementQueryDto,
  ) {
    const fromDate = query.fromDate
      ? new Date(query.fromDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        companyId,
        invoiceDate: { gte: fromDate, lte: toDate },
      },
      orderBy: { invoiceDate: 'asc' },
    });

    return { company, invoices, fromDate, toDate };
  }
}
