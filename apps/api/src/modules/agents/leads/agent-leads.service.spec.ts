import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadStatus } from '@prisma/client';
import { AgentLeadsService } from './agent-leads.service';
import { PrismaService } from '../../../prisma.service';

describe('AgentLeadsService', () => {
  let service: AgentLeadsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      agent: { findFirst: jest.fn() },
      company: { findFirst: jest.fn() },
      agentLead: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      agentCustomerAssignment: { findFirst: jest.fn(), create: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentLeadsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(AgentLeadsService);
  });

  it('submits lead and emits event', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentLead.count.mockResolvedValue(0);
    prisma.agentLead.create.mockResolvedValue({ id: 'l1' });

    const result = await service.submit('t1', 'a1', { companyName: 'ACME' } as any);

    expect(result.id).toBe('l1');
    expect(events.emit).toHaveBeenCalledWith('agent.lead.submitted', expect.any(Object));
  });

  it('throws when lead missing', async () => {
    prisma.agentLead.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('converts lead and assigns customer', async () => {
    prisma.agentLead.findFirst.mockResolvedValue({ id: 'l1', agentId: 'a1' });
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.agentLead.update.mockResolvedValue({ id: 'l1', status: LeadStatus.CONVERTED });
    prisma.agentCustomerAssignment.findFirst.mockResolvedValue(null);
    prisma.agentCustomerAssignment.create.mockResolvedValue({ id: 'as1' });

    const result = await service.convert('t1', 'u1', 'l1', { customerId: 'c1' } as any);

    expect(result.status).toBe(LeadStatus.CONVERTED);
    expect(events.emit).toHaveBeenCalledWith('agent.lead.converted', expect.any(Object));
    expect(events.emit).toHaveBeenCalledWith('agent.customer.assigned', expect.any(Object));
  });

  it('rejects lead', async () => {
    prisma.agentLead.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.agentLead.update.mockResolvedValue({ id: 'l1', status: LeadStatus.REJECTED });

    const result = await service.reject('t1', 'l1', { reason: 'bad' } as any);

    expect(result.status).toBe(LeadStatus.REJECTED);
  });
});
