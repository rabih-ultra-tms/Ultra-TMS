import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractStatus } from '@prisma/client';
import { DocuSignService } from '../integrations/docusign.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService, private readonly docusign: DocuSignService, private readonly eventEmitter: EventEmitter2) {}

  private generateContractNumber(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `C-${year}${month}${day}-${rand}`;
  }

  async list(tenantId: string) {
    return this.prisma.contract.findMany({ where: { tenantId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async create(tenantId: string, userId: string, dto: CreateContractDto) {
    const now = new Date();
    const contract = await this.prisma.contract.create({
      data: {
        tenantId,
        contractNumber: this.generateContractNumber(now),
        name: dto.name,
        description: dto.description,
        contractType: dto.contractType,
        customerId: dto.customerId ?? null,
        carrierId: dto.carrierId ?? null,
        agentId: dto.agentId ?? null,
        effectiveDate: new Date(dto.effectiveDate),
        expirationDate: new Date(dto.expirationDate),
        autoRenew: dto.autoRenew ?? false,
        renewalTermDays: dto.renewalTermDays ?? null,
        noticeDays: dto.noticeDays ?? null,
        status: ContractStatus.DRAFT,
        createdById: userId,
        documentId: null,
        customFields: {},
      },
    });
    this.emit('contract.created', { contractId: contract.id, tenantId });
    return contract;
  }

  async detail(tenantId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async update(tenantId: string, id: string, dto: UpdateContractDto) {
    await this.ensureExists(tenantId, id);
    return this.prisma.contract.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        contractType: dto.contractType,
        customerId: dto.customerId,
        carrierId: dto.carrierId,
        agentId: dto.agentId,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        autoRenew: dto.autoRenew,
        renewalTermDays: dto.renewalTermDays,
        noticeDays: dto.noticeDays,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    const contract = await this.ensureExists(tenantId, id);
    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Only draft contracts can be deleted');
    }
    await this.prisma.contract.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async submit(tenantId: string, id: string, userId: string) {
    await this.ensureExists(tenantId, id);
    const contract = await this.prisma.contract.update({ where: { id }, data: { status: ContractStatus.PENDING_APPROVAL, updatedById: userId } });
    this.emit('contract.submitted', { contractId: contract.id, tenantId });
    return contract;
  }

  async approve(tenantId: string, id: string, userId: string) {
    await this.ensureExists(tenantId, id);
    const contract = await this.prisma.contract.update({ where: { id }, data: { status: ContractStatus.APPROVED, updatedById: userId } });
    this.emit('contract.approved', { contractId: contract.id, approvedBy: userId, tenantId });
    return contract;
  }

  async reject(tenantId: string, id: string) {
    await this.ensureExists(tenantId, id);
    return this.prisma.contract.update({ where: { id }, data: { status: ContractStatus.DRAFT } });
  }

  async sendForSignature(tenantId: string, id: string) {
    const contract = await this.ensureExists(tenantId, id);
    const envelope = await this.docusign.sendEnvelope(contract.id, contract.name);
    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.SENT_FOR_SIGNATURE,
        esignEnvelopeId: envelope.envelopeId,
        esignProvider: 'DOCUSIGN',
      },
    });
    this.emit('contract.esign.sent', { contractId: updated.id, envelopeId: envelope.envelopeId, tenantId });
    return updated;
  }

  async activate(tenantId: string, id: string) {
    await this.ensureExists(tenantId, id);
    const updated = await this.prisma.contract.update({ where: { id }, data: { status: ContractStatus.ACTIVE, signedAt: new Date() } });
    this.emit('contract.esign.completed', { contractId: updated.id, tenantId });
    this.emit('contract.activated', { contractId: updated.id, tenantId, effectiveDate: updated.effectiveDate });
    return updated;
  }

  async terminate(tenantId: string, id: string, reason: string, userId: string) {
    await this.ensureExists(tenantId, id);
    const updated = await this.prisma.contract.update({
      where: { id },
      data: { status: ContractStatus.TERMINATED, updatedById: userId, customFields: { terminationReason: reason } },
    });
    this.emit('contract.terminated', { contractId: updated.id, tenantId, reason });
    return updated;
  }

  async renew(tenantId: string, id: string, months?: number) {
    const contract = await this.ensureExists(tenantId, id);
    const current = contract.expirationDate ?? new Date();
    const addDays = months ? months * 30 : contract.renewalTermDays ?? 365;
    const newDate = new Date(current);
    newDate.setDate(newDate.getDate() + addDays);
    const updated = await this.prisma.contract.update({ where: { id }, data: { expirationDate: newDate, status: ContractStatus.ACTIVE } });
    this.emit('contract.renewed', { contractId: updated.id, tenantId, newExpirationDate: newDate });
    return updated;
  }

  async history(tenantId: string, id: string) {
    await this.ensureExists(tenantId, id);
    const amendments = await this.prisma.contractAmendment.findMany({ where: { contractId: id, tenantId }, orderBy: { createdAt: 'desc' } });
    return { amendments };
  }

  private emit(event: string, payload: Record<string, unknown>) {
    this.eventEmitter.emit(event, payload);
  }

  private async ensureExists(tenantId: string, id: string) {
    const contract = await this.prisma.contract.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }
}
