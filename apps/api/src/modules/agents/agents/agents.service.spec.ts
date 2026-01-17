import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentsService } from './agents.service';
import { PrismaService } from '../../../prisma.service';

describe('AgentsService', () => {
  let service: AgentsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      agent: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      agentContact: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(AgentsService);
  });

  it('returns paged agents', async () => {
    prisma.agent.findMany.mockResolvedValue([]);
    prisma.agent.count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', {} as any);

    expect(result.total).toBe(0);
    expect(prisma.agent.findMany).toHaveBeenCalled();
  });

  it('creates agent with generated code', async () => {
    prisma.agent.count.mockResolvedValue(0);
    prisma.agent.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'user-1', { companyName: 'AgentCo' } as any);

    expect(prisma.agent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ agentCode: 'A-0001' }) }),
    );
    expect(events.emit).toHaveBeenCalledWith('agent.created', expect.objectContaining({ agentId: 'a1' }));
  });

  it('throws when agent missing', async () => {
    prisma.agent.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('activates agent and emits event', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agent.update.mockResolvedValue({ id: 'a1' });

    await service.activate('tenant-1', 'a1', 'user-1');

    expect(events.emit).toHaveBeenCalledWith('agent.activated', { agentId: 'a1', tenantId: 'tenant-1' });
  });

  it('adds and updates contact', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentContact.create.mockResolvedValue({ id: 'c1' });
    prisma.agentContact.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.agentContact.update.mockResolvedValue({ id: 'c1' });

    await service.addContact('tenant-1', 'a1', { firstName: 'A' } as any);
    await service.updateContact('tenant-1', 'a1', 'c1', { lastName: 'B' } as any);

    expect(prisma.agentContact.update).toHaveBeenCalled();
  });

  it('deactivates contact on delete', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentContact.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.agentContact.update.mockResolvedValue({ id: 'c1' });

    await service.deleteContact('tenant-1', 'a1', 'c1');

    expect(prisma.agentContact.update).toHaveBeenCalledWith(expect.objectContaining({ data: { isActive: false } }));
  });
});
