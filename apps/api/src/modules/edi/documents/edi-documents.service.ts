import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EdiDirection, EdiMessageStatus, EdiTransactionType, EdiValidationStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { EdiControlNumberService } from '../control-number.service';
import { EdiParserService } from '../parsing/edi-parser.service';
import { AcknowledgeEdiDocumentDto } from './dto/acknowledge-edi-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { ImportEdiDocumentDto } from './dto/import-edi-document.dto';
import { ReprocessDocumentDto } from './dto/reprocess-document.dto';

@Injectable()
export class EdiDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly parser: EdiParserService,
    private readonly controlNumbers: EdiControlNumberService,
  ) {}

  async list(tenantId: string, query: DocumentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EdiMessageWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.transactionType ? { transactionType: query.transactionType } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.tradingPartnerId ? { tradingPartnerId: query.tradingPartnerId } : {}),
      ...(query.entityId ? { entityId: query.entityId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.ediMessage.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.ediMessage.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    return this.requireMessage(tenantId, id);
  }

  async rawContent(tenantId: string, id: string) {
    const message = await this.requireMessage(tenantId, id);
    return { rawContent: message.rawContent };
  }

  async parsedContent(tenantId: string, id: string) {
    const message = await this.requireMessage(tenantId, id);
    return { parsedContent: message.parsedContent };
  }

  async importDocument(tenantId: string, userId: string, dto: ImportEdiDocumentDto) {
    const direction = dto.direction ?? EdiDirection.INBOUND;
    const controlNumbers = await this.controlNumbers.nextTriple(tenantId, dto.tradingPartnerId, dto.transactionType);

    let parsedContent: Prisma.InputJsonValue | Prisma.JsonNullValueInput = Prisma.JsonNull;
    let validationStatus: EdiValidationStatus | null = null;
    let validationErrors: Prisma.InputJsonValue | Prisma.JsonNullValueInput = Prisma.JsonNull;
    let status: EdiMessageStatus = EdiMessageStatus.PENDING;

    try {
      parsedContent = this.parser.parse(dto.rawContent) as Prisma.InputJsonValue;
      validationStatus = EdiValidationStatus.VALID;
      status = EdiMessageStatus.DELIVERED;
      this.eventEmitter.emit('edi.document.received', { documentType: dto.transactionType, tenantId });
    } catch (err) {
      validationStatus = EdiValidationStatus.ERROR;
      validationErrors = [{ message: (err as Error).message }] as Prisma.InputJsonValue;
      status = EdiMessageStatus.ERROR;
      this.eventEmitter.emit('edi.document.error', { error: (err as Error).message });
    }

    const messageId = `IN-${randomUUID()}`;
    const entityType = dto.entityType ?? this.resolveEntityType(dto.transactionType);

    const message = await this.prisma.ediMessage.create({
      data: {
        tenantId,
        tradingPartnerId: dto.tradingPartnerId,
        messageId,
        transactionType: dto.transactionType,
        direction,
        status,
        isaControlNumber: controlNumbers.isaControlNumber,
        gsControlNumber: controlNumbers.gsControlNumber,
        stControlNumber: controlNumbers.stControlNumber,
        entityType,
        entityId: dto.entityId ?? this.inferEntityId(dto.transactionType, parsedContent),
        rawContent: dto.rawContent,
        parsedContent,
        processedAt: status === EdiMessageStatus.DELIVERED ? new Date() : null,
        validationStatus,
        validationErrors,
        createdById: userId,
        updatedById: userId,
      },
    });

    if (status === EdiMessageStatus.DELIVERED && dto.transactionType === EdiTransactionType.EDI_204) {
      this.eventEmitter.emit('edi.204.received', { documentId: message.id, loadId: message.entityId });
    }

    return message;
  }

  async reprocess(tenantId: string, id: string, dto: ReprocessDocumentDto) {
    const message = await this.requireMessage(tenantId, id);
    const retryCount = message.retryCount + 1;

    return this.prisma.ediMessage.update({
      where: { id: message.id },
      data: {
        status: EdiMessageStatus.PENDING,
        validationStatus: null,
        validationErrors: dto.reason ? ([{ reason: dto.reason }] as Prisma.InputJsonValue) : Prisma.JsonNull,
        retryCount,
        lastRetryAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async acknowledge(tenantId: string, id: string, dto: AcknowledgeEdiDocumentDto) {
    const message = await this.requireMessage(tenantId, id);

    const ack = await this.prisma.ediAcknowledgment.create({
      data: {
        tenantId,
        originalMessageId: message.id,
        ackControlNumber: dto.ackControlNumber,
        ackStatus: dto.ackStatus,
        errorCodes: (dto.errorCodes ?? Prisma.JsonNull) as Prisma.InputJsonValue | Prisma.JsonNullValueInput,
        receivedAt: new Date(),
      },
    });

    await this.prisma.ediMessage.update({
      where: { id: message.id },
      data: {
        status: EdiMessageStatus.ACKNOWLEDGED,
        functionalAckId: ack.id,
        processedAt: new Date(),
      },
    });

    this.eventEmitter.emit('edi.997.sent', { documentId: ack.id, originalDocId: message.id });
    return ack;
  }

  async listByOrder(tenantId: string, orderId: string) {
    return this.prisma.ediMessage.findMany({
      where: { tenantId, entityType: 'ORDER', entityId: orderId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listByLoad(tenantId: string, loadId: string) {
    return this.prisma.ediMessage.findMany({
      where: { tenantId, entityType: 'LOAD', entityId: loadId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listErrors(tenantId: string) {
    return this.prisma.ediMessage.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          { validationStatus: EdiValidationStatus.ERROR },
          { status: EdiMessageStatus.ERROR },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private resolveEntityType(transactionType: EdiTransactionType) {
    if (transactionType === EdiTransactionType.EDI_210) return 'INVOICE';
    if (transactionType === EdiTransactionType.EDI_214 || transactionType === EdiTransactionType.EDI_204 || transactionType === EdiTransactionType.EDI_990) return 'LOAD';
    return null;
  }

  private inferEntityId(transactionType: EdiTransactionType, parsedContent: Prisma.InputJsonValue | Prisma.JsonNullValueInput) {
    if (!parsedContent || parsedContent === Prisma.JsonNull || typeof parsedContent !== 'object') return null;
    const payload = parsedContent as Record<string, unknown>;
    if (transactionType === EdiTransactionType.EDI_210 && typeof payload.invoiceId === 'string') {
      return payload.invoiceId;
    }
    if (typeof payload.loadId === 'string') {
      return payload.loadId;
    }
    if (typeof payload.orderId === 'string') {
      return payload.orderId;
    }
    return null;
  }

  private async requireMessage(tenantId: string, id: string) {
    const message = await this.prisma.ediMessage.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!message) {
      throw new NotFoundException('EDI document not found');
    }
    return message;
  }
}
