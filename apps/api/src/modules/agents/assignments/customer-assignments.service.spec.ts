import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignmentStatus } from '@prisma/client';
import { CustomerAssignmentsService } from './customer-assignments.service';
import { PrismaService } from '../../../prisma.service';

describe('CustomerAssignmentsService', () => {
  let service: CustomerAssignmentsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      agent: { findFirst: jest.fn() },
      company: { findFirst: jest.fn() },
      agentCustomerAssignment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerAssignmentsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(CustomerAssignmentsService);
  });

  it('lists by agent', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.agentCustomerAssignment.findMany.mockResolvedValue([]);

    const result = await service.listByAgent('t1', 'a1');

    expect(result).toEqual([]);
  });

  it('assigns customer and emits event', async () => {
    prisma.agent.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.agentCustomerAssignment.create.mockResolvedValue({ id: 'as1' });

    await service.assign('t1', 'u1', 'a1', { customerId: 'c1', assignmentType: 'PRIMARY' } as any);

    expect(events.emit).toHaveBeenCalledWith('agent.customer.assigned', expect.any(Object));
  });

  it('transfers assignment and emits event', async () => {
    prisma.agentCustomerAssignment.findFirst.mockResolvedValue({ id: 'as1', agentId: 'a1' });
    prisma.agent.findFirst.mockResolvedValue({ id: 'a2' });
    prisma.agentCustomerAssignment.update.mockResolvedValue({ id: 'as1', agentId: 'a1', status: AssignmentStatus.TRANSFERRED });

    const result = await service.transfer('t1', 'as1', { toAgentId: 'a2', reason: 'switch' } as any);

    expect(result.status).toBe(AssignmentStatus.TRANSFERRED);
    expect(events.emit).toHaveBeenCalledWith('agent.customer.transferred', expect.any(Object));
  });

  it('starts sunset and emits event', async () => {
    prisma.agentCustomerAssignment.findFirst.mockResolvedValue({ id: 'as1' });
    prisma.agentCustomerAssignment.update.mockResolvedValue({ id: 'as1', status: AssignmentStatus.SUNSET });

    const result = await service.startSunset('t1', 'as1', {} as any);

    expect(result.status).toBe(AssignmentStatus.SUNSET);
    expect(events.emit).toHaveBeenCalledWith('agent.customer.sunset.started', expect.any(Object));
  });

  it('throws when assignment missing', async () => {
    prisma.agentCustomerAssignment.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'as1')).rejects.toThrow(NotFoundException);
  });
});
