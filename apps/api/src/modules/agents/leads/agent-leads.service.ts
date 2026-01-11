import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignmentStatus, AssignmentType, LeadStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  ConvertLeadDto,
  LeadQueryDto,
  QualifyLeadDto,
  RejectLeadDto,
  SubmitLeadDto,
  UpdateAgentLeadDto,
} from './dto';

@Injectable()
export class AgentLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listByAgent(tenantId: string, agentId: string, query: LeadQueryDto) {
    await this.requireAgent(tenantId, agentId);
    return this.findMany(tenantId, { ...query, agentId });
  }

  async listAll(tenantId: string, query: LeadQueryDto) {
    return this.findMany(tenantId, query);
  }

  async submit(tenantId: string, agentId: string, dto: SubmitLeadDto) {
    await this.requireAgent(tenantId, agentId);
    const leadNumber = await this.generateLeadNumber(tenantId);

    const created = await this.prisma.agentLead.create({
      data: {
        tenantId,
        agentId,
        leadNumber,
        companyName: dto.companyName,
        contactFirstName: dto.contactFirstName,
        contactLastName: dto.contactLastName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        industry: dto.industry,
        estimatedMonthlyVolume: dto.estimatedMonthlyVolume,
        notes: dto.notes,
        status: LeadStatus.SUBMITTED,
      },
    });

    this.eventEmitter.emit('agent.lead.submitted', {
      leadId: created.id,
      agentId,
      tenantId,
    });

    return created;
  }

  async findOne(tenantId: string, id: string) {
    return this.requireLead(tenantId, id);
  }

  async update(tenantId: string, id: string, dto: UpdateAgentLeadDto) {
    await this.requireLead(tenantId, id);

    return this.prisma.agentLead.update({
      where: { id },
      data: dto,
    });
  }

  async qualify(tenantId: string, userId: string, id: string, dto: QualifyLeadDto) {
    await this.requireLead(tenantId, id);

    return this.prisma.agentLead.update({
      where: { id },
      data: {
        status: LeadStatus.QUALIFIED,
        qualifiedAt: new Date(),
        qualifiedBy: userId,
        assignedTo: dto.assignedTo,
      },
    });
  }

  async convert(tenantId: string, userId: string, id: string, dto: ConvertLeadDto) {
    const lead = await this.requireLead(tenantId, id);
    await this.requireCustomer(tenantId, dto.customerId);

    const updated = await this.prisma.agentLead.update({
      where: { id },
      data: {
        status: LeadStatus.CONVERTED,
        convertedAt: new Date(),
        convertedCustomerId: dto.customerId,
        notes: dto.notes,
      },
    });

    const existingAssignment = await this.prisma.agentCustomerAssignment.findFirst({
      where: { tenantId, agentId: lead.agentId, customerId: dto.customerId },
    });

    if (!existingAssignment) {
      await this.prisma.agentCustomerAssignment.create({
        data: {
          tenantId,
          agentId: lead.agentId,
          customerId: dto.customerId,
          assignmentType: AssignmentType.PRIMARY,
          protectionStart: new Date(),
          protectionEnd: this.addMonths(new Date(), 12),
          isProtected: true,
          status: AssignmentStatus.ACTIVE,
          createdById: userId,
        },
      });
    }

    this.eventEmitter.emit('agent.lead.converted', {
      leadId: id,
      customerId: dto.customerId,
      tenantId,
    });

    this.eventEmitter.emit('agent.customer.assigned', {
      agentId: lead.agentId,
      customerId: dto.customerId,
      tenantId,
    });

    return updated;
  }

  async reject(tenantId: string, id: string, dto: RejectLeadDto) {
    await this.requireLead(tenantId, id);

    return this.prisma.agentLead.update({
      where: { id },
      data: {
        status: LeadStatus.REJECTED,
        rejectionReason: dto.reason,
      },
    });
  }

  private async findMany(tenantId: string, query: LeadQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentLeadWhereInput = {
      tenantId,
      status: query.status,
      agentId: query.agentId,
    };

    const [data, total] = await Promise.all([
      this.prisma.agentLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.agentLead.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async requireLead(tenantId: string, id: string) {
    const lead = await this.prisma.agentLead.findFirst({ where: { id, tenantId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  private async requireAgent(tenantId: string, id: string) {
    const agent = await this.prisma.agent.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  private async requireCustomer(tenantId: string, id: string) {
    const customer = await this.prisma.company.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  private async generateLeadNumber(tenantId: string) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.agentLead.count({ where: { tenantId } });
    const next = String(count + 1).padStart(4, '0');
    return `AL-${now.getFullYear()}${month}-${next}`;
  }

  private addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}
