import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { AgingReportDto, ReportGroupBy, ReportQueryDto } from '../dto/reports.dto';

type InvoiceWithCompany = Prisma.InvoiceGetPayload<{
  include: { company: { select: { id: true; name: true } } };
}>;

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(tenantId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [invoices, overdueInvoices, payablesPending, paymentsThisMonth] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId },
        select: {
          totalAmount: true,
          amountPaid: true,
          status: true,
          invoiceDate: true,
          dueDate: true,
        },
      }),
      this.prisma.invoice.findMany({
        where: { tenantId, status: 'OVERDUE' },
        select: { totalAmount: true, amountPaid: true },
      }),
      this.prisma.paymentMade.aggregate({
        where: { tenantId, deletedAt: null, status: { in: ['PENDING', 'SENT'] } },
        _sum: { amount: true },
      }),
      this.prisma.paymentReceived.findMany({
        where: { tenantId, deletedAt: null, paymentDate: { gte: monthStart } },
        select: { amount: true },
      }),
    ]);

    // Total AR = outstanding invoice balances
    const totalAR = invoices.reduce(
      (s, i) => s + (Number(i.totalAmount || 0) - Number(i.amountPaid || 0)),
      0,
    );

    // Total AP = pending outbound payments
    const totalAP = Number(payablesPending._sum.amount || 0);

    // Overdue count
    const overdueInvoiceCount = overdueInvoices.length;

    // DSO = (Total AR / Total Revenue) * Days in period (use 90-day rolling)
    const totalRevenue = invoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const dso = totalRevenue > 0 ? Math.round((totalAR / totalRevenue) * 90) : 0;

    // Revenue MTD
    const revenueMTD = invoices
      .filter((i) => new Date(i.invoiceDate) >= monthStart)
      .reduce((s, i) => s + Number(i.totalAmount || 0), 0);

    // Cash collected MTD
    const cashCollectedMTD = paymentsThisMonth.reduce(
      (s, p) => s + Number(p.amount || 0),
      0,
    );

    return {
      data: {
        totalAR,
        totalAP,
        overdueInvoiceCount,
        dso,
        revenueMTD,
        cashCollectedMTD,
      },
    };
  }

  async getRevenueReport(tenantId: string, query: ReportQueryDto) {
    const fromDate = query.fromDate
      ? new Date(query.fromDate)
      : new Date(new Date().getFullYear(), 0, 1);
    const toDate = query.toDate ? new Date(query.toDate) : new Date();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        invoiceDate: { gte: fromDate, lte: toDate },
        ...(query.companyId && { companyId: query.companyId }),
      },
      select: {
        invoiceDate: true,
        totalAmount: true,
        amountPaid: true,
        company: { select: { id: true, name: true } },
      },
    });

    const grouped = this.groupByPeriod(invoices, query.groupBy || ReportGroupBy.MONTH);

    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0);
    const totalOutstanding = totalRevenue - totalCollected;

    return {
      summary: {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        invoiceCount: invoices.length,
      },
      periods: grouped,
      byCompany: this.groupByCompany(invoices),
    };
  }

  async getAgingReport(tenantId: string, query: AgingReportDto) {
    const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: ['SENT', 'OVERDUE', 'PARTIAL'] },
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    }) as InvoiceWithCompany[];

    const buckets = {
      current: { min: 0, max: 30, amount: 0, invoices: [] as any[] },
      '31-60': { min: 31, max: 60, amount: 0, invoices: [] as any[] },
      '61-90': { min: 61, max: 90, amount: 0, invoices: [] as any[] },
      '91-120': { min: 91, max: 120, amount: 0, invoices: [] as any[] },
      '120+': { min: 121, max: Infinity, amount: 0, invoices: [] as any[] },
    };

    for (const invoice of invoices) {
      const balance = Number(invoice.totalAmount || 0) - Number(invoice.amountPaid || 0);
      if (balance <= 0) continue;

      const daysOld = Math.floor(
        (asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
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
        companyId: invoice.companyId,
        companyName: invoice.company?.name,
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

    const payments = await this.prisma.paymentMade.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['PENDING', 'SENT'] },
      },
      include: {
        carrier: { select: { id: true, legalName: true } },
      },
    });

    const buckets = {
      current: { amount: 0, items: [] as any[] },
      '31-60': { amount: 0, items: [] as any[] },
      '61-90': { amount: 0, items: [] as any[] },
      '91+': { amount: 0, items: [] as any[] },
    };

    for (const payment of payments) {
      const daysOld = Math.floor(
        (asOfDate.getTime() - payment.paymentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      let bucket: keyof typeof buckets;
      if (daysOld <= 30) bucket = 'current';
      else if (daysOld <= 60) bucket = '31-60';
      else if (daysOld <= 90) bucket = '61-90';
      else bucket = '91+';

      buckets[bucket].amount += Number(payment.amount || 0);
      buckets[bucket].items.push({
        carrierId: payment.carrierId,
        carrierName: payment.carrier?.legalName,
        amount: Number(payment.amount || 0),
        daysOld: Math.max(0, daysOld),
      });
    }

    return {
      asOfDate,
      totalPayables: Object.values(buckets).reduce((sum, b) => sum + b.amount, 0),
      buckets,
    };
  }

  private groupByPeriod(items: any[], groupBy: ReportGroupBy) {
    const groups: Record<string, { period: string; amount: number; count: number }> = {};

    for (const item of items) {
      const date = new Date(item.invoiceDate);
      const periodKey = (() => {
        switch (groupBy) {
          case ReportGroupBy.DAY:
            return date.toISOString().split('T')[0] ?? date.toISOString();
          case ReportGroupBy.WEEK: {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            return weekStart.toISOString().split('T')[0] ?? weekStart.toISOString();
          }
          case ReportGroupBy.MONTH:
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          case ReportGroupBy.QUARTER: {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `${date.getFullYear()}-Q${quarter}`;
          }
          case ReportGroupBy.YEAR:
            return `${date.getFullYear()}`;
          default:
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
      })();

      if (!groups[periodKey]) {
        groups[periodKey] = { period: periodKey, amount: 0, count: 0 };
      }
      groups[periodKey].amount += Number(item.totalAmount || 0);
      groups[periodKey].count += 1;
    }

    return Object.values(groups).sort((a, b) => a.period.localeCompare(b.period));
  }

  private groupByCompany(items: any[]) {
    const groups: Record<
      string,
      { companyId: string; companyName: string; amount: number; count: number }
    > = {};

    for (const item of items) {
      const companyId = item.company?.id || 'unknown';
      if (!groups[companyId]) {
        groups[companyId] = {
          companyId,
          companyName: item.company?.name || 'Unknown',
          amount: 0,
          count: 0,
        };
      }
      groups[companyId].amount += Number(item.totalAmount || 0);
      groups[companyId].count += 1;
    }

    return Object.values(groups).sort((a, b) => b.amount - a.amount);
  }
}
