import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgreementStatus, AgentAgreement } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateAgentAgreementDto, UpdateAgentAgreementDto } from './dto';

@Injectable()
export class AgentAgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listByAgent(tenantId: string, agentId: string) {
    await this.requireAgent(tenantId, agentId);
    return this.prisma.agentAgreement.findMany({
      where: { tenantId, agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, agentId: string, dto: CreateAgentAgreementDto) {
    await this.requireAgent(tenantId, agentId);
    const agreementNumber = await this.generateAgreementNumber(tenantId);

    const created = await this.prisma.agentAgreement.create({
      data: {
        tenantId,
        agentId,
        agreementNumber,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        splitType: dto.splitType,
        splitRate: dto.splitRate,
        minimumPerLoad: dto.minimumPerLoad,
        protectionPeriodMonths: dto.protectionPeriodMonths,
        sunsetEnabled: dto.sunsetEnabled ?? false,
        sunsetPeriodMonths: dto.sunsetPeriodMonths,
        drawAmount: dto.drawAmount,
        paymentDay: dto.paymentDay,
      },
    });

    this.eventEmitter.emit('agent.agreement.created', {
      agreementId: created.id,
      agentId,
      tenantId,
    });

    return created;
  }

  async findOne(tenantId: string, id: string) {
    return this.requireAgreement(tenantId, id);
  }

  async update(tenantId: string, id: string, dto: UpdateAgentAgreementDto) {
    await this.requireAgreement(tenantId, id);

    return this.prisma.agentAgreement.update({
      where: { id },
      data: {
        ...dto,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      },
    });
  }

  async activate(tenantId: string, id: string) {
    await this.requireAgreement(tenantId, id);
    return this.prisma.agentAgreement.update({
      where: { id },
      data: { status: AgreementStatus.ACTIVE },
    });
  }

  async terminate(tenantId: string, id: string) {
    await this.requireAgreement(tenantId, id);
    return this.prisma.agentAgreement.update({
      where: { id },
      data: { status: AgreementStatus.TERMINATED, expirationDate: new Date() },
    });
  }

  private async requireAgreement(tenantId: string, id: string): Promise<AgentAgreement> {
    const agreement = await this.prisma.agentAgreement.findFirst({ where: { id, tenantId } });
    if (!agreement) {
      throw new NotFoundException('Agent agreement not found');
    }
    return agreement;
  }

  private async requireAgent(tenantId: string, id: string) {
    const agent = await this.prisma.agent.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  private async generateAgreementNumber(tenantId: string) {
    const count = await this.prisma.agentAgreement.count({ where: { tenantId } });
    const next = String(count + 1).padStart(4, '0');
    const now = new Date();
    return `AG-${now.getFullYear()}-${next}`;
  }
}
