import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: {
    inAppNotification: {
      create: jest.Mock;
      createMany: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
    };
    user: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      inAppNotification: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(NotificationsService);
  });

  it('creates notification with parsed expiresAt', async () => {
    prisma.inAppNotification.create.mockResolvedValue({ id: 'ntf-1' });

    await service.create('tenant-1', {
      userId: 'user-1',
      type: 'SYSTEM',
      title: 'Hello',
      message: 'World',
      expiresAt: '2025-01-01T00:00:00.000Z',
    } as any);

    expect(prisma.inAppNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          expiresAt: expect.any(Date),
        }),
      }),
    );
  });

  it('creates bulk notifications', async () => {
    prisma.inAppNotification.createMany.mockResolvedValue({ count: 2 });

    const result = await service.createBulk('tenant-1', {
      userIds: ['u1', 'u2'],
      type: 'ALERT',
      title: 'Bulk',
      message: 'Msg',
    } as any);

    expect(result).toEqual({ count: 2 });
    expect(prisma.inAppNotification.createMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Array) }),
    );
  });

  it('findAll applies filters and expiration', async () => {
    prisma.inAppNotification.findMany.mockResolvedValue([]);
    prisma.inAppNotification.count.mockResolvedValue(0);

    await service.findAll('tenant-1', 'user-1', {
      isRead: false,
      type: 'SYSTEM',
    });

    expect(prisma.inAppNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          deletedAt: null,
          isRead: false,
          type: 'SYSTEM',
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it('returns unread count with expiration rules', async () => {
    prisma.inAppNotification.count.mockResolvedValue(3);

    const result = await service.getUnreadCount('tenant-1', 'user-1');

    expect(result).toBe(3);
    expect(prisma.inAppNotification.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          isRead: false,
          deletedAt: null,
        }),
      }),
    );
  });

  it('marks notification as read', async () => {
    prisma.inAppNotification.findFirst.mockResolvedValue({ id: 'ntf-1' });
    prisma.inAppNotification.update.mockResolvedValue({ id: 'ntf-1' });

    const result = await service.markAsRead('tenant-1', 'user-1', 'ntf-1');

    expect(result).toEqual({ success: true, message: 'Notification marked as read' });
    expect(prisma.inAppNotification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ntf-1' },
        data: expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
      }),
    );
  });

  it('throws when marking read on missing notification', async () => {
    prisma.inAppNotification.findFirst.mockResolvedValue(null);

    await expect(
      service.markAsRead('tenant-1', 'user-1', 'ntf-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('marks all as read', async () => {
    prisma.inAppNotification.updateMany.mockResolvedValue({ count: 5 });

    const result = await service.markAllAsRead('tenant-1', 'user-1');

    expect(result).toEqual({ success: true, count: 5 });
    expect(prisma.inAppNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          isRead: false,
          deletedAt: null,
        }),
        data: expect.objectContaining({ isRead: true, readAt: expect.any(Date) }),
      }),
    );
  });

  it('soft deletes notification', async () => {
    prisma.inAppNotification.findFirst.mockResolvedValue({ id: 'ntf-1' });
    prisma.inAppNotification.update.mockResolvedValue({ id: 'ntf-1' });

    const result = await service.delete('tenant-1', 'user-1', 'ntf-1');

    expect(result).toEqual({ success: true, message: 'Notification deleted' });
    expect(prisma.inAppNotification.update).toHaveBeenCalledWith({
      where: { id: 'ntf-1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
    });
  });

  it('deletes expired notifications for tenant', async () => {
    prisma.inAppNotification.deleteMany.mockResolvedValue({ count: 2 });

    const result = await service.deleteExpired('tenant-1');

    expect(result).toEqual({ count: 2 });
    expect(prisma.inAppNotification.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          expiresAt: expect.any(Object),
          tenantId: 'tenant-1',
        }),
      }),
    );
  });

  it('notifies a single user through create', async () => {
    prisma.inAppNotification.create.mockResolvedValue({ id: 'ntf-1' });

    await service.notify('tenant-1', 'user-1', {
      type: 'SYSTEM',
      title: 'Title',
      message: 'Message',
    });

    expect(prisma.inAppNotification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          type: 'SYSTEM',
        }),
      }),
    );
  });

  it('notifies users by role via bulk create', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
    prisma.inAppNotification.createMany.mockResolvedValue({ count: 2 });

    const result = await service.notifyByRole('tenant-1', 'role-1', {
      type: 'ALERT',
      title: 'Alert',
      message: 'Message',
    });

    expect(result).toEqual({ count: 2 });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', roleId: 'role-1', status: 'ACTIVE' },
        select: { id: true },
      }),
    );
  });

  it('returns count 0 when no users match role', async () => {
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.notifyByRole('tenant-1', 'role-1', {
      type: 'ALERT',
      title: 'Alert',
      message: 'Message',
    });

    expect(result).toEqual({ count: 0 });
    expect(prisma.inAppNotification.createMany).not.toHaveBeenCalled();
  });
});