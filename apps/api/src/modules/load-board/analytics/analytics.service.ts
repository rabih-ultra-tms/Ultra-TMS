import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async postMetrics(tenantId: string) {
    const [total, active, expired, covered] = await Promise.all([
      this.prisma.loadPost.count({ where: { tenantId } }),
      this.prisma.loadPost.count({ where: { tenantId, status: 'POSTED' } }),
      this.prisma.loadPost.count({ where: { tenantId, status: 'EXPIRED' } }),
      this.prisma.loadPost.count({ where: { tenantId, status: 'COVERED' } }),
    ]);

    return { total, active, expired, covered };
  }

  async leadMetrics(tenantId: string) {
    const [total, contacted, accepted, declined] = await Promise.all([
      this.prisma.postLead.count({ where: { tenantId } }),
      this.prisma.postLead.count({ where: { tenantId, status: 'CONTACTED' } }),
      this.prisma.postLead.count({ where: { tenantId, status: 'ACCEPTED' } }),
      this.prisma.postLead.count({ where: { tenantId, status: 'DECLINED' } }),
    ]);

    return { total, contacted, accepted, declined };
  }

  async boardComparison(tenantId: string) {
    const accounts = await this.prisma.loadBoardAccount.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        posts: {
          select: {
            status: true,
            views: true,
            clicks: true,
            leadCount: true,
          },
        },
      },
    });

    return accounts.map((account) => {
      const postCount = account.posts.length;
      const active = account.posts.filter((p) => p.status === 'POSTED').length;
      const views = account.posts.reduce((sum, p) => sum + (p.views || 0), 0);
      const leads = account.posts.reduce((sum, p) => sum + (p.leadCount || 0), 0);
      return {
        accountId: account.id,
        accountName: account.accountName,
        posts: postCount,
        active,
        views,
        leads,
      };
    });
  }
}
