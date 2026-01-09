import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TwilioProvider, TwilioInboundMessage } from './providers/twilio.provider';
import { TemplatesService } from './templates.service';
import { SendSmsDto, ReplySmsDto } from './dto';

export interface SmsConversationListOptions {
  page?: number;
  limit?: number;
  status?: string;
  participantType?: string;
  loadId?: string;
  search?: string;
}

export interface SmsStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  received: number;
  activeConversations: number;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private prisma: PrismaService,
    private twilio: TwilioProvider,
    private templatesService: TemplatesService,
  ) {}

  async send(tenantId: string, userId: string, dto: SendSmsDto) {
    let message = dto.message;

    // If template-based, get and render template
    if (dto.templateCode) {
      const template = await this.templatesService.findByCode(
        tenantId,
        dto.templateCode,
        'SMS',
      );

      if (!template) {
        throw new BadRequestException(
          `SMS template not found: ${dto.templateCode}`,
        );
      }

      message = this.templatesService.renderTemplate(
        template.bodyEn,
        dto.variables || {},
      );
    }

    if (!message) {
      throw new BadRequestException(
        'Message is required (either directly or via template)',
      );
    }

    const formattedPhone = this.twilio.formatPhoneNumber(dto.phoneNumber);

    // Find or create conversation
    let conversation = await this.prisma.smsConversation.findUnique({
      where: {
        tenantId_phoneNumber_loadId: {
          tenantId,
          phoneNumber: formattedPhone,
          loadId: dto.loadId || '',
        },
      },
    });

    if (!conversation) {
      conversation = await this.prisma.smsConversation.create({
        data: {
          tenantId,
          phoneNumber: formattedPhone,
          participantType: dto.recipientType,
          participantId: dto.recipientId,
          participantName: dto.recipientName,
          loadId: dto.loadId,
          status: 'ACTIVE',
        },
      });
    }

    // Create message record
    const smsMessage = await this.prisma.smsMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        body: message,
        mediaUrls: dto.mediaUrls,
        status: 'PENDING',
        createdById: userId,
      },
    });

    // Create communication log
    const log = await this.prisma.communicationLog.create({
      data: {
        tenantId,
        channel: 'SMS',
        templateCode: dto.templateCode,
        recipientType: dto.recipientType,
        recipientId: dto.recipientId,
        recipientPhone: formattedPhone,
        recipientName: dto.recipientName,
        body: message,
        entityType: dto.entityType || (dto.loadId ? 'LOAD' : undefined),
        entityId: dto.entityId || dto.loadId,
        status: 'PENDING',
        createdById: userId,
        metadata: { conversationId: conversation.id, messageId: smsMessage.id },
      },
    });

    // Send via provider
    const result = await this.twilio.sendSms({
      to: formattedPhone,
      body: message,
      mediaUrls: dto.mediaUrls,
    });

    // Update message with result
    await this.prisma.smsMessage.update({
      where: { id: smsMessage.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        providerMessageId: result.messageId,
        errorMessage: result.error,
      },
    });

    // Update conversation
    await this.prisma.smsConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: message.substring(0, 100),
      },
    });

    // Update log
    await this.prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        failedAt: result.success ? undefined : new Date(),
        providerMessageId: result.messageId,
        provider: 'TWILIO',
        errorMessage: result.error,
      },
    });

    this.logger.log(
      `SMS ${result.success ? 'sent' : 'failed'} to ${formattedPhone}`,
    );

    return {
      success: result.success,
      conversationId: conversation.id,
      messageId: smsMessage.id,
      logId: log.id,
      providerMessageId: result.messageId,
      error: result.error,
    };
  }

  async getConversations(tenantId: string, options: SmsConversationListOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.participantType) {
      where.participantType = options.participantType;
    }

    if (options.loadId) {
      where.loadId = options.loadId;
    }

    if (options.search) {
      where.OR = [
        { phoneNumber: { contains: options.search } },
        { participantName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [conversations, total] = await Promise.all([
      this.prisma.smsConversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.smsConversation.count({ where }),
    ]);

    return {
      data: conversations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.smsConversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new BadRequestException(`Conversation not found: ${conversationId}`);
    }

    // Mark as read
    if (conversation.unreadCount > 0) {
      await this.prisma.smsConversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      });

      await this.prisma.smsMessage.updateMany({
        where: {
          conversationId,
          direction: 'INBOUND',
          readAt: null,
        },
        data: { readAt: new Date() },
      });
    }

    return conversation;
  }

  async reply(
    tenantId: string,
    conversationId: string,
    userId: string,
    dto: ReplySmsDto,
  ) {
    const conversation = await this.prisma.smsConversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new BadRequestException(`Conversation not found: ${conversationId}`);
    }

    return this.send(tenantId, userId, {
      phoneNumber: conversation.phoneNumber,
      message: dto.message,
      mediaUrls: dto.mediaUrls,
      recipientType: conversation.participantType || undefined,
      recipientId: conversation.participantId || undefined,
      recipientName: conversation.participantName || undefined,
      loadId: conversation.loadId || undefined,
    });
  }

  async handleInboundWebhook(tenantId: string, body: TwilioInboundMessage) {
    const parsed = this.twilio.parseInboundMessage(body);

    // Find conversation
    let conversation = await this.prisma.smsConversation.findFirst({
      where: {
        tenantId,
        phoneNumber: parsed.from,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!conversation) {
      // Create new conversation for unknown sender
      conversation = await this.prisma.smsConversation.create({
        data: {
          tenantId,
          phoneNumber: parsed.from,
          status: 'ACTIVE',
        },
      });
    }

    // Create message
    const message = await this.prisma.smsMessage.create({
      data: {
        conversationId: conversation.id,
        direction: 'INBOUND',
        body: parsed.body,
        mediaUrls: parsed.mediaUrls.length > 0 ? parsed.mediaUrls : undefined,
        status: 'RECEIVED',
        receivedAt: new Date(),
        providerMessageId: parsed.messageId,
      },
    });

    // Update conversation
    await this.prisma.smsConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: parsed.body.substring(0, 100),
        unreadCount: { increment: 1 },
        status: 'ACTIVE',
      },
    });

    // Create log
    await this.prisma.communicationLog.create({
      data: {
        tenantId,
        channel: 'SMS',
        recipientPhone: parsed.to,
        body: parsed.body,
        status: 'RECEIVED',
        provider: 'TWILIO',
        providerMessageId: parsed.messageId,
        metadata: { conversationId: conversation.id, from: parsed.from },
      },
    });

    this.logger.log(`Inbound SMS from ${parsed.from}: ${parsed.body.substring(0, 50)}...`);

    return { success: true, conversationId: conversation.id, messageId: message.id };
  }

  async closeConversation(tenantId: string, conversationId: string) {
    const conversation = await this.prisma.smsConversation.findFirst({
      where: { id: conversationId, tenantId },
    });

    if (!conversation) {
      throw new BadRequestException(`Conversation not found: ${conversationId}`);
    }

    await this.prisma.smsConversation.update({
      where: { id: conversationId },
      data: { status: 'CLOSED' },
    });

    return { success: true, message: 'Conversation closed' };
  }

  async getLogs(tenantId: string, options: SmsConversationListOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where: { tenantId, channel: 'SMS' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communicationLog.count({
        where: { tenantId, channel: 'SMS' },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(tenantId: string): Promise<SmsStats> {
    const [total, sent, delivered, failed, received, activeConversations] =
      await Promise.all([
        this.prisma.communicationLog.count({
          where: { tenantId, channel: 'SMS' },
        }),
        this.prisma.communicationLog.count({
          where: { tenantId, channel: 'SMS', status: 'SENT' },
        }),
        this.prisma.communicationLog.count({
          where: { tenantId, channel: 'SMS', status: 'DELIVERED' },
        }),
        this.prisma.communicationLog.count({
          where: { tenantId, channel: 'SMS', status: 'FAILED' },
        }),
        this.prisma.communicationLog.count({
          where: { tenantId, channel: 'SMS', status: 'RECEIVED' },
        }),
        this.prisma.smsConversation.count({
          where: { tenantId, status: 'ACTIVE' },
        }),
      ]);

    return { total, sent, delivered, failed, received, activeConversations };
  }
}
