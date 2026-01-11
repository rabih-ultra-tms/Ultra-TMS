import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EdiDirection, EdiMessageStatus, EdiTransactionType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { EdiControlNumberService } from '../control-number.service';
import { Edi204Generator } from './generators/edi-204.generator';
import { Edi210Generator } from './generators/edi-210.generator';
import { Edi214Generator } from './generators/edi-214.generator';
import { Edi990Generator } from './generators/edi-990.generator';
import { Edi997Generator } from './generators/edi-997.generator';
import { Generate204Dto } from './dto/generate-204.dto';
import { Generate210Dto } from './dto/generate-210.dto';
import { Generate214Dto } from './dto/generate-214.dto';
import { Generate990Dto } from './dto/generate-990.dto';
import { Generate997Dto } from './dto/generate-997.dto';

@Injectable()
export class EdiGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlNumbers: EdiControlNumberService,
    private readonly generator204: Edi204Generator,
    private readonly generator210: Edi210Generator,
    private readonly generator214: Edi214Generator,
    private readonly generator990: Edi990Generator,
    private readonly generator997: Edi997Generator,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async generate204(tenantId: string, userId: string, dto: Generate204Dto) {
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, EdiTransactionType.EDI_204);
    const rawContent = this.generator204.generate(dto, controlNumbers);
    const entityId = dto.loadId;

    const message = await this.createOutboundMessage({
      tenantId,
      userId,
      tradingPartnerId: dto.tradingPartnerId,
      transactionType: EdiTransactionType.EDI_204,
      rawContent,
      entityType: 'LOAD',
      entityId,
      parsedContent: dto as unknown as Prisma.InputJsonValue,
      sendImmediately: dto.sendImmediately,
      controlNumbers,
    });

    this.eventEmitter.emit('edi.document.processed', { documentId: message.id, orderId: entityId });
    return message;
  }

  async generate210(tenantId: string, userId: string, dto: Generate210Dto) {
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, EdiTransactionType.EDI_210);
    const rawContent = this.generator210.generate(dto, controlNumbers);

    const message = await this.createOutboundMessage({
      tenantId,
      userId,
      tradingPartnerId: dto.tradingPartnerId,
      transactionType: EdiTransactionType.EDI_210,
      rawContent,
      entityType: 'INVOICE',
      entityId: dto.invoiceId,
      parsedContent: dto as unknown as Prisma.InputJsonValue,
      sendImmediately: dto.sendImmediately,
      controlNumbers,
    });

    this.eventEmitter.emit('edi.210.sent', { documentId: message.id, invoiceId: dto.invoiceId });
    return message;
  }

  async generate214(tenantId: string, userId: string, dto: Generate214Dto) {
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, EdiTransactionType.EDI_214);
    const rawContent = this.generator214.generate(dto, controlNumbers);

    const message = await this.createOutboundMessage({
      tenantId,
      userId,
      tradingPartnerId: dto.tradingPartnerId,
      transactionType: EdiTransactionType.EDI_214,
      rawContent,
      entityType: 'LOAD',
      entityId: dto.loadId,
      parsedContent: dto as unknown as Prisma.InputJsonValue,
      sendImmediately: dto.sendImmediately,
      controlNumbers,
    });

    this.eventEmitter.emit('edi.214.sent', { documentId: message.id, loadId: dto.loadId, status: dto.statusCode });
    return message;
  }

  async generate990(tenantId: string, userId: string, dto: Generate990Dto) {
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, EdiTransactionType.EDI_990);
    const rawContent = this.generator990.generate(dto, controlNumbers);

    return this.createOutboundMessage({
      tenantId,
      userId,
      tradingPartnerId: dto.tradingPartnerId,
      transactionType: EdiTransactionType.EDI_990,
      rawContent,
      entityType: 'LOAD',
      entityId: dto.loadId,
      parsedContent: dto as unknown as Prisma.InputJsonValue,
      sendImmediately: dto.sendImmediately,
      controlNumbers,
    });
  }

  async generate997(tenantId: string, userId: string, dto: Generate997Dto) {
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, EdiTransactionType.EDI_997);
    const rawContent = this.generator997.generate(dto, controlNumbers);

    const message = await this.createOutboundMessage({
      tenantId,
      userId,
      tradingPartnerId: dto.tradingPartnerId,
      transactionType: EdiTransactionType.EDI_997,
      rawContent,
      entityType: null,
      entityId: dto.originalMessageId,
      parsedContent: dto as unknown as Prisma.InputJsonValue,
      sendImmediately: dto.sendImmediately,
      controlNumbers,
    });

    this.eventEmitter.emit('edi.997.sent', { documentId: message.id, originalDocId: dto.originalMessageId });
    return message;
  }

  async sendDocument(tenantId: string, id: string) {
    const message = await this.prisma.ediMessage.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!message) {
      throw new NotFoundException('EDI document not found');
    }

    await this.prisma.ediMessage.update({
      where: { id },
      data: { status: EdiMessageStatus.SENT, processedAt: new Date(), updatedAt: new Date() },
    });

    const partner = await this.prisma.ediTradingPartner.findFirst({ where: { id: message.tradingPartnerId } });

    await this.prisma.ediCommunicationLog.create({
      data: {
        tenantId,
        tradingPartnerId: message.tradingPartnerId,
        direction: message.direction,
        protocol: partner?.protocol ?? 'FTP',
        action: 'SEND',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
        durationMs: 0,
        messageCount: 1,
        fileName: `${message.transactionType}-${message.messageId}.edi`,
      },
    });

    return { success: true };
  }

  private async createOutboundMessage(params: {
    tenantId: string;
    userId: string;
    tradingPartnerId: string;
    transactionType: EdiTransactionType;
    rawContent: string;
    entityType: string | null;
    entityId?: string | null;
    parsedContent?: Prisma.InputJsonValue | Prisma.JsonNullValueInput;
    sendImmediately?: boolean;
    controlNumbers?: { isaControlNumber: string; gsControlNumber: string; stControlNumber: string };
  }) {
    const status = params.sendImmediately ? EdiMessageStatus.SENT : EdiMessageStatus.QUEUED;
    const controlNumbers =
      params.controlNumbers ?? (await this.controlNumbers.nextTriple(params.tenantId, params.tradingPartnerId, params.transactionType));

    return this.prisma.ediMessage.create({
      data: {
        tenantId: params.tenantId,
        tradingPartnerId: params.tradingPartnerId,
        messageId: `OUT-${randomUUID()}`,
        transactionType: params.transactionType,
        direction: EdiDirection.OUTBOUND,
        status,
        isaControlNumber: controlNumbers.isaControlNumber,
        gsControlNumber: controlNumbers.gsControlNumber,
        stControlNumber: controlNumbers.stControlNumber,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        rawContent: params.rawContent,
        parsedContent: params.parsedContent ?? Prisma.JsonNull,
        processedAt: params.sendImmediately ? new Date() : null,
        createdById: params.userId,
        updatedById: params.userId,
      },
    });
  }
}
