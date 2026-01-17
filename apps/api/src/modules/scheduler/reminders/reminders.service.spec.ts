import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../../../prisma.service';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      reminder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RemindersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RemindersService);
  });

  it('lists reminders', async () => {
    prisma.reminder.findMany.mockResolvedValue([]);

    await service.list('tenant-1', 'user-1');

    expect(prisma.reminder.findMany).toHaveBeenCalled();
  });

  it('throws when reminder not found', async () => {
    prisma.reminder.findFirst.mockResolvedValue(null);

    await expect(service.update('r1', {} as any, 'tenant-1', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('creates reminder', async () => {
    prisma.reminder.create.mockResolvedValue({ id: 'r1' });

    await service.create({ title: 'Test', remindAt: new Date().toISOString() } as any, 'tenant-1', 'user-1');

    expect(prisma.reminder.create).toHaveBeenCalled();
  });

  it('updates reminder fields', async () => {
    prisma.reminder.findFirst.mockResolvedValue({ id: 'r1', title: 'Old', remindAt: new Date(), isRecurring: false });
    prisma.reminder.update.mockResolvedValue({ id: 'r1', title: 'New' });

    const result = await service.update('r1', { title: 'New', isRecurring: true } as any, 'tenant-1', 'user-1');

    expect(result.title).toBe('New');
  });

  it('snoozes reminder', async () => {
    prisma.reminder.findFirst.mockResolvedValue({ id: 'r1', remindAt: new Date(), snoozeCount: 0 });
    prisma.reminder.update.mockResolvedValue({ id: 'r1' });

    await service.snooze('r1', { minutes: 10 } as any, 'tenant-1', 'user-1');

    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'SNOOZED' }) }),
    );
  });

  it('snoozes using existing snoozedUntil', async () => {
    const base = new Date('2026-01-01T00:00:00Z');
    prisma.reminder.findFirst.mockResolvedValue({ id: 'r1', snoozedUntil: base, snoozeCount: 1 });
    prisma.reminder.update.mockResolvedValue({ id: 'r1' });

    await service.snooze('r1', { minutes: 10 } as any, 'tenant-1', 'user-1');

    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ snoozeCount: 2 }) }),
    );
  });

  it('dismisses reminder', async () => {
    prisma.reminder.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.reminder.update.mockResolvedValue({ id: 'r1' });

    await service.dismiss('r1', 'tenant-1', 'user-1');

    expect(prisma.reminder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DISMISSED' }) }),
    );
  });

  it('removes reminder', async () => {
    prisma.reminder.findFirst.mockResolvedValue({ id: 'r1' });
    prisma.reminder.update.mockResolvedValue({ id: 'r1' });

    const result = await service.remove('r1', 'tenant-1', 'user-1');

    expect(result.id).toBe('r1');
  });
});
