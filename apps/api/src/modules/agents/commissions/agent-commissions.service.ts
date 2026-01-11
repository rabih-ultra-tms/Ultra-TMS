import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CommissionQueryDto } from './dto';

@Injectable()
export class AgentCommissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForAgent(tenantId: string, agentId: string, query: CommissionQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      agentId,
      status: query.status,
    } as const;

    const [data, total] = await Promise.all([
      this.prisma.agentCommission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentCommission.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async performance(tenantId: string, agentId: string) {
    const aggregates = await this.prisma.agentCommission.aggregate({
      where: { tenantId, agentId },
      _sum: { grossCommission: true, netCommission: true, adjustments: true },
      _count: { _all: true },
    });

    return {
      totalGross: aggregates._sum.grossCommission ?? 0,
      totalNet: aggregates._sum.netCommission ?? 0,
      totalAdjustments: aggregates._sum.adjustments ?? 0,
      commissionCount: aggregates._count._all,
    };
  }

  async rankings(tenantId: string) {
    const rankings = await this.prisma.agentCommission.groupBy({
      by: ['agentId'],
      where: { tenantId },
      _sum: { netCommission: true },
      orderBy: { _sum: { netCommission: 'desc' } },
      take: 10,
    });

    const agentIds = rankings.map((r) => r.agentId);
    const agents = await this.prisma.agent.findMany({ where: { id: { in: agentIds } } });

    return rankings.map((row) => ({
      agentId: row.agentId,
      netCommission: row._sum.netCommission ?? 0,
      agent: agents.find((a) => a.id === row.agentId),
    }));
  }
}
