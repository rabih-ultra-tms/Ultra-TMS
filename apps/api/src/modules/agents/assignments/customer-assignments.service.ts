import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import {
  AssignCustomerDto,
  StartSunsetDto,
  TerminateAssignmentDto,
  TransferAssignmentDto,
  UpdateCustomerAssignmentDto,
} from './dto';

@Injectable()
export class CustomerAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listByAgent(tenantId: string, agentId: string) {
    await this.requireAgent(tenantId, agentId);
    return this.prisma.agentCustomerAssignment.findMany({
      where: { tenantId, agentId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.requireAssignment(tenantId, id);
  }

  async assign(tenantId: string, userId: string, agentId: string, dto: AssignCustomerDto) {
    await this.requireAgent(tenantId, agentId);
    await this.requireCustomer(tenantId, dto.customerId);

    const protectionStart = new Date();
    const protectionEnd = dto.protectionEnd ? new Date(dto.protectionEnd) : this.addMonths(protectionStart, 12);

    const created = await this.prisma.agentCustomerAssignment.create({
      data: {
        tenantId,
        agentId,
        customerId: dto.customerId,
        assignmentType: dto.assignmentType,
        protectionStart,
        protectionEnd,
        isProtected: true,
        splitPercent: dto.splitPercent,
        source: dto.source,
        status: AssignmentStatus.ACTIVE,
        createdById: userId,
      },
      include: { customer: true },
    });

    this.eventEmitter.emit('agent.customer.assigned', {
      assignmentId: created.id,
      agentId,
      customerId: dto.customerId,
      tenantId,
    });

    return created;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerAssignmentDto) {
    await this.requireAssignment(tenantId, id);

    return this.prisma.agentCustomerAssignment.update({
      where: { id },
      data: {
        assignmentType: dto.assignmentType,
        status: dto.status,
        protectionEnd: dto.protectionEnd ? new Date(dto.protectionEnd) : undefined,
        splitPercent: dto.splitPercent,
        isProtected: dto.isProtected,
        overrideReason: dto.overrideReason,
        overrideSplitRate: dto.overrideSplitRate,
      },
    });
  }

  async transfer(tenantId: string, id: string, dto: TransferAssignmentDto) {
    await this.requireAssignment(tenantId, id);
    await this.requireAgent(tenantId, dto.toAgentId);

    const updated = await this.prisma.agentCustomerAssignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.TRANSFERRED,
        transferredToAgentId: dto.toAgentId,
        terminatedAt: new Date(),
        terminatedReason: dto.reason,
      },
    });

    this.eventEmitter.emit('agent.customer.transferred', {
      assignmentId: id,
      fromAgentId: updated.agentId,
      toAgentId: dto.toAgentId,
      tenantId,
    });

    return updated;
  }

  async startSunset(tenantId: string, id: string, dto: StartSunsetDto) {
    await this.requireAssignment(tenantId, id);
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();

    const updated = await this.prisma.agentCustomerAssignment.update({
      where: { id },
      data: {
        inSunset: true,
        sunsetStartDate: startDate,
        status: AssignmentStatus.SUNSET,
      },
    });

    this.eventEmitter.emit('agent.customer.sunset.started', {
      assignmentId: id,
      sunsetStartDate: startDate,
      tenantId,
    });

    return updated;
  }

  async terminate(tenantId: string, id: string, dto: TerminateAssignmentDto) {
    await this.requireAssignment(tenantId, id);

    const updated = await this.prisma.agentCustomerAssignment.update({
      where: { id },
      data: {
        status: AssignmentStatus.TERMINATED,
        terminatedAt: new Date(),
        terminatedReason: dto.reason,
      },
    });

    return updated;
  }

  async getAgentForCustomer(tenantId: string, customerId: string) {
    await this.requireCustomer(tenantId, customerId);

    return this.prisma.agentCustomerAssignment.findFirst({
      where: { tenantId, customerId, status: { in: [AssignmentStatus.ACTIVE, AssignmentStatus.SUNSET] } },
      orderBy: { createdAt: 'desc' },
    });
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

  private async requireAssignment(tenantId: string, id: string) {
    const assignment = await this.prisma.agentCustomerAssignment.findFirst({ where: { id, tenantId } });
    if (!assignment) {
      throw new NotFoundException('Customer assignment not found');
    }
    return assignment;
  }

  private addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}
