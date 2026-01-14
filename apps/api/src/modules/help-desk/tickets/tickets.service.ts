import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { TicketNumberService } from './ticket-number.service';
import { AssignmentService } from '../teams/assignment.service';
import { SlaService } from '../sla/sla.service';
import {
  AddReplyDto,
  AssignTicketDto,
  CloseTicketDto,
  CreateTicketDto,
  UpdateTicketDto,
} from '../dto/help-desk.dto';
import { Prisma, ReplyType, TicketPriority, TicketStatus, TicketType } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketNumbers: TicketNumberService,
    private readonly assignment: AssignmentService,
    private readonly sla: SlaService,
    private readonly events: EventEmitter2,
  ) {}

  async list(tenantId: string) {
    return this.prisma.supportTicket.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  private buildCustomFields(dto: CreateTicketDto | UpdateTicketDto, existing?: any) {
    const custom = { ...(existing ?? {}) } as Record<string, unknown>;
    if (dto.category !== undefined) custom.category = dto.category;
    if (dto.subcategory !== undefined) custom.subcategory = dto.subcategory;
    if (dto.relatedType !== undefined) custom.relatedType = dto.relatedType;
    if (dto.relatedId !== undefined) custom.relatedId = dto.relatedId;
    return custom as Prisma.InputJsonValue;
  }

  async create(tenantId: string, userId: string, dto: CreateTicketDto) {
    const ticketNumber = await this.ticketNumbers.generate(tenantId);
    const customFields = this.buildCustomFields(dto);
    const created = await this.prisma.supportTicket.create({
      data: {
        tenantId,
        ticketNumber,
        subject: dto.subject,
        description: dto.description,
        source: dto.source,
        type: dto.type ?? TicketType.QUESTION,
        priority: dto.priority ?? TicketPriority.NORMAL,
        status: TicketStatus.NEW,
        requesterEmail: dto.requesterEmail,
        requesterName: dto.requesterName,
        requesterId: dto.requesterEmail ? undefined : undefined,
        assignedToId: dto.assignedToId,
        teamId: dto.teamId,
        customFields,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.applySla(tenantId, created.id);

    if (!created.assignedToId && created.teamId) {
      await this.assign(tenantId, created.id, { assignedTeamId: created.teamId });
    }

    this.events.emit('ticket.created', { ticketId: created.id });
    return this.findOne(tenantId, created.id);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateTicketDto) {
    const existing = await this.findOne(tenantId, id);
    const customFields = this.buildCustomFields(dto, existing.customFields);
    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        subject: dto.subject ?? existing.subject,
        description: dto.description ?? existing.description,
        source: dto.source ?? existing.source,
        type: dto.type ?? existing.type,
        priority: dto.priority ?? existing.priority,
        status: dto.status ?? existing.status,
        requesterEmail: dto.requesterEmail ?? existing.requesterEmail,
        requesterName: dto.requesterName ?? existing.requesterName,
        assignedToId: dto.assignedToId ?? existing.assignedToId,
        teamId: dto.teamId ?? existing.teamId,
        customFields,
        updatedById: userId,
      },
    });

    await this.applySla(tenantId, id);
    this.events.emit('ticket.updated', { ticketId: id });
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.supportTicket.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  async addReply(tenantId: string, userId: string, ticketId: string, dto: AddReplyDto) {
    const ticket = await this.findOne(tenantId, ticketId);
    const reply = await this.prisma.ticketReply.create({
      data: {
        tenantId,
        ticketId,
        replyType: dto.replyType,
        body: dto.body,
        bodyHtml: dto.bodyHtml,
        authorId: userId,
        authorName: ticket.requesterName ?? undefined,
        attachments: (dto.attachments ?? undefined) as Prisma.InputJsonValue | undefined,
        createdById: userId,
        updatedById: userId,
      },
    });

    const updates: Record<string, unknown> = {};
    if (!ticket.firstRespondedAt && dto.replyType === ReplyType.PUBLIC) {
      updates.firstRespondedAt = new Date();
    }
    if (ticket.status === TicketStatus.NEW) {
      updates.status = TicketStatus.OPEN;
    }
    if (Object.keys(updates).length > 0) {
      await this.prisma.supportTicket.update({ where: { id: ticketId }, data: updates });
    }

    this.events.emit('ticket.replied', { ticketId, replyId: reply.id });
    return reply;
  }

  async assign(tenantId: string, id: string, dto: AssignTicketDto) {
    const ticket = await this.findOne(tenantId, id);
    const teamId = dto.assignedTeamId ?? ticket.teamId;
    let assignedToId = dto.assignedUserId ?? ticket.assignedToId;

    if (!assignedToId && teamId) {
      assignedToId = await this.assignment.autoAssign(tenantId, teamId);
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        assignedToId,
        teamId,
        status: ticket.status === TicketStatus.NEW ? TicketStatus.OPEN : ticket.status,
        updatedById: ticket.updatedById,
      },
    });

    this.events.emit('ticket.assigned', { ticketId: id, assignee: assignedToId ?? teamId });
    return updated;
  }

  async close(tenantId: string, id: string, userId: string, dto: CloseTicketDto) {
    await this.findOne(tenantId, id);
    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: TicketStatus.CLOSED,
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes: dto.resolutionNotes,
        updatedById: userId,
      },
    });
    this.events.emit('ticket.closed', { ticketId: id });
    return updated;
  }

  async reopen(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);
    const updated = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: TicketStatus.OPEN,
        resolvedAt: null,
        resolvedBy: null,
        updatedById: userId,
      },
    });
    this.events.emit('ticket.reopened', { ticketId: id });
    return updated;
  }

  private async applySla(tenantId: string, ticketId: string) {
    const ticket = await this.findOne(tenantId, ticketId);
    const slaDates = await this.sla.applyPolicy(tenantId, ticket);
    if (!slaDates) return ticket;
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        firstResponseDue: slaDates.firstResponseDue,
        resolutionDue: slaDates.resolutionDue,
      },
    });
  }
}
