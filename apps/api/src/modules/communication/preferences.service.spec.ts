import { Test, TestingModule } from '@nestjs/testing';
import { PreferencesService } from './preferences.service';
import { PrismaService } from '../../prisma.service';

describe('PreferencesService', () => {
  let service: PreferencesService;
  let prisma: {
    notificationPreference: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      upsert: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      notificationPreference: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PreferencesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PreferencesService);
  });

  it('creates defaults when preferences missing', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue(null);
    prisma.notificationPreference.create.mockResolvedValue({ id: 'pref-1' });

    await service.get('tenant-1', 'user-1');

    expect(prisma.notificationPreference.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          emailEnabled: true,
          inAppEnabled: true,
        }),
      }),
    );
  });

  it('updates existing preferences after ensuring get', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({ id: 'pref-1' });
    prisma.notificationPreference.update.mockResolvedValue({ id: 'pref-1' });

    await service.update('tenant-1', 'user-1', {
      loadAssigned: false,
      emailEnabled: false,
    });

    expect(prisma.notificationPreference.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_userId: { tenantId: 'tenant-1', userId: 'user-1' } },
        data: expect.objectContaining({
          loadAssigned: false,
          emailEnabled: false,
        }),
      }),
    );
  });

  it('resets preferences with upsert', async () => {
    prisma.notificationPreference.upsert.mockResolvedValue({ id: 'pref-1' });

    await service.reset('tenant-1', 'user-1');

    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId_userId: { tenantId: 'tenant-1', userId: 'user-1' } },
        update: expect.objectContaining({ emailEnabled: true }),
        create: expect.objectContaining({ emailEnabled: true }),
      }),
    );
  });

  it('returns false when notification type disabled', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      loadAssigned: false,
      emailEnabled: true,
      quietHoursEnabled: false,
    });

    const result = await service.shouldNotify(
      'tenant-1',
      'user-1',
      'loadAssigned',
      'email',
    );

    expect(result).toBe(false);
  });

  it('returns false when channel disabled', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      loadAssigned: true,
      emailEnabled: false,
      quietHoursEnabled: false,
    });

    const result = await service.shouldNotify(
      'tenant-1',
      'user-1',
      'loadAssigned',
      'email',
    );

    expect(result).toBe(false);
  });

  it('returns true when quiet hours disabled', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      loadAssigned: true,
      emailEnabled: true,
      quietHoursEnabled: false,
    });

    const result = await service.shouldNotify(
      'tenant-1',
      'user-1',
      'loadAssigned',
      'email',
    );

    expect(result).toBe(true);
  });

  it('returns false during quiet hours window', async () => {
    const fixed = new Date('2025-01-01T14:30:00.000Z');
    jest.useFakeTimers().setSystemTime(fixed);
    prisma.notificationPreference.findUnique.mockResolvedValue({
      loadAssigned: true,
      emailEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '08:00',
      quietHoursEnd: '23:00',
      quietHoursTimezone: 'UTC',
    });

    const result = await service.shouldNotify(
      'tenant-1',
      'user-1',
      'loadAssigned',
      'email',
    );

    jest.useRealTimers();
    expect(result).toBe(false);
  });

  it('returns true on invalid timezone', async () => {
    prisma.notificationPreference.findUnique.mockResolvedValue({
      loadAssigned: true,
      emailEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '08:00',
      quietHoursEnd: '23:00',
      quietHoursTimezone: 'Invalid/Zone',
    });

    const result = await service.shouldNotify(
      'tenant-1',
      'user-1',
      'loadAssigned',
      'email',
    );

    expect(result).toBe(true);
  });

  it('returns users for notification and channel', async () => {
    prisma.notificationPreference.findMany.mockResolvedValue([
      { userId: 'u1' },
      { userId: 'u2' },
    ]);

    const result = await service.getUsersForNotification(
      'tenant-1',
      'loadAssigned',
      'email',
    );

    expect(result).toEqual(['u1', 'u2']);
    expect(prisma.notificationPreference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          loadAssigned: true,
          emailEnabled: true,
        }),
        select: { userId: true },
      }),
    );
  });
});