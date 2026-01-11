import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateVolumeCommitmentDto } from './dto/create-volume-commitment.dto';
import { UpdateVolumeCommitmentDto } from './dto/update-volume-commitment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VolumeCommitmentsService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  list(tenantId: string, contractId: string) {
    return this.prisma.volumeCommitment.findMany({ where: { tenantId, contractId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, contractId: string, userId: string, dto: CreateVolumeCommitmentDto) {
    return this.prisma.volumeCommitment.create({
      data: {
        tenantId,
        contractId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        minimumLoads: dto.minimumLoads ?? null,
        minimumRevenue: dto.minimumRevenue ?? null,
        minimumWeight: dto.minimumWeight ?? null,
        shortfallFee: dto.shortfallFee ?? null,
        shortfallPercent: dto.shortfallPercent ?? null,
        status: dto.status ?? 'ACTIVE',
        createdById: userId,
      },
    });
  }

  async detail(id: string, tenantId: string) {
    const vc = await this.prisma.volumeCommitment.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!vc) throw new NotFoundException('Volume commitment not found');
    return vc;
  }

  async update(id: string, tenantId: string, dto: UpdateVolumeCommitmentDto) {
    await this.detail(id, tenantId);
    return this.prisma.volumeCommitment.update({ where: { id }, data: dto });
  }

  async delete(id: string, tenantId: string) {
    await this.detail(id, tenantId);
    await this.prisma.volumeCommitment.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return { success: true };
  }

  async performance(id: string, tenantId: string) {
    const vc = await this.detail(id, tenantId);
    const loadsGap = vc.minimumLoads ? vc.minimumLoads - (vc.actualLoads ?? 0) : null;
    const revenueGap = vc.minimumRevenue ? Number(vc.minimumRevenue) - Number(vc.actualRevenue) : null;
    const weightGap = vc.minimumWeight ? Number(vc.minimumWeight) - Number(vc.actualWeight) : null;
    const hasShortfall = [loadsGap, revenueGap, weightGap].some((gap) => gap !== null && gap > 0);

    if (hasShortfall) {
      this.eventEmitter.emit('volume.shortfall', {
        commitmentId: vc.id,
        contractId: vc.contractId,
        tenantId,
        loadsGap,
        revenueGap,
        weightGap,
      });
    }

    return {
      commitmentId: vc.id,
      status: vc.status,
      loadsGap,
      revenueGap,
      weightGap,
    };
  }
}
