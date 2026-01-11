import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Agent, AgentContact, AgentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  AgentContactDto,
  AgentQueryDto,
  AgentStatusDto,
  CreateAgentDto,
  UpdateAgentContactDto,
  UpdateAgentDto,
} from './dto';

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: AgentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentWhereInput = {
      tenantId,
      deletedAt: null,
      status: query.status,
      agentType: query.agentType,
      tier: query.tier,
      ...(query.search
        ? {
            OR: [
              { companyName: { contains: query.search, mode: 'insensitive' } },
              { contactEmail: { contains: query.search, mode: 'insensitive' } },
              { contactLastName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.requireAgent(tenantId, id);
  }

  async create(tenantId: string, userId: string, dto: CreateAgentDto) {
    const agentCode = await this.generateAgentCode(tenantId);

    const created = await this.prisma.agent.create({
      data: {
        tenantId,
        agentCode,
        companyName: dto.companyName,
        dbaName: dto.dbaName,
        legalEntityType: dto.legalEntityType,
        taxId: dto.taxId,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        country: dto.country,
        contactFirstName: dto.contactFirstName,
        contactLastName: dto.contactLastName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        agentType: dto.agentType,
        tier: dto.tier,
        territories: dto.territories ? JSON.parse(JSON.stringify(dto.territories)) : [],
        industryFocus: dto.industryFocus ?? [],
        createdById: userId,
        applicationDate: new Date(),
      },
    });

    this.eventEmitter.emit('agent.created', {
      agentId: created.id,
      agentCode,
      tenantId,
    });

    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateAgentDto) {
    await this.requireAgent(tenantId, id);

    return this.prisma.agent.update({
      where: { id },
      data: {
        ...dto,
        territories: dto.territories
          ? JSON.parse(JSON.stringify(dto.territories))
          : undefined,
        industryFocus: dto.industryFocus ?? undefined,
        status: dto.status,
        backgroundCheckStatus: dto.backgroundCheckStatus,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.requireAgent(tenantId, id);

    return this.prisma.agent.update({
      where: { id },
      data: { deletedAt: new Date(), status: AgentStatus.TERMINATED },
    });
  }

  async activate(tenantId: string, id: string, userId: string) {
    await this.requireAgent(tenantId, id);

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.ACTIVE, activatedAt: new Date(), activatedBy: userId },
    });

    this.eventEmitter.emit('agent.activated', { agentId: id, tenantId });
    return updated;
  }

  async suspend(tenantId: string, id: string, dto: AgentStatusDto) {
    await this.requireAgent(tenantId, id);

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { status: AgentStatus.SUSPENDED },
    });

    this.eventEmitter.emit('agent.suspended', {
      agentId: id,
      tenantId,
      reason: dto.reason,
    });

    return updated;
  }

  async terminate(tenantId: string, id: string, userId: string, dto: AgentStatusDto) {
    await this.requireAgent(tenantId, id);

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        status: AgentStatus.TERMINATED,
        terminatedAt: new Date(),
        terminatedBy: userId,
        terminationReason: dto.reason,
      },
    });

    this.eventEmitter.emit('agent.terminated', {
      agentId: id,
      tenantId,
      reason: dto.reason,
    });

    return updated;
  }

  async listContacts(tenantId: string, agentId: string) {
    await this.requireAgent(tenantId, agentId);
    return this.prisma.agentContact.findMany({
      where: { tenantId, agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addContact(tenantId: string, agentId: string, dto: AgentContactDto) {
    await this.requireAgent(tenantId, agentId);

    return this.prisma.agentContact.create({
      data: {
        tenantId,
        agentId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        role: dto.role,
        isPrimary: dto.isPrimary ?? false,
        hasPortalAccess: dto.hasPortalAccess ?? false,
      },
    });
  }

  async updateContact(
    tenantId: string,
    agentId: string,
    contactId: string,
    dto: UpdateAgentContactDto,
  ) {
    await this.requireAgent(tenantId, agentId);
    await this.requireContact(tenantId, contactId);

    return this.prisma.agentContact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async deleteContact(tenantId: string, agentId: string, contactId: string) {
    await this.requireAgent(tenantId, agentId);
    await this.requireContact(tenantId, contactId);

    return this.prisma.agentContact.update({
      where: { id: contactId },
      data: { isActive: false },
    });
  }

  private async requireAgent(tenantId: string, id: string): Promise<Agent> {
    const agent = await this.prisma.agent.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  private async requireContact(tenantId: string, contactId: string): Promise<AgentContact> {
    const contact = await this.prisma.agentContact.findFirst({ where: { id: contactId, tenantId } });
    if (!contact) {
      throw new NotFoundException('Agent contact not found');
    }
    return contact;
  }

  private async generateAgentCode(tenantId: string) {
    const count = await this.prisma.agent.count({ where: { tenantId } });
    const next = String(count + 1).padStart(4, '0');
    return `A-${next}`;
  }
}
