import { Injectable } from '@nestjs/common';
import { ClaimStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class ClaimsReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async statusSummary(tenantId: string) {
    const groups = await this.prisma.claim.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    });

    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async typeSummary(tenantId: string) {
    const groups = await this.prisma.claim.groupBy({
      by: ['claimType'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    });

    return groups.map((g) => ({ claimType: g.claimType, count: g._count._all }));
  }

  async financials(tenantId: string) {
    const aggregates = await this.prisma.claim.aggregate({
      where: { tenantId, deletedAt: null },
      _sum: {
        claimedAmount: true,
        approvedAmount: true,
        paidAmount: true,
      },
    });

    return {
      claimed: Number(aggregates._sum.claimedAmount ?? 0),
      approved: Number(aggregates._sum.approvedAmount ?? 0),
      paid: Number(aggregates._sum.paidAmount ?? 0),
    };
  }

  async overdue(tenantId: string) {
    const today = new Date();
    const count = await this.prisma.claim.count({
      where: {
        tenantId,
        deletedAt: null,
        dueDate: { lt: today },
        NOT: { status: ClaimStatus.CLOSED },
      },
    });

    return { overdue: count };
  }
}
