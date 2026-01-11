import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, SaferDataStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { FmcsaLookupDto } from './dto/fmcsa-lookup.dto';
import { FmcsaApiClient } from './fmcsa-api.client';

@Injectable()
export class FmcsaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
    private readonly apiClient: FmcsaApiClient,
  ) {}

  async lookup(tenantId: string, dto: FmcsaLookupDto) {
    const where: Prisma.FmcsaCarrierRecordWhereInput = {
      tenantId,
      deletedAt: null,
      ...(dto.dotNumber ? { dotNumber: dto.dotNumber } : {}),
      ...(dto.mcNumber ? { mcNumber: dto.mcNumber } : {}),
    };

    let record = await this.prisma.fmcsaCarrierRecord.findFirst({ where, orderBy: { updatedAt: 'desc' } });

    if (record) {
      return record;
    }

    const carrier = await this.prisma.carrier.findFirst({
      where: {
        tenantId,
        ...(dto.dotNumber ? { dotNumber: dto.dotNumber } : {}),
        ...(dto.mcNumber ? { mcNumber: dto.mcNumber } : {}),
        deletedAt: null,
      },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found for lookup');
    }

    const apiData = await this.apiClient.fetchCarrierData(dto.dotNumber ?? carrier.dotNumber, dto.mcNumber ?? carrier.mcNumber);

    record = await this.prisma.fmcsaCarrierRecord.upsert({
      where: { carrierId: carrier.id },
      update: {
        dotNumber: apiData?.dotNumber ?? carrier.dotNumber ?? dto.dotNumber,
        mcNumber: apiData?.mcNumber ?? carrier.mcNumber ?? dto.mcNumber,
        legalName: apiData?.legalName ?? carrier.legalName,
        dbaName: apiData?.dbaName ?? carrier.dbaName,
        operatingStatus: apiData?.operatingStatus ?? SaferDataStatus.ACTIVE,
        lastSyncedAt: new Date(),
        saferDataJson: apiData ?? Prisma.JsonNull,
      },
      create: {
        tenantId,
        carrierId: carrier.id,
        dotNumber: apiData?.dotNumber ?? carrier.dotNumber ?? dto.dotNumber ?? undefined,
        mcNumber: apiData?.mcNumber ?? carrier.mcNumber ?? dto.mcNumber ?? undefined,
        legalName: apiData?.legalName ?? carrier.legalName,
        dbaName: apiData?.dbaName ?? carrier.dbaName,
        operatingStatus: apiData?.operatingStatus ?? SaferDataStatus.ACTIVE,
        lastSyncedAt: new Date(),
        saferDataJson: apiData ?? Prisma.JsonNull,
      },
    });

    return record;
  }

  async verify(tenantId: string, carrierId: string) {
    const carrier = await this.requireCarrier(tenantId, carrierId);

    const record = await this.prisma.fmcsaCarrierRecord.upsert({
      where: { carrierId: carrier.id },
      update: { operatingStatus: SaferDataStatus.ACTIVE, lastSyncedAt: new Date() },
      create: {
        tenantId,
        carrierId: carrier.id,
        operatingStatus: SaferDataStatus.ACTIVE,
        legalName: carrier.legalName,
        dotNumber: carrier.dotNumber,
        mcNumber: carrier.mcNumber,
        lastSyncedAt: new Date(),
      },
    });

    this.events.emit('safety.carrier.verified', { carrierId, status: record.operatingStatus });
    return record;
  }

  async refresh(tenantId: string, carrierId: string) {
    const record = await this.getRecord(tenantId, carrierId);
    const refreshed = await this.prisma.fmcsaCarrierRecord.update({
      where: { id: record.id },
      data: { lastSyncedAt: new Date(), saferDataJson: record.saferDataJson ?? Prisma.JsonNull },
    });
    return refreshed;
  }

  async getRecord(tenantId: string, carrierId: string) {
    const record = await this.prisma.fmcsaCarrierRecord.findFirst({
      where: { tenantId, carrierId, deletedAt: null },
    });

    if (!record) {
      throw new NotFoundException('FMCSA record not found');
    }

    return record;
  }

  private async requireCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }
    return carrier;
  }
}
