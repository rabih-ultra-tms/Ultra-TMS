import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateSlaDto } from './dto/create-sla.dto';
import { UpdateSlaDto } from './dto/update-sla.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SlasService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  list(tenantId: string, contractId: string) {
    return this.prisma.contractSLA.findMany({ where: { tenantId, contractId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, contractId: string, userId: string, dto: CreateSlaDto) {
    return this.prisma.contractSLA.create({
      data: {
        tenantId,
        contractId,
        slaType: dto.slaType,
        targetPercent: dto.targetPercent,
        measurementPeriod: dto.measurementPeriod,
        penaltyAmount: dto.penaltyAmount ?? null,
        penaltyPercent: dto.penaltyPercent ?? null,
        status: dto.status ?? 'ACTIVE',
        createdById: userId,
      },
    });
  }

  async detail(id: string, tenantId: string) {
    const sla = await this.prisma.contractSLA.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!sla) throw new NotFoundException('SLA not found');
    return sla;
  }

  async performance(id: string, tenantId: string, actualValue?: number) {
    const sla = await this.detail(id, tenantId);
    const warningThreshold = Number(sla.targetPercent) * 1.05;
    const actual = typeof actualValue === 'number' ? actualValue : null;
    const delta = actual !== null ? Number(sla.targetPercent) - actual : null;

    if (actual !== null) {
      if (actual < Number(sla.targetPercent)) {
        this.eventEmitter.emit('sla.violation', { slaId: sla.id, contractId: sla.contractId, tenantId, actualValue: actual, target: sla.targetPercent });
      } else if (actual < warningThreshold) {
        this.eventEmitter.emit('sla.warning', { slaId: sla.id, contractId: sla.contractId, tenantId, actualValue: actual, target: sla.targetPercent });
      }
    }

    return {
      slaId: sla.id,
      contractId: sla.contractId,
      target: sla.targetPercent,
      actual,
      delta,
      status: sla.status,
      measurementPeriod: sla.measurementPeriod,
    };
  }

  async update(id: string, tenantId: string, dto: UpdateSlaDto) {
    await this.detail(id, tenantId);
    return this.prisma.contractSLA.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    await this.detail(id, tenantId);
    await this.prisma.contractSLA.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return { success: true };
  }
}
