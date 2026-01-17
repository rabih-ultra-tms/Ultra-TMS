import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgreementStatus } from '@prisma/client';
import { AgentAgreementsService } from './agent-agreements.service';
import { PrismaService } from '../../../prisma.service';

describe('AgentAgreementsService', () => {
  let service: AgentAgreementsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      agent: { findFirst: jest.fn() },
      agentAgreement: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentAgreementsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(AgentAgreementsService);
  });

  it('lists by agent', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentAgreement.findMany.mockResolvedValue([]);

    const result = await service.listByAgent('t1', 'a1');

    expect(result).toEqual([]);
  });

  it('creates agreement and emits event', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentAgreement.count.mockResolvedValue(0);
    prisma.agentAgreement.create.mockResolvedValue({ id: 'ag1' });

    const result = await service.create('t1', 'a1', {
      effectiveDate: '2025-01-01',
      splitType: 'PERCENT',
      splitRate: 0.1,
    } as any);

    expect(result.id).toBe('ag1');
    expect(events.emit).toHaveBeenCalledWith('agent.agreement.created', expect.any(Object));
  });

  it('throws when agreement missing', async () => {
    prisma.agentAgreement.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'ag1')).rejects.toThrow(NotFoundException);
  });

  it('activates agreement', async () => {
    prisma.agentAgreement.findFirst.mockResolvedValue({ id: 'ag1' });
    prisma.agentAgreement.update.mockResolvedValue({ id: 'ag1', status: AgreementStatus.ACTIVE });

    const result = await service.activate('t1', 'ag1');

    expect(result.status).toBe(AgreementStatus.ACTIVE);
  });
});
