import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class PortalInvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, companyId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, companyId },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async detail(tenantId: string, companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId, companyId },
      include: { lineItems: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async aging(tenantId: string, companyId: string) {
    const invoices = await this.prisma.invoice.findMany({ where: { tenantId, companyId } });
    const buckets: Record<string, number> = { CURRENT: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

    const now = new Date();
    for (const inv of invoices) {
      if (!inv.dueDate) continue;
      const days = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const balance = Number(inv.balanceDue ?? 0);
      if (days <= 0) buckets['CURRENT'] = (buckets['CURRENT'] ?? 0) + balance;
      else if (days <= 30) buckets['1-30'] = (buckets['1-30'] ?? 0) + balance;
      else if (days <= 60) buckets['31-60'] = (buckets['31-60'] ?? 0) + balance;
      else if (days <= 90) buckets['61-90'] = (buckets['61-90'] ?? 0) + balance;
      else buckets['90+'] = (buckets['90+'] ?? 0) + balance;
    }

    return buckets;
  }

  statement(tenantId: string, companyId: string, month: string) {
    return {
      month,
      tenantId,
      companyId,
      downloadUrl: `/statements/${tenantId}/${companyId}/${month}.pdf`,
    };
  }
}