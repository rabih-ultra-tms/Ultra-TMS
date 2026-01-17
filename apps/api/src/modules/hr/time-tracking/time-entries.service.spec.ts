import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { PrismaService } from '../../../prisma.service';

describe('TimeEntriesService', () => {
  let service: TimeEntriesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      timeEntry: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
      employee: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeEntriesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TimeEntriesService);
  });

  it('lists time entries', async () => {
    prisma.timeEntry.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.timeEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' }, orderBy: { clockIn: 'desc' } }),
    );
  });

  it('requires employeeId on create', async () => {
    await expect(service.create('tenant-1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('creates time entry with duration', async () => {
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.timeEntry.create.mockResolvedValue({ id: 't1' });

    const clockIn = new Date('2025-01-01T08:00:00Z').toISOString();
    const clockOut = new Date('2025-01-01T09:00:00Z').toISOString();

    await service.create('tenant-1', { employeeId: 'e1', clockIn, clockOut } as any);

    expect(prisma.timeEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ durationHours: 1 }) }),
    );
  });

  it('throws when time entry missing', async () => {
    prisma.timeEntry.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('updates time entry and duration', async () => {
    prisma.timeEntry.findFirst.mockResolvedValue({
      id: 't1',
      employeeId: 'e1',
      locationId: null,
      clockIn: new Date('2025-01-01T08:00:00Z'),
      clockOut: new Date('2025-01-01T10:00:00Z'),
      notes: null,
    });
    prisma.employee.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.timeEntry.update.mockResolvedValue({ id: 't1' });

    await service.update('tenant-1', 't1', { clockOut: new Date('2025-01-01T11:00:00Z') } as any);

    expect(prisma.timeEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ durationHours: 3 }) }),
    );
  });

  it('approves time entry', async () => {
    prisma.timeEntry.findFirst.mockResolvedValue({ id: 't1', notes: 'n' });
    prisma.timeEntry.update.mockResolvedValue({ id: 't1' });

    await service.approve('tenant-1', 't1', 'manager-1', { notes: 'ok' } as any);

    expect(prisma.timeEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ approvedBy: 'manager-1', approvedAt: expect.any(Date) }) }),
    );
  });

  it('returns summary totals', async () => {
    prisma.timeEntry.aggregate.mockResolvedValue({ _sum: { durationHours: 8 }, _count: { _all: 3 } });

    const result = await service.summary('tenant-1');

    expect(result).toEqual({ entries: 3, totalHours: 8 });
  });
});
