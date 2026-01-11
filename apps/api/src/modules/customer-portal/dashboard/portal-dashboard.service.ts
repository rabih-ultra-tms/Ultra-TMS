import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class PortalDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string, companyId: string, portalUserId: string) {
    const [shipments, quotes, invoices, payments, notifications] = await Promise.all([
      this.prisma.load.count({ where: { tenantId, order: { customerId: companyId } } }),
      this.prisma.quoteRequest.count({ where: { tenantId, companyId } }),
      this.prisma.invoice.findMany({ where: { tenantId, companyId }, take: 5, orderBy: { invoiceDate: 'desc' } }),
      this.prisma.portalPayment.findMany({ where: { tenantId, companyId }, take: 5, orderBy: { createdAt: 'desc' } }),
      this.prisma.portalNotification.findMany({
        where: { tenantId, portalUserId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const outstandingBalance = invoices.reduce((sum, inv) => sum + Number(inv.balanceDue), 0);

    return {
      shipments,
      quotes,
      outstandingBalance,
      recentInvoices: invoices,
      recentPayments: payments,
      notifications,
    };
  }

  async getActiveShipments(tenantId: string, companyId: string) {
    return this.prisma.load.findMany({
      where: { tenantId, status: { notIn: ['DELIVERED', 'COMPLETED'] }, order: { customerId: companyId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getRecentActivity(tenantId: string, companyId: string) {
    return this.prisma.portalActivityLog.findMany({
      where: { tenantId, companyId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getAlerts(tenantId: string, companyId: string) {
    const overdueInvoices = await this.prisma.invoice.count({
      where: { tenantId, companyId, status: { in: ['OVERDUE'] } },
    });

    const delayedShipments = await this.prisma.load.count({
      where: { tenantId, order: { customerId: companyId }, eta: { lt: new Date() }, status: { not: 'DELIVERED' } },
    });

    return [
      { type: 'INVOICE', message: `${overdueInvoices} overdue invoices`, count: overdueInvoices },
      { type: 'SHIPMENT', message: `${delayedShipments} delayed shipments`, count: delayedShipments },
    ];
  }
}