import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateNotificationDto, CreateBulkNotificationDto } from './dto';

export interface NotificationListOptions {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.inAppNotification.create({
      data: {
        tenantId,
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        icon: dto.icon,
        actionUrl: dto.actionUrl,
        entityType: dto.entityType,
        entityId: dto.entityId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    this.logger.log(
      `Notification created for user ${dto.userId}: ${dto.title}`,
    );

    // TODO: Emit WebSocket event for real-time delivery
    // this.eventEmitter.emit('notification.created', notification);

    return notification;
  }

  async createBulk(tenantId: string, dto: CreateBulkNotificationDto) {
    const notifications = await this.prisma.inAppNotification.createMany({
      data: dto.userIds.map((userId) => ({
        tenantId,
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        icon: dto.icon,
        actionUrl: dto.actionUrl,
        entityType: dto.entityType,
        entityId: dto.entityId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      })),
    });

    this.logger.log(
      `Bulk notifications created for ${dto.userIds.length} users: ${dto.title}`,
    );

    return { count: notifications.count };
  }

  async findAll(
    tenantId: string,
    userId: string,
    options: NotificationListOptions,
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      userId,
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options.type) {
      where.type = options.type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.inAppNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inAppNotification.count({ where }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.prisma.inAppNotification.count({
      where: {
        tenantId,
        userId,
        isRead: false,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async markAsRead(tenantId: string, userId: string, id: string) {
    const notification = await this.prisma.inAppNotification.findFirst({
      where: { id, tenantId, userId, deletedAt: null },
    });

    if (!notification) {
      throw new NotFoundException(`Notification not found: ${id}`);
    }

    await this.prisma.inAppNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true, message: 'Notification marked as read' };
  }

  async markAllAsRead(tenantId: string, userId: string) {
    const result = await this.prisma.inAppNotification.updateMany({
      where: {
        tenantId,
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);

    return { success: true, count: result.count };
  }

  async delete(tenantId: string, userId: string, id: string) {
    const notification = await this.prisma.inAppNotification.findFirst({
      where: { id, tenantId, userId, deletedAt: null },
    });

    if (!notification) {
      throw new NotFoundException(`Notification not found: ${id}`);
    }

    await this.prisma.inAppNotification.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true, message: 'Notification deleted' };
  }

  async deleteExpired(tenantId?: string) {
    const result = await this.prisma.inAppNotification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        ...(tenantId ? { tenantId } : {}),
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired notifications`);
    }

    return { count: result.count };
  }

  // Helper method for other services to send notifications
  async notify(
    tenantId: string,
    userId: string,
    options: {
      type: string;
      title: string;
      message: string;
      icon?: string;
      actionUrl?: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    return this.create(tenantId, {
      userId,
      type: options.type as any,
      title: options.title,
      message: options.message,
      icon: options.icon,
      actionUrl: options.actionUrl,
      entityType: options.entityType,
      entityId: options.entityId,
    });
  }

  // Bulk notify by role or department
  async notifyByRole(
    tenantId: string,
    roleId: string,
    options: {
      type: string;
      title: string;
      message: string;
      icon?: string;
      actionUrl?: string;
      entityType?: string;
      entityId?: string;
    },
  ) {
    const users = await this.prisma.user.findMany({
      where: { tenantId, roleId, status: 'ACTIVE' },
      select: { id: true },
    });

    if (users.length === 0) {
      return { count: 0 };
    }

    return this.createBulk(tenantId, {
      userIds: users.map((u) => u.id),
      type: options.type as any,
      title: options.title,
      message: options.message,
      icon: options.icon,
      actionUrl: options.actionUrl,
      entityType: options.entityType,
      entityId: options.entityId,
    });
  }
}
