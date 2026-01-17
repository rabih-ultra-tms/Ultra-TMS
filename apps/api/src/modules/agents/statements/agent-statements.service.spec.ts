import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AgentPayoutStatus, Prisma } from '@prisma/client';
import { AgentStatementsService } from './agent-statements.service';
import { PrismaService } from '../../../prisma.service';

describe('AgentStatementsService', () => {
  let service: AgentStatementsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      agent: { findFirst: jest.fn() },
      agentPayout: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
      agentCommission: { findMany: jest.fn(), updateMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentStatementsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AgentStatementsService);
  });

  it('lists statements', async () => {
    prisma.agentPayout.findMany.mockResolvedValue([]);
    prisma.agentPayout.count.mockResolvedValue(0);

    const result = await service.listForAgent('t1', 'a1', {} as any);

    expect(result.total).toBe(0);
  });

  it('throws when statement missing', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentPayout.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'a1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('throws when no commissions for generate', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentCommission.findMany.mockResolvedValue([]);

    await expect(
      service.generate('t1', 'a1', { periodStart: '2025-01-01', periodEnd: '2025-01-31' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('generates statement and updates commissions', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentCommission.findMany.mockResolvedValue([
      { id: 'c1', grossCommission: 100, adjustments: -10, netCommission: 90 },
    ]);
    prisma.agentPayout.count = jest.fn().mockResolvedValue(0);
    prisma.agentPayout.create.mockResolvedValue({ id: 'p1', status: AgentPayoutStatus.PENDING });
    prisma.agentCommission.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.generate('t1', 'a1', { periodStart: '2025-01-01', periodEnd: '2025-01-31' } as any);

    expect(result.status).toBe(AgentPayoutStatus.PENDING);
  });

  it('generates pdf buffer', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentPayout.findFirst.mockResolvedValue({
      id: 'p1',
      payoutNumber: 'AP-00001',
      status: AgentPayoutStatus.PENDING,
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      grossCommissions: new Prisma.Decimal(100),
      adjustments: new Prisma.Decimal(0),
      netAmount: new Prisma.Decimal(100),
    });
    prisma.agentCommission.findMany.mockResolvedValue([
      { createdAt: new Date('2025-01-10'), splitType: 'PERCENT', grossCommission: 100, netCommission: 100 },
    ]);

    const result = await service.generatePdf('t1', 'a1', 'p1');

    expect(Buffer.isBuffer(result)).toBe(true);
  });
});
