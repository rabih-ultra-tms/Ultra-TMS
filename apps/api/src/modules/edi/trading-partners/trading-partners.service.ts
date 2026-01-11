import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EdiCommunicationProtocol, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { EdiPartnerType } from '../dto/enums';
import { As2Transport } from '../transport/as2.transport';
import { FtpTransport } from '../transport/ftp.transport';
import { SftpTransport } from '../transport/sftp.transport';
import { CreateTradingPartnerDto } from './dto/create-trading-partner.dto';
import { TradingPartnerQueryDto } from './dto/trading-partner-query.dto';
import { UpdateTradingPartnerDto } from './dto/update-trading-partner.dto';

@Injectable()
export class TradingPartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly ftpTransport: FtpTransport,
    private readonly sftpTransport: SftpTransport,
    private readonly as2Transport: As2Transport,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateTradingPartnerDto) {
    const existing = await this.prisma.ediTradingPartner.findFirst({ where: { isaId: dto.isaId, deletedAt: null } });
    if (existing) {
      throw new BadRequestException('Trading partner with this ISA ID already exists');
    }

    return this.prisma.ediTradingPartner.create({
      data: {
        tenantId,
        partnerName: dto.partnerName,
        partnerType: dto.partnerType,
        isaId: dto.isaId,
        gsId: dto.gsId,
        duns: dto.duns,
        scac: dto.scac,
        protocol: dto.protocol,
        ftpHost: dto.ftpHost,
        ftpPort: dto.ftpPort,
        ftpUsername: dto.ftpUsername,
        ftpPassword: dto.ftpPassword,
        ftpInboundPath: dto.ftpInboundPath,
        ftpOutboundPath: dto.ftpOutboundPath,
        as2Url: dto.as2Url,
        as2Identifier: dto.as2Identifier,
        vanMailbox: dto.vanMailbox,
        sendFunctionalAck: dto.sendFunctionalAck ?? true,
        requireFunctionalAck: dto.requireFunctionalAck ?? true,
        testMode: dto.testMode ?? false,
        fieldMappings: dto.fieldMappings ? (dto.fieldMappings as Prisma.InputJsonValue) : Prisma.JsonNull,
        externalId: dto.externalId,
        sourceSystem: dto.sourceSystem,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findAll(tenantId: string, query: TradingPartnerQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EdiTradingPartnerWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.protocol ? { protocol: query.protocol } : {}),
      ...(query.partnerType ? { partnerType: query.partnerType as EdiPartnerType } : {}),
      ...(query.search
        ? {
            OR: [
              { partnerName: { contains: query.search, mode: 'insensitive' } },
              { isaId: { contains: query.search, mode: 'insensitive' } },
              { gsId: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.ediTradingPartner.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.ediTradingPartner.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    return this.requirePartner(tenantId, id);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateTradingPartnerDto) {
    const partner = await this.requirePartner(tenantId, id);

    if (dto.isaId && dto.isaId !== partner.isaId) {
      const conflict = await this.prisma.ediTradingPartner.findFirst({ where: { isaId: dto.isaId, deletedAt: null } });
      if (conflict) {
        throw new BadRequestException('Trading partner with this ISA ID already exists');
      }
    }

    return this.prisma.ediTradingPartner.update({
      where: { id: partner.id },
      data: {
        ...(dto.partnerName !== undefined ? { partnerName: dto.partnerName } : {}),
        ...(dto.partnerType !== undefined ? { partnerType: dto.partnerType } : {}),
        ...(dto.isaId !== undefined ? { isaId: dto.isaId } : {}),
        ...(dto.gsId !== undefined ? { gsId: dto.gsId } : {}),
        ...(dto.duns !== undefined ? { duns: dto.duns } : {}),
        ...(dto.scac !== undefined ? { scac: dto.scac } : {}),
        ...(dto.protocol !== undefined ? { protocol: dto.protocol } : {}),
        ...(dto.ftpHost !== undefined ? { ftpHost: dto.ftpHost } : {}),
        ...(dto.ftpPort !== undefined ? { ftpPort: dto.ftpPort } : {}),
        ...(dto.ftpUsername !== undefined ? { ftpUsername: dto.ftpUsername } : {}),
        ...(dto.ftpPassword !== undefined ? { ftpPassword: dto.ftpPassword } : {}),
        ...(dto.ftpInboundPath !== undefined ? { ftpInboundPath: dto.ftpInboundPath } : {}),
        ...(dto.ftpOutboundPath !== undefined ? { ftpOutboundPath: dto.ftpOutboundPath } : {}),
        ...(dto.as2Url !== undefined ? { as2Url: dto.as2Url } : {}),
        ...(dto.as2Identifier !== undefined ? { as2Identifier: dto.as2Identifier } : {}),
        ...(dto.vanMailbox !== undefined ? { vanMailbox: dto.vanMailbox } : {}),
        ...(dto.sendFunctionalAck !== undefined ? { sendFunctionalAck: dto.sendFunctionalAck } : {}),
        ...(dto.requireFunctionalAck !== undefined ? { requireFunctionalAck: dto.requireFunctionalAck } : {}),
        ...(dto.testMode !== undefined ? { testMode: dto.testMode } : {}),
        ...(dto.fieldMappings !== undefined
          ? { fieldMappings: (dto.fieldMappings ?? Prisma.JsonNull) as Prisma.InputJsonValue | Prisma.JsonNullValueInput }
          : {}),
        updatedById: userId,
      },
    });
  }

  async toggleStatus(tenantId: string, userId: string, id: string) {
    const partner = await this.requirePartner(tenantId, id);
    return this.prisma.ediTradingPartner.update({
      where: { id: partner.id },
      data: { isActive: !partner.isActive, updatedById: userId },
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.requirePartner(tenantId, id);
    await this.prisma.ediTradingPartner.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false, updatedById: userId },
    });
    return { success: true };
  }

  async testConnection(tenantId: string, id: string) {
    const partner = await this.requirePartner(tenantId, id);

    let result: { success: boolean; protocol: string; error?: string };
    try {
      if (partner.protocol === EdiCommunicationProtocol.SFTP) {
        result = await this.sftpTransport.testConnection({ host: partner.ftpHost, username: partner.ftpUsername });
      } else if (partner.protocol === EdiCommunicationProtocol.AS2) {
        result = await this.as2Transport.testConnection({ url: partner.as2Url, identifier: partner.as2Identifier });
      } else {
        result = await this.ftpTransport.testConnection({ host: partner.ftpHost, username: partner.ftpUsername });
      }

      await this.prisma.ediCommunicationLog.create({
        data: {
          tenantId,
          tradingPartnerId: partner.id,
          direction: 'OUTBOUND',
          protocol: partner.protocol,
          action: 'CONNECT',
          status: result.success ? 'SUCCESS' : 'FAILED',
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
        },
      });

      this.eventEmitter.emit('edi.partner.connected', { partnerId: partner.id });
      return { success: true, protocol: partner.protocol };
    } catch (error) {
      await this.prisma.ediCommunicationLog.create({
        data: {
          tenantId,
          tradingPartnerId: partner.id,
          direction: 'OUTBOUND',
          protocol: partner.protocol,
          action: 'CONNECT',
          status: 'FAILED',
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
          errorMessage: (error as Error).message,
        },
      });

      this.eventEmitter.emit('edi.partner.error', { partnerId: partner.id, error: (error as Error).message });
      throw error;
    }
  }

  async activity(tenantId: string, id: string) {
    await this.requirePartner(tenantId, id);
    return this.prisma.ediCommunicationLog.findMany({
      where: { tenantId, tradingPartnerId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }

  private async requirePartner(tenantId: string, id: string) {
    const partner = await this.prisma.ediTradingPartner.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!partner) {
      throw new NotFoundException('Trading partner not found');
    }
    return partner;
  }
}
