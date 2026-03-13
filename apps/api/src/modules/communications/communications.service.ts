import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface CreateMessageDto {
  content: string;
  threadId?: string;
  recipientId?: string;
  subject?: string;
  type?: 'SYSTEM' | 'USER' | 'NOTIFICATION';
}

export interface CreateTemplateDto {
  name: string;
  body: string;
  variables?: string[];
  subject?: string;
}

export interface NotificationPreferencesDto {
  loadAssigned?: boolean;
  loadAccepted?: boolean;
  podReceived?: boolean;
  invoiceReady?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

/**
 * CommunicationsService
 * Manages notifications, messages, templates, and communication preferences
 * Enforces multi-tenant isolation on all operations
 */
@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new message
   */
  async createMessage(
    dto: CreateMessageDto,
    tenantId: string,
    userId?: string
  ) {
    if (!dto.content) {
      throw new BadRequestException('Message content is required');
    }

    return this.prisma.notification.create({
      data: {
        tenantId,
        content: dto.content,
        subject: dto.subject,
        type: dto.type || 'USER',
        threadId: dto.threadId,
        recipientId: dto.recipientId,
        status: 'PENDING',
        createdBy: userId,
      },
    });
  }

  /**
   * List all messages for tenant
   */
  async listMessages(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          tenantId,
          deletedAt: null,
          archivedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({
        where: {
          tenantId,
          deletedAt: null,
          archivedAt: null,
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific message
   */
  async getMessage(id: string, tenantId: string) {
    const message = await this.prisma.notification.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  /**
   * Get all messages in a thread
   */
  async getThread(threadId: string, tenantId: string) {
    const messages = await this.prisma.notification.findMany({
      where: {
        threadId,
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (messages.length === 0) {
      throw new NotFoundException('Thread not found');
    }

    return {
      threadId,
      messageCount: messages.length,
      messages,
    };
  }

  /**
   * Archive a message
   */
  async archiveMessage(id: string, tenantId: string) {
    const message = await this.prisma.notification.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  /**
   * Create a notification template
   */
  async createTemplate(dto: CreateTemplateDto, tenantId: string) {
    if (!dto.name || !dto.body) {
      throw new BadRequestException('Template name and body are required');
    }

    return this.prisma.notificationTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        body: dto.body,
        subject: dto.subject,
        variables: dto.variables || [],
      },
    });
  }

  /**
   * List all templates for tenant
   */
  async listTemplates(tenantId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific template
   */
  async getTemplate(id: string, tenantId: string) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  /**
   * Render template with variable substitution
   */
  renderTemplate(
    templateId: string,
    variables: Record<string, string>
  ): string {
    // This is a simplified implementation
    // In production, would fetch template from DB first
    let rendered = '';

    // Replace {{variable}} patterns with values
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return rendered;
  }

  /**
   * Save notification preferences for a user
   */
  async updatePreferences(
    userId: string,
    tenantId: string,
    preferences: NotificationPreferencesDto
  ) {
    // Get existing preferences or create new
    let existing = await this.prisma.notificationPreference.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!existing) {
      return this.prisma.notificationPreference.create({
        data: {
          userId,
          tenantId,
          ...preferences,
        },
      });
    }

    // Merge with existing
    return this.prisma.notificationPreference.update({
      where: { id: existing.id },
      data: preferences,
    });
  }

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string, tenantId: string) {
    const prefs = await this.prisma.notificationPreference.findFirst({
      where: {
        userId,
        tenantId,
      },
    });

    if (!prefs) {
      // Return defaults if not set
      return {
        userId,
        tenantId,
        loadAssigned: true,
        loadAccepted: true,
        podReceived: true,
        invoiceReady: true,
        quietHoursStart: null,
        quietHoursEnd: null,
      };
    }

    return prefs;
  }

  /**
   * Delete (soft) a message
   */
  async deleteMessage(id: string, tenantId: string) {
    const message = await this.prisma.notification.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Delete (soft) a template
   */
  async deleteTemplate(id: string, tenantId: string) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get message statistics for tenant
   */
  async getStatistics(tenantId: string) {
    const [total, pending, delivered, archived, bounced] = await Promise.all([
      this.prisma.notification.count({
        where: { tenantId, deletedAt: null },
      }),
      this.prisma.notification.count({
        where: { tenantId, status: 'PENDING', deletedAt: null },
      }),
      this.prisma.notification.count({
        where: { tenantId, status: 'DELIVERED', deletedAt: null },
      }),
      this.prisma.notification.count({
        where: { tenantId, archivedAt: { not: null }, deletedAt: null },
      }),
      this.prisma.notification.count({
        where: { tenantId, status: 'BOUNCED', deletedAt: null },
      }),
    ]);

    return {
      total,
      pending,
      delivered,
      archived,
      bounced,
    };
  }
}
