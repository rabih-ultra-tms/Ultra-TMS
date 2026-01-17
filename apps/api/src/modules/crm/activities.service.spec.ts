import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../../prisma.service';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      activity: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivitiesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ActivitiesService);
  });

  it('finds activities with completed filter', async () => {
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(0);

    await service.findAll('tenant-1', { completed: true } as any);

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ completedAt: { not: null } }) }),
    );
  });

  it('throws when activity missing', async () => {
    prisma.activity.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('returns activity by id', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1', subject: 'Call' });

    const result = await service.findOne('tenant-1', 'a1');

    expect(result).toEqual({ id: 'a1', subject: 'Call' });
    expect(prisma.activity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'a1', tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('creates activity', async () => {
    prisma.activity.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'user-1', { activityType: 'TASK', subject: 'Call' } as any);

    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it('updates activity and sets updatedById', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.activity.update.mockResolvedValue({ id: 'a1', subject: 'Updated' });

    const result = await service.update('tenant-1', 'a1', 'user-1', { subject: 'Updated' } as any);

    expect(result.subject).toBe('Updated');
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'a1' },
        data: expect.objectContaining({ subject: 'Updated', updatedById: 'user-1' }),
      }),
    );
  });

  it('deletes activity with soft delete', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.activity.update.mockResolvedValue({ id: 'a1' });

    const result = await service.delete('tenant-1', 'a1', 'user-1');

    expect(result).toEqual({ success: true });
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
      }),
    );
  });

  it('returns upcoming activities for user', async () => {
    prisma.activity.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.getUpcoming('tenant-1', 'user-1', 3);

    expect(result).toEqual([{ id: 'a1' }]);
    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', ownerId: 'user-1', completedAt: null }),
      }),
    );
  });

  it('returns my tasks without completed by default', async () => {
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(0);

    await service.getMyTasks('tenant-1', 'user-1');

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ activityType: 'TASK', completedAt: null }),
      }),
    );
  });

  it('returns overdue tasks', async () => {
    prisma.activity.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.getOverdueTasks('tenant-1', 'user-1');

    expect(result).toEqual([{ id: 'a1' }]);
    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ activityType: 'TASK', completedAt: null, dueDate: expect.any(Object) }),
      }),
    );
  });

  it('marks activity complete', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.activity.update.mockResolvedValue({ id: 'a1' });

    await service.markComplete('tenant-1', 'a1', 'user-1');

    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }),
    );
  });

  it('reopens task and clears completion', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.activity.update.mockResolvedValue({ id: 'a1', status: 'PENDING' });

    const result = await service.reopenTask('tenant-1', 'a1', 'user-1');

    expect(result.status).toBe('PENDING');
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ completedAt: null, status: 'PENDING' }) }),
    );
  });

  it('reschedules activity with new due date', async () => {
    prisma.activity.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.activity.update.mockResolvedValue({ id: 'a1' });

    await service.reschedule('tenant-1', 'a1', 'user-1', '2026-02-01T00:00:00Z');

    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dueDate: new Date('2026-02-01T00:00:00Z'), updatedById: 'user-1' }),
      }),
    );
  });

  it('returns stats', async () => {
    prisma.activity.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);

    const result = await service.getStats('tenant-1');

    expect(result.total).toBe(5);
    expect(result.overdue).toBe(1);
  });
});
