import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AgentCommissionStatus, AgentPayoutStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { GenerateStatementDto, StatementQueryDto } from './dto';

@Injectable()
export class AgentStatementsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForAgent(tenantId: string, agentId: string, query: StatementQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { tenantId, agentId, status: query.status } as const;

    const [data, total] = await Promise.all([
      this.prisma.agentPayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { periodStart: 'desc' },
      }),
      this.prisma.agentPayout.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, agentId: string, statementId: string) {
    await this.requireAgent(tenantId, agentId);
    const statement = await this.prisma.agentPayout.findFirst({
      where: { id: statementId, tenantId, agentId },
      include: { commissions: true },
    });

    if (!statement) {
      throw new NotFoundException('Agent statement not found');
    }

    return statement;
  }

  async generate(
    tenantId: string,
    agentId: string,
    dto: GenerateStatementDto,
  ) {
    await this.requireAgent(tenantId, agentId);
    const { periodStart, periodEnd } = this.resolvePeriod(dto);

    const commissions = await this.prisma.agentCommission.findMany({
      where: {
        tenantId,
        agentId,
        payoutId: null,
        status: { in: [AgentCommissionStatus.CALCULATED, AgentCommissionStatus.APPROVED] },
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    if (!commissions.length) {
      throw new BadRequestException('No commissions available for statement');
    }

    const totals = commissions.reduce(
      (acc, item) => {
        const gross = Number(item.grossCommission ?? 0);
        const adjustments = Number(item.adjustments ?? 0);
        const net = item.netCommission
          ? Number(item.netCommission)
          : gross + adjustments;

        acc.gross += gross;
        acc.adjustments += adjustments;
        acc.net += net;
        return acc;
      },
      { gross: 0, adjustments: 0, net: 0 },
    );

    const payoutNumber = await this.generatePayoutNumber(tenantId);

    const payout = await this.prisma.agentPayout.create({
      data: {
        tenantId,
        agentId,
        payoutNumber,
        periodStart,
        periodEnd,
        grossCommissions: new Prisma.Decimal(totals.gross),
        adjustments: new Prisma.Decimal(totals.adjustments),
        netAmount: new Prisma.Decimal(totals.net),
        status: AgentPayoutStatus.PENDING,
        statementDocumentId: `/statements/agents/${agentId}/${payoutNumber}.pdf`,
      },
    });

    await this.prisma.agentCommission.updateMany({
      where: { id: { in: commissions.map((c) => c.id) } },
      data: {
        payoutId: payout.id,
        status: AgentCommissionStatus.PAID,
        paidAt: new Date(),
      },
    });

    return payout;
  }

  async generatePdf(tenantId: string, agentId: string, statementId: string) {
    const statement = await this.findOne(tenantId, agentId, statementId);
    const commissions = await this.prisma.agentCommission.findMany({
      where: { tenantId, payoutId: statementId },
      orderBy: { createdAt: 'asc' },
    });

    const summary = `Agent Statement\n\nPayout: ${statement.payoutNumber}\nStatus: ${statement.status}\nPeriod: ${statement.periodStart.toISOString().slice(0, 10)} to ${statement.periodEnd.toISOString().slice(0, 10)}\nGross: ${statement.grossCommissions}\nAdjustments: ${statement.adjustments ?? 0}\nNet: ${statement.netAmount}`;

    const lines = commissions
      .map(
        (c) =>
          `${c.createdAt.toISOString().slice(0, 10)} | ${c.splitType} | Gross ${c.grossCommission ?? 0} | Net ${c.netCommission ?? 0}`,
      )
      .join('\n');

    const pdfContent = `${summary}\n\nCommissions:\n${lines || 'No commission lines found.'}\n\nGenerated at ${new Date().toISOString()}`;
    return Buffer.from(pdfContent, 'utf-8');
  }

  private async requireAgent(tenantId: string, id: string) {
    const agent = await this.prisma.agent.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  private resolvePeriod(dto: GenerateStatementDto) {
    if (dto.periodStart && dto.periodEnd) {
      return { periodStart: new Date(dto.periodStart), periodEnd: new Date(dto.periodEnd) };
    }

    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    return { periodStart: start, periodEnd: end };
  }

  private async generatePayoutNumber(tenantId: string) {
    const count = await this.prisma.agentPayout.count({ where: { tenantId } });
    return `AP-${String(count + 1).padStart(5, '0')}`;
  }
}
