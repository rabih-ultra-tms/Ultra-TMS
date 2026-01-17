import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../../prisma.service';
import { TicketNumberService } from './ticket-number.service';
import { AssignmentService } from '../teams/assignment.service';
import { SlaService } from '../sla/sla.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: {
    supportTicket: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    ticketReply: { create: jest.Mock };
  };
  let numbers: { generate: jest.Mock };
  let assignment: { autoAssign: jest.Mock };
  let sla: { applyPolicy: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      supportTicket: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      ticketReply: { create: jest.fn() },
    };
    numbers = { generate: jest.fn() };
    assignment = { autoAssign: jest.fn() };
    sla = { applyPolicy: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TicketNumberService, useValue: numbers },
        { provide: AssignmentService, useValue: assignment },
        { provide: SlaService, useValue: sla },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(TicketsService);
  });

  it('lists tickets by tenant', async () => {
    prisma.supportTicket.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.supportTicket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('throws when ticket not found', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('creates ticket and applies SLA', async () => {
    numbers.generate.mockResolvedValue('TKT-1');
    prisma.supportTicket.create.mockResolvedValue({ id: 't1', teamId: null, assignedToId: null });
    sla.applyPolicy.mockResolvedValue({ firstResponseDue: new Date(), resolutionDue: new Date() });
    prisma.supportTicket.update.mockResolvedValue({ id: 't1' });
    prisma.supportTicket.findFirst.mockResolvedValue({ id: 't1' });

    await service.create('tenant-1', 'user-1', {
      subject: 'Help',
      description: 'Desc',
      requesterEmail: 'a@example.com',
      source: 'EMAIL',
    } as any);

    expect(prisma.supportTicket.create).toHaveBeenCalled();
    expect(prisma.supportTicket.update).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('ticket.created', { ticketId: 't1' });
  });

  it('adds reply and updates status', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue({ id: 't1', status: 'NEW', requesterName: 'Alex' });
    prisma.ticketReply.create.mockResolvedValue({ id: 'r1' });
    prisma.supportTicket.update.mockResolvedValue({ id: 't1' });

    await service.addReply('tenant-1', 'user-1', 't1', { replyType: 'PUBLIC', body: 'Hi' } as any);

    expect(prisma.ticketReply.create).toHaveBeenCalled();
    expect(prisma.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'OPEN' }) }),
    );
    expect(events.emit).toHaveBeenCalledWith('ticket.replied', { ticketId: 't1', replyId: 'r1' });
  });

  it('assigns ticket and auto-assigns user', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue({ id: 't1', status: 'NEW', teamId: 'team-1', assignedToId: null, updatedById: 'user-1' });
    assignment.autoAssign.mockResolvedValue('user-2');
    prisma.supportTicket.update.mockResolvedValue({ id: 't1' });

    const result = await service.assign('tenant-1', 't1', { assignedTeamId: 'team-1' } as any);

    expect(result).toEqual({ id: 't1' });
    expect(prisma.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ assignedToId: 'user-2', status: 'OPEN' }) }),
    );
  });

  it('closes and reopens ticket', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue({ id: 't1' });
    prisma.supportTicket.update.mockResolvedValue({ id: 't1' });

    await service.close('tenant-1', 't1', 'user-1', { resolutionNotes: 'done' } as any);
    await service.reopen('tenant-1', 't1', 'user-1');

    expect(events.emit).toHaveBeenCalledWith('ticket.closed', { ticketId: 't1' });
    expect(events.emit).toHaveBeenCalledWith('ticket.reopened', { ticketId: 't1' });
  });
});