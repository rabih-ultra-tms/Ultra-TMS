import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationsService } from '../../src/modules/communications/communications.service';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('CommunicationsService (MP-07-018)', () => {
  let service: CommunicationsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunicationsService, PrismaService],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Message CRUD', () => {
    it('should create a message', async () => {
      const result = await service.createMessage(
        { content: 'Test message', threadId: 't1' },
        'tenant-1'
      );
      expect(result).toHaveProperty('id');
    });

    it('should retrieve messages', async () => {
      const result = await service.listMessages('tenant-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Template Rendering', () => {
    it('should render template with variables', async () => {
      const template = await service.createTemplate(
        {
          name: 'Welcome',
          body: 'Hello {{name}}, welcome to {{company}}',
          variables: ['name', 'company'],
        },
        'tenant-1'
      );

      const rendered = service.renderTemplate(template.id, {
        name: 'John',
        company: 'ACME',
      });

      expect(rendered).toBe('Hello John, welcome to ACME');
    });
  });

  describe('Notification Preferences', () => {
    it('should save and retrieve notification preferences', async () => {
      const prefs = {
        loadAssigned: true,
        loadAccepted: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '06:00',
      };

      await service.updatePreferences('user-1', 'tenant-1', prefs);
      const result = await service.getPreferences('user-1', 'tenant-1');
      expect(result.loadAssigned).toBe(true);
      expect(result.loadAccepted).toBe(false);
    });
  });
});
