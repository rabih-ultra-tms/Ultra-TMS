import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from '../dto/help-desk.dto';
import { SupportTicket } from '@prisma/client';

@Injectable()
export class SlaService {
  constructor(private readonly prisma: PrismaService) {}

  async listPolicies(tenantId: string) {
    return this.prisma.slaPolicy.findMany({ where: { tenantId, deletedAt: null }, orderBy: { priority: 'desc' } });
  }

  async createPolicy(tenantId: string, userId: string, dto: CreateSlaPolicyDto) {
    return this.prisma.slaPolicy.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        conditions: dto.conditions,
        firstResponseTarget: dto.firstResponseTarget,
        resolutionTarget: dto.resolutionTarget,
        useBusinessHours: dto.useBusinessHours ?? true,
        priority: dto.priority ?? 0,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findPolicy(tenantId: string, id: string) {
    const policy = await this.prisma.slaPolicy.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!policy) throw new NotFoundException('SLA policy not found');
    return policy;
  }

  async updatePolicy(tenantId: string, userId: string, id: string, dto: UpdateSlaPolicyDto) {
    await this.findPolicy(tenantId, id);
    return this.prisma.slaPolicy.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        conditions: dto.conditions,
        firstResponseTarget: dto.firstResponseTarget,
        resolutionTarget: dto.resolutionTarget,
        useBusinessHours: dto.useBusinessHours,
        priority: dto.priority,
        updatedById: userId,
      },
    });
  }

  async deletePolicy(tenantId: string, id: string) {
    await this.findPolicy(tenantId, id);
    await this.prisma.slaPolicy.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  calculateDueAt(base: Date, minutes: number) {
    return new Date(base.getTime() + minutes * 60 * 1000);
  }

  async applyPolicy(
    tenantId: string,
    ticket: Pick<SupportTicket, 'priority' | 'customFields' | 'createdAt'>,
  ): Promise<{ firstResponseDue: Date; resolutionDue: Date } | null> {
    const policies = await this.prisma.slaPolicy.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
    const category = (ticket.customFields as any)?.category;
    const matched = policies.find((p) => {
      const cond = (p.conditions as any) || {};
      if (cond.priority?.length && !cond.priority.includes(ticket.priority)) return false;
      if (cond.category?.length && category && !cond.category.includes(category)) return false;
      return true;
    });
    if (!matched) return null;
    return {
      firstResponseDue: this.calculateDueAt(ticket.createdAt, matched.firstResponseTarget),
      resolutionDue: this.calculateDueAt(ticket.createdAt, matched.resolutionTarget),
    };
  }
}
