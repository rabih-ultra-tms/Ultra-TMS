import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../../prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CommunicationsService (MP-07-018)', () => {
  let service: CommunicationsService;
  let prisma: any;

  const createMockPrisma = () => ({
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    notificationTemplate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    notificationPreference: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  });

  beforeAll(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Message CRUD', () => {
    it('should create a message', async () => {
      const mockMsg = {
        id: 'msg-1',
        content: 'Test message',
        tenantId: 'tenant-1',
        threadId: 't1',
      };
      prisma.inAppNotification.create.mockResolvedValue(mockMsg);

      const result = await service.createMessage(
        { content: 'Test message', threadId: 't1' },
        'tenant-1'
      );

      expect(result.id).toBe('msg-1');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should throw when message content is empty', async () => {
      await expect(
        service.createMessage({ content: '' }, 'tenant-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should retrieve messages with pagination', async () => {
      const messages = [
        {
          id: 'msg-1',
          content: 'First',
          tenantId: 'tenant-1',
          deletedAt: null,
          archivedAt: null,
        },
        {
          id: 'msg-2',
          content: 'Second',
          tenantId: 'tenant-1',
          deletedAt: null,
          archivedAt: null,
        },
      ];

      prisma.inAppNotification.findMany.mockResolvedValue(messages);
      prisma.inAppNotification.count.mockResolvedValue(2);

      const result = await service.listMessages('tenant-1');

      expect(result.data.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter deleted messages from list', async () => {
      prisma.inAppNotification.findMany.mockResolvedValue([]);
      prisma.inAppNotification.count.mockResolvedValue(0);

      await service.listMessages('tenant-1');

      expect(prisma.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            deletedAt: null,
            archivedAt: null,
          }),
        })
      );
    });

    it('should get specific message', async () => {
      const mockMsg = {
        id: 'msg-1',
        content: 'Test',
        tenantId: 'tenant-1',
        deletedAt: null,
      };
      prisma.inAppNotification.findFirst.mockResolvedValue(mockMsg);

      const result = await service.getMessage('msg-1', 'tenant-1');

      expect(result.id).toBe('msg-1');
      expect(result.message).toBe('Test');
    });

    it('should throw not found for missing message', async () => {
      prisma.inAppNotification.findFirst.mockResolvedValue(null);

      await expect(service.getMessage('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should enforce tenantId in findFirst', async () => {
      prisma.inAppNotification.findFirst.mockResolvedValue(null);

      await expect(service.getMessage('msg-1', 'tenant-1')).rejects.toThrow(
        NotFoundException
      );

      expect(prisma.inAppNotification.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'msg-1',
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('Message Threads', () => {
    it('should get all messages in thread', async () => {
      const messages = [
        {
          id: 'msg-1',
          content: 'Hi',
          threadId: 'thread-1',
          tenantId: 'tenant-1',
        },
        {
          id: 'msg-2',
          content: 'Hello',
          threadId: 'thread-1',
          tenantId: 'tenant-1',
        },
      ];

      prisma.inAppNotification.findMany.mockResolvedValue(messages);

      const result = await service.getThread('thread-1', 'tenant-1');

      expect(result.messageCount).toBe(2);
      expect(result.messages.length).toBe(2);
    });

    it('should filter by tenant in thread', async () => {
      const messages = [
        {
          id: 'msg-1',
          content: 'T1',
          threadId: 'thread-1',
          tenantId: 'tenant-1',
        },
      ];

      prisma.inAppNotification.findMany.mockResolvedValue(messages);

      await service.getThread('thread-1', 'tenant-1');

      expect(prisma.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        })
      );
    });

    it('should throw for empty thread', async () => {
      prisma.inAppNotification.findMany.mockResolvedValue([]);

      await expect(service.getThread('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('Message Archive', () => {
    it('should archive a message', async () => {
      const mockMsg = {
        id: 'msg-1',
        content: 'Test',
        tenantId: 'tenant-1',
        deletedAt: null,
      };
      const archived = { ...mockMsg, archivedAt: new Date() };

      prisma.inAppNotification.findFirst.mockResolvedValue(mockMsg);
      prisma.inAppNotification.update.mockResolvedValue(archived);

      const result = await service.archiveMessage('msg-1', 'tenant-1');

      expect(result.isRead).toBe(true);
    });

    it('should not return archived messages in list', async () => {
      prisma.inAppNotification.findMany.mockResolvedValue([]);
      prisma.inAppNotification.count.mockResolvedValue(0);

      await service.listMessages('tenant-1');

      expect(prisma.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('Template Management', () => {
    it('should create a template', async () => {
      const mockTemplate = {
        id: 'tmpl-1',
        name: 'Welcome',
        body: 'Hello {{name}}',
        tenantId: 'tenant-1',
      };

      prisma.inAppNotificationTemplate.create.mockResolvedValue(mockTemplate);

      const result = await service.createTemplate(
        { name: 'Welcome', body: 'Hello {{name}}', variables: ['name'] },
        'tenant-1'
      );

      expect(result.id).toBe('tmpl-1');
      expect(result.name).toBe('Welcome');
    });

    it('should throw when name or body missing', async () => {
      await expect(
        service.createTemplate({ name: 'Test', body: '' }, 'tenant-1')
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.createTemplate({ name: '', body: 'Body' }, 'tenant-1')
      ).rejects.toThrow(BadRequestException);
    });

    it('should list templates for tenant', async () => {
      const templates = [
        {
          id: 'tmpl-1',
          name: 'Welcome',
          tenantId: 'tenant-1',
          deletedAt: null,
        },
      ];

      prisma.inAppNotificationTemplate.findMany.mockResolvedValue(templates);

      const result = await service.listTemplates('tenant-1');

      expect(result.length).toBe(1);
      expect(result[0]?.name).toBe('Welcome');
    });

    it('should enforce tenantId in list templates', async () => {
      prisma.inAppNotificationTemplate.findMany.mockResolvedValue([]);

      await service.listTemplates('tenant-1');

      expect(prisma.inAppNotificationTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        })
      );
    });

    it('should get specific template', async () => {
      const mockTemplate = {
        id: 'tmpl-1',
        name: 'Welcome',
        body: 'Hello {{name}}',
        tenantId: 'tenant-1',
        deletedAt: null,
      };

      prisma.inAppNotificationTemplate.findFirst.mockResolvedValue(
        mockTemplate
      );

      const result = await service.getTemplate('tmpl-1', 'tenant-1');

      expect(result.id).toBe('tmpl-1');
    });

    it('should delete template', async () => {
      const mockTemplate = {
        id: 'tmpl-1',
        name: 'Welcome',
        tenantId: 'tenant-1',
        deletedAt: null,
      };
      const deleted = { ...mockTemplate, deletedAt: new Date() };

      prisma.inAppNotificationTemplate.findFirst.mockResolvedValue(
        mockTemplate
      );
      prisma.inAppNotificationTemplate.update.mockResolvedValue(deleted);

      const result = await service.deleteTemplate('tmpl-1', 'tenant-1');

      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', async () => {
      const rendered = service.renderTemplate('tmpl-1', {
        name: 'John',
        company: 'ACME',
      });

      expect(typeof rendered).toBe('string');
    });

    it('should handle missing variables gracefully', async () => {
      const rendered = service.renderTemplate('tmpl-1', {});

      expect(rendered).toBe('');
    });
  });

  describe('Notification Preferences', () => {
    it('should save notification preferences', async () => {
      const prefs = {
        loadAssigned: true,
        loadAccepted: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '06:00',
      };

      const mockPrefs = {
        id: 'pref-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        ...prefs,
      };

      prisma.inAppNotificationPreference.findFirst.mockResolvedValue(null);
      prisma.inAppNotificationPreference.create.mockResolvedValue(mockPrefs);

      const result = await service.updatePreferences(
        'user-1',
        'tenant-1',
        prefs
      );

      expect(result.loadAssigned).toBe(true);
      expect(result.loadStatusChange).toBe(false);
    });

    it('should merge preferences on update', async () => {
      const existing = {
        id: 'pref-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        loadAssigned: true,
      };
      const updated = { ...existing, documentReceived: false };

      prisma.inAppNotificationPreference.findFirst.mockResolvedValue(existing);
      prisma.inAppNotificationPreference.update.mockResolvedValue(updated);

      const result = await service.updatePreferences('user-1', 'tenant-1', {
        documentReceived: false,
      });

      expect(result.loadAssigned).toBe(true);
      expect(result.documentReceived).toBe(false);
    });

    it('should get preferences with defaults', async () => {
      prisma.inAppNotificationPreference.findFirst.mockResolvedValue(null);

      const result = await service.getPreferences('user-1', 'tenant-1');

      expect(result.userId).toBe('user-1');
      expect(result.tenantId).toBe('tenant-1');
      expect(result.loadAssigned).toBe(true); // default
      expect(result.documentReceived).toBe(true); // default
    });

    it('should get saved preferences', async () => {
      const savedPrefs = {
        id: 'pref-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        loadAssigned: false,
        loadAccepted: true,
      };

      prisma.inAppNotificationPreference.findFirst.mockResolvedValue(
        savedPrefs
      );

      const result = await service.getPreferences('user-1', 'tenant-1');

      expect(result.loadAssigned).toBe(false);
      expect(result.loadStatusChange).toBe(true);
    });
  });

  describe('Message Deletion', () => {
    it('should soft-delete a message', async () => {
      const mockMsg = {
        id: 'msg-1',
        content: 'Delete me',
        tenantId: 'tenant-1',
        deletedAt: null,
      };
      const deleted = { ...mockMsg, deletedAt: new Date() };

      prisma.inAppNotification.findFirst.mockResolvedValue(mockMsg);
      prisma.inAppNotification.update.mockResolvedValue(deleted);

      const result = await service.deleteMessage('msg-1', 'tenant-1');

      expect(result.deletedAt).toBeDefined();
    });

    it('should throw when deleting non-existent message', async () => {
      prisma.inAppNotification.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteMessage('missing', 'tenant-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Statistics', () => {
    it('should return message statistics', async () => {
      prisma.inAppNotification.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // unread
        .mockResolvedValueOnce(80); // read

      const result = await service.getStatistics('tenant-1');

      expect(result.total).toBe(100);
      expect(result.unread).toBe(20);
      expect(result.read).toBe(80);
    });

    it('should enforce tenantId in statistics', async () => {
      prisma.inAppNotification.count.mockResolvedValue(0);

      await service.getStatistics('tenant-1');

      // Verify all count calls include tenantId
      expect(prisma.inAppNotification.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
          }),
        })
      );
    });
  });
});
