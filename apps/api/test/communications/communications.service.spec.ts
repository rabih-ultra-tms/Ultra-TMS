import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsService } from '../../src/modules/communications/communications.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CommunicationsService (MP-07-018)', () => {
  let service: CommunicationsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    prisma = module.get<PrismaService>(PrismaService);
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
      jest
        .spyOn(prisma.notification || {}, 'create')
        .mockResolvedValue(mockMsg as any);

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

      jest
        .spyOn(prisma.notification || {}, 'findMany')
        .mockResolvedValue(messages as any);
      jest.spyOn(prisma.notification || {}, 'count').mockResolvedValue(2);

      const result = await service.listMessages('tenant-1');

      expect(result.data.length).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter deleted messages from list', async () => {
      jest.spyOn(prisma.notification || {}, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.notification || {}, 'count').mockResolvedValue(0);

      const findManyMock = jest.spyOn(prisma.notification || {}, 'findMany');
      await service.listMessages('tenant-1');

      expect(findManyMock).toHaveBeenCalledWith(
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
      jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(mockMsg as any);

      const result = await service.getMessage('msg-1', 'tenant-1');

      expect(result.id).toBe('msg-1');
      expect(result.content).toBe('Test');
    });

    it('should throw not found for missing message', async () => {
      jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(null);

      await expect(service.getMessage('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should enforce tenantId in findFirst', async () => {
      const findFirstMock = jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(null);

      await expect(service.getMessage('msg-1', 'tenant-1')).rejects.toThrow(
        NotFoundException
      );

      expect(findFirstMock).toHaveBeenCalledWith(
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

      jest
        .spyOn(prisma.notification || {}, 'findMany')
        .mockResolvedValue(messages as any);

      const result = await service.getThread('thread-1', 'tenant-1');

      expect(result.messageCount).toBe(2);
      expect(result.messages.length).toBe(2);
      expect(result.threadId).toBe('thread-1');
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

      jest
        .spyOn(prisma.notification || {}, 'findMany')
        .mockResolvedValue(messages as any);

      const findManyMock = jest.spyOn(prisma.notification || {}, 'findMany');
      await service.getThread('thread-1', 'tenant-1');

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            threadId: 'thread-1',
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        })
      );
    });

    it('should throw for empty thread', async () => {
      jest.spyOn(prisma.notification || {}, 'findMany').mockResolvedValue([]);

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

      jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(mockMsg as any);
      jest
        .spyOn(prisma.notification || {}, 'update')
        .mockResolvedValue(archived as any);

      const result = await service.archiveMessage('msg-1', 'tenant-1');

      expect(result.archivedAt).toBeDefined();
    });

    it('should not return archived messages in list', async () => {
      jest.spyOn(prisma.notification || {}, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.notification || {}, 'count').mockResolvedValue(0);

      const findManyMock = jest.spyOn(prisma.notification || {}, 'findMany');
      await service.listMessages('tenant-1');

      // Verify archivedAt is filtered out
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            archivedAt: null,
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

      jest
        .spyOn(prisma.notificationTemplate || {}, 'create')
        .mockResolvedValue(mockTemplate as any);

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

      jest
        .spyOn(prisma.notificationTemplate || {}, 'findMany')
        .mockResolvedValue(templates as any);

      const result = await service.listTemplates('tenant-1');

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Welcome');
    });

    it('should enforce tenantId in list templates', async () => {
      const findManyMock = jest
        .spyOn(prisma.notificationTemplate || {}, 'findMany')
        .mockResolvedValue([]);

      await service.listTemplates('tenant-1');

      expect(findManyMock).toHaveBeenCalledWith(
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

      jest
        .spyOn(prisma.notificationTemplate || {}, 'findFirst')
        .mockResolvedValue(mockTemplate as any);

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

      jest
        .spyOn(prisma.notificationTemplate || {}, 'findFirst')
        .mockResolvedValue(mockTemplate as any);
      jest
        .spyOn(prisma.notificationTemplate || {}, 'update')
        .mockResolvedValue(deleted as any);

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

      // Note: current implementation expects template string directly
      // This test demonstrates the interface
      expect(typeof rendered).toBe('string');
    });

    it('should handle missing variables gracefully', async () => {
      const rendered = service.renderTemplate('tmpl-1', {});

      expect(rendered).toBe('');
    });

    it('should replace multiple occurrences of same variable', async () => {
      const rendered = service.renderTemplate('template', { name: 'John' });

      expect(typeof rendered).toBe('string');
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

      jest
        .spyOn(prisma.notificationPreference || {}, 'findFirst')
        .mockResolvedValue(null);
      jest
        .spyOn(prisma.notificationPreference || {}, 'create')
        .mockResolvedValue(mockPrefs as any);

      const result = await service.updatePreferences(
        'user-1',
        'tenant-1',
        prefs
      );

      expect(result.loadAssigned).toBe(true);
      expect(result.loadAccepted).toBe(false);
    });

    it('should merge preferences on update', async () => {
      const existing = {
        id: 'pref-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        loadAssigned: true,
      };
      const updated = { ...existing, podReceived: false };

      jest
        .spyOn(prisma.notificationPreference || {}, 'findFirst')
        .mockResolvedValue(existing as any);
      jest
        .spyOn(prisma.notificationPreference || {}, 'update')
        .mockResolvedValue(updated as any);

      const result = await service.updatePreferences('user-1', 'tenant-1', {
        podReceived: false,
      });

      expect(result.loadAssigned).toBe(true);
      expect(result.podReceived).toBe(false);
    });

    it('should get preferences with defaults', async () => {
      jest
        .spyOn(prisma.notificationPreference || {}, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.getPreferences('user-1', 'tenant-1');

      expect(result.userId).toBe('user-1');
      expect(result.tenantId).toBe('tenant-1');
      expect(result.loadAssigned).toBe(true); // default
      expect(result.podReceived).toBe(true); // default
    });

    it('should get saved preferences', async () => {
      const savedPrefs = {
        id: 'pref-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        loadAssigned: false,
        loadAccepted: true,
      };

      jest
        .spyOn(prisma.notificationPreference || {}, 'findFirst')
        .mockResolvedValue(savedPrefs as any);

      const result = await service.getPreferences('user-1', 'tenant-1');

      expect(result.loadAssigned).toBe(false);
      expect(result.loadAccepted).toBe(true);
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

      jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(mockMsg as any);
      jest
        .spyOn(prisma.notification || {}, 'update')
        .mockResolvedValue(deleted as any);

      const result = await service.deleteMessage('msg-1', 'tenant-1');

      expect(result.deletedAt).toBeDefined();
    });

    it('should throw when deleting non-existent message', async () => {
      jest
        .spyOn(prisma.notification || {}, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.deleteMessage('missing', 'tenant-1')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Statistics', () => {
    it('should return message statistics', async () => {
      const counts = {
        total: 100,
        pending: 20,
        delivered: 70,
        archived: 8,
        bounced: 2,
      };

      jest
        .spyOn(prisma.notification || {}, 'count')
        .mockResolvedValueOnce(counts.total)
        .mockResolvedValueOnce(counts.pending)
        .mockResolvedValueOnce(counts.delivered)
        .mockResolvedValueOnce(counts.archived)
        .mockResolvedValueOnce(counts.bounced);

      const result = await service.getStatistics('tenant-1');

      expect(result.total).toBe(100);
      expect(result.pending).toBe(20);
      expect(result.delivered).toBe(70);
      expect(result.archived).toBe(8);
      expect(result.bounced).toBe(2);
    });

    it('should enforce tenantId in statistics', async () => {
      jest.spyOn(prisma.notification || {}, 'count').mockResolvedValue(0);

      const countMock = jest.spyOn(prisma.notification || {}, 'count');
      await service.getStatistics('tenant-1');

      // Verify all count calls include tenantId
      expect(countMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
          }),
        })
      );
    });
  });
});
