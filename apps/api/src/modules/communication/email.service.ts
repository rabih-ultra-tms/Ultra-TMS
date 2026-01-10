import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { TemplatesService } from './templates.service';
import { SendEmailDto, SendBulkEmailDto } from './dto';

export interface EmailLogListOptions {
  page?: number;
  limit?: number;
  status?: string;
  recipientEmail?: string;
  entityType?: string;
  entityId?: string;
  templateCode?: string;
  fromDate?: string;
  toDate?: string;
}

export interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  bounced: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private sendGrid: SendGridProvider,
    private templatesService: TemplatesService,
  ) {}

  async send(tenantId: string, userId: string, dto: SendEmailDto) {
    let subject = dto.subject;
    let body = dto.body;
    const bodyHtml = dto.bodyHtml;
    let templateId: string | undefined;
    const language = dto.language || 'en';

    // If template-based, get and render template
    if (dto.templateCode) {
      const template = await this.templatesService.findByCode(
        tenantId,
        dto.templateCode,
        'EMAIL',
      );

      if (!template) {
        throw new BadRequestException(
          `Email template not found: ${dto.templateCode}`,
        );
      }

      templateId = template.id;

      const subjectTemplate =
        language === 'es'
          ? template.subjectEs || template.subjectEn
          : template.subjectEn;
      const bodyTemplate =
        language === 'es'
          ? template.bodyEs || template.bodyEn
          : template.bodyEn;

      subject = this.templatesService.renderTemplate(
        subjectTemplate,
        dto.variables || {},
      );
      body = this.templatesService.renderTemplate(
        bodyTemplate,
        dto.variables || {},
      );

      // Use template from address if not overridden
      if (!dto.fromName && template.fromName) {
        dto.fromName = template.fromName;
      }
      if (!dto.fromEmail && template.fromEmail) {
        dto.fromEmail = template.fromEmail;
      }
      if (!dto.replyTo && template.replyTo) {
        dto.replyTo = template.replyTo;
      }
    }

    if (!subject || !body) {
      throw new BadRequestException(
        'Subject and body are required (either directly or via template)',
      );
    }

    // Create log entry
    const log = await this.prisma.communicationLog.create({
      data: {
        tenantId,
        channel: 'EMAIL',
        templateId,
        templateCode: dto.templateCode,
        recipientType: dto.recipientType,
        recipientId: dto.recipientId,
        recipientEmail: dto.recipientEmail,
        recipientName: dto.recipientName,
        subject,
        body,
        bodyHtml: bodyHtml || body,
        language,
        attachments: dto.attachments
          ? JSON.parse(JSON.stringify(dto.attachments))
          : undefined,
        entityType: dto.entityType,
        entityId: dto.entityId,
        status: 'PENDING',
        createdById: userId,
        metadata: dto.variables
          ? JSON.parse(JSON.stringify(dto.variables))
          : undefined,
      },
    });

    // Send via provider
    const result = await this.sendGrid.sendEmail({
      to: dto.recipientEmail,
      toName: dto.recipientName,
      subject,
      text: body,
      html: bodyHtml || body,
      from: dto.fromEmail,
      fromName: dto.fromName,
      replyTo: dto.replyTo,
    });

    // Update log with result
    await this.prisma.communicationLog.update({
      where: { id: log.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        failedAt: result.success ? undefined : new Date(),
        providerMessageId: result.messageId,
        provider: 'SENDGRID',
        errorMessage: result.error,
      },
    });

    this.logger.log(
      `Email ${result.success ? 'sent' : 'failed'} to ${dto.recipientEmail}: ${subject}`,
    );

    return {
      success: result.success,
      logId: log.id,
      messageId: result.messageId,
      error: result.error,
    };
  }

  async sendBulk(tenantId: string, userId: string, dto: SendBulkEmailDto) {
    const results = await Promise.all(
      dto.recipients.map((recipient) =>
        this.send(tenantId, userId, {
          templateCode: dto.templateCode,
          subject: dto.subject,
          body: dto.body,
          bodyHtml: dto.bodyHtml,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          recipientType: recipient.recipientType,
          recipientId: recipient.recipientId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          variables: { ...dto.commonVariables, ...recipient.variables },
          language: recipient.language,
        }),
      ),
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      total: dto.recipients.length,
      successful,
      failed,
      results,
    };
  }

  async getLogs(tenantId: string, options: EmailLogListOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, channel: 'EMAIL' };

    if (options.status) {
      where.status = options.status;
    }

    if (options.recipientEmail) {
      where.recipientEmail = {
        contains: options.recipientEmail,
        mode: 'insensitive',
      };
    }

    if (options.entityType) {
      where.entityType = options.entityType;
    }

    if (options.entityId) {
      where.entityId = options.entityId;
    }

    if (options.templateCode) {
      where.templateCode = options.templateCode;
    }

    if (options.fromDate || options.toDate) {
      where.createdAt = {};
      if (options.fromDate) {
        where.createdAt.gte = new Date(options.fromDate);
      }
      if (options.toDate) {
        where.createdAt.lte = new Date(options.toDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.communicationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.prisma.communicationLog.count({ where }),
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

  async getLogById(tenantId: string, id: string) {
    const log = await this.prisma.communicationLog.findFirst({
      where: { id, tenantId, channel: 'EMAIL' },
      include: {
        template: true,
      },
    });

    if (!log) {
      throw new BadRequestException(`Email log not found: ${id}`);
    }

    return log;
  }

  async resend(tenantId: string, id: string, _userId: string) {
    const log = await this.getLogById(tenantId, id);

    if (log.status !== 'FAILED') {
      throw new BadRequestException('Can only resend failed emails');
    }

    // Attempt to resend
    const result = await this.sendGrid.sendEmail({
      to: log.recipientEmail!,
      toName: log.recipientName || undefined,
      subject: log.subject!,
      text: log.body,
      html: log.bodyHtml || log.body,
    });

    // Update log
    await this.prisma.communicationLog.update({
      where: { id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : undefined,
        retryCount: { increment: 1 },
        lastRetryAt: new Date(),
        providerMessageId: result.messageId || log.providerMessageId,
        errorMessage: result.error || log.errorMessage,
      },
    });

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  }

  async getStats(
    tenantId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<EmailStats> {
    const where: any = { tenantId, channel: 'EMAIL' };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [total, sent, delivered, opened, clicked, failed, bounced] =
      await Promise.all([
        this.prisma.communicationLog.count({ where }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'SENT' },
        }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'DELIVERED' },
        }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'OPENED' },
        }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'CLICKED' },
        }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'FAILED' },
        }),
        this.prisma.communicationLog.count({
          where: { ...where, status: 'BOUNCED' },
        }),
      ]);

    return { total, sent, delivered, opened, clicked, failed, bounced };
  }

  // Webhook handlers for tracking (called by external service)
  async handleDeliveryEvent(messageId: string) {
    await this.prisma.communicationLog.updateMany({
      where: { providerMessageId: messageId },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });
  }

  async handleOpenEvent(messageId: string) {
    await this.prisma.communicationLog.updateMany({
      where: { providerMessageId: messageId },
      data: { status: 'OPENED', openedAt: new Date() },
    });
  }

  async handleClickEvent(messageId: string) {
    await this.prisma.communicationLog.updateMany({
      where: { providerMessageId: messageId },
      data: { status: 'CLICKED', clickedAt: new Date() },
    });
  }

  async handleBounceEvent(messageId: string, reason?: string) {
    await this.prisma.communicationLog.updateMany({
      where: { providerMessageId: messageId },
      data: {
        status: 'BOUNCED',
        failedAt: new Date(),
        errorMessage: reason || 'Email bounced',
      },
    });
  }
}
