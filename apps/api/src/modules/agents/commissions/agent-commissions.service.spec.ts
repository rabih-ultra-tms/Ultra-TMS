import { Test, TestingModule } from '@nestjs/testing';
import { AgentCommissionsService } from './agent-commissions.service';
import { PrismaService } from '../../../prisma.service';

describe('AgentCommissionsService', () => {
  let service: AgentCommissionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      agentCommission: {
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
      },
      agent: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentCommissionsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AgentCommissionsService);
  });

  it('lists commissions with pagination', async () => {
    prisma.agentCommission.findMany.mockResolvedValue([]);
    prisma.agentCommission.count.mockResolvedValue(0);

    const result = await service.listForAgent('t1', 'a1', {} as any);

    expect(result.total).toBe(0);
    expect(result.data).toEqual([]);
  });

  it('returns performance totals', async () => {
    prisma.agentCommission.aggregate.mockResolvedValue({
      _sum: { grossCommission: 100, netCommission: 80, adjustments: -20 },
      _count: { _all: 2 },
    });

    const result = await service.performance('t1', 'a1');

    expect(result.totalGross).toBe(100);
    expect(result.commissionCount).toBe(2);
  });

  it('returns rankings with agent info', async () => {
    prisma.agentCommission.groupBy.mockResolvedValue([{ agentId: 'a1', _sum: { netCommission: 50 } }]);
    prisma.agent.findMany.mockResolvedValue([{ id: 'a1', name: 'Agent One' }]);

    const result = await service.rankings('t1');

    expect(result[0].agent?.id).toBe('a1');
  });
});
