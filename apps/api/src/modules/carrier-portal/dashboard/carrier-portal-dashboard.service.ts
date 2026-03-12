import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CarrierPortalDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(tenantId: string, carrierId: string, userId: string) {
    const [activeLoads, invoices, settlements, notifications] = await Promise.all([
      this.prisma.load.count({ where: { tenantId, carrierId, status: { notIn: ['DELIVERED', 'COMPLETED'] }, deletedAt: null } }),
      this.prisma.carrierInvoiceSubmission.count({ where: { tenantId, carrierId, deletedAt: null } }),
      this.prisma.settlement.count({ where: { tenantId, carrierId, deletedAt: null } }),
      this.prisma.carrierPortalNotification.findMany({
        where: { tenantId, carrierPortalUserId: userId, isRead: false, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      activeLoads,
      invoices,
      settlements,
      notifications,
    };
  }

  async activeLoads(tenantId: string, carrierId: string) {
    return this.prisma.load.findMany({
      where: { tenantId, carrierId, status: { notIn: ['DELIVERED', 'COMPLETED'] }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async paymentSummary(tenantId: string, carrierId: string) {
    const settlements = await this.prisma.settlement.findMany({ where: { tenantId, carrierId, deletedAt: null } });
    const totalPaid = settlements.reduce((sum, s) => sum + Number(s.amountPaid), 0);
    const balance = settlements.reduce((sum, s) => sum + Number(s.balanceDue), 0);
    return { totalPaid, balance, settlements: settlements.length };
  }

  async compliance(tenantId: string, carrierId: string) {
    const documents = await this.prisma.carrierPortalDocument.findMany({ where: { tenantId, carrierId, deletedAt: null } });
    const approved = documents.filter((d) => d.status === 'APPROVED').length;
    const pending = documents.filter((d) => d.status !== 'APPROVED').length;
    return { total: documents.length, approved, pending };
  }

  async alerts(tenantId: string, carrierId: string) {
    const expiring = await this.prisma.carrierPortalDocument.count({
      where: { tenantId, carrierId, documentType: { in: ['INSURANCE', 'OTHER'] as any }, deletedAt: null },
    });
    const overdueSettlements = await this.prisma.settlement.count({ where: { tenantId, carrierId, status: { not: 'PAID' }, deletedAt: null } });
    return [
      { type: 'COMPLIANCE', message: `${expiring} documents require attention`, count: expiring },
      { type: 'PAYMENT', message: `${overdueSettlements} settlements unpaid`, count: overdueSettlements },
    ];
  }
}