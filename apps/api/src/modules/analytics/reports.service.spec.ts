import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    report: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    reportExecution: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      report: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      reportExecution: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ReportsService);
  });

  it('lists reports with latest execution', async () => {
    prisma.report.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', deletedAt: null },
      }),
    );
  });

  it('throws when report not found', async () => {
    prisma.report.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'rep-1')).rejects.toThrow(NotFoundException);
  });

  it('creates report with defaults', async () => {
    prisma.report.create.mockResolvedValue({ id: 'rep-1' });

    await service.create('tenant-1', 'user-1', {
      name: 'Report',
      reportType: 'CUSTOM',
      sourceQuery: 'select 1',
    } as any);

    expect(prisma.report.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          outputFormat: 'PDF',
          isScheduled: false,
          isPublic: false,
          ownerId: 'user-1',
          status: 'ACTIVE',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('updates report after ensure', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1' });
    prisma.report.update.mockResolvedValue({ id: 'rep-1' });

    await service.update('tenant-1', 'user-1', 'rep-1', { name: 'Updated' } as any);

    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rep-1' },
        data: expect.objectContaining({ name: 'Updated', updatedById: 'user-1' }),
      }),
    );
  });

  it('updates report schedule', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1' });
    prisma.report.update.mockResolvedValue({ id: 'rep-1' });

    await service.updateSchedule('tenant-1', 'user-1', 'rep-1', {
      isScheduled: true,
      scheduleExpression: '0 1 * * *',
    } as any);

    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isScheduled: true, scheduleExpression: '0 1 * * *' }),
      }),
    );
  });

  it('soft deletes report', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1' });
    prisma.report.update.mockResolvedValue({ id: 'rep-1' });

    const result = await service.remove('tenant-1', 'rep-1');

    expect(result).toEqual({ success: true });
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date), status: 'INACTIVE' }),
      }),
    );
  });

  it('executes report and returns execution', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1', outputFormat: 'PDF' });
    prisma.reportExecution.create.mockResolvedValue({ id: 'exec-1' });
    prisma.reportExecution.update.mockResolvedValue({ id: 'exec-1' });
    prisma.reportExecution.findUnique.mockResolvedValue({ id: 'exec-1', status: 'COMPLETED' });

    const result = await service.execute('tenant-1', 'user-1', 'rep-1', { outputFormat: 'CSV' } as any);

    expect(result).toEqual({ id: 'exec-1', status: 'COMPLETED' });
    expect(prisma.reportExecution.create).toHaveBeenCalled();
    expect(prisma.reportExecution.update).toHaveBeenCalled();
  });

  it('returns executions with pagination', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1' });
    prisma.reportExecution.findMany.mockResolvedValue([{ id: 'exec-1' }]);
    prisma.reportExecution.count.mockResolvedValue(1);

    const result = await service.executions('tenant-1', 'rep-1', { page: 2, limit: 10 } as any);

    expect(result.total).toBe(1);
    expect(prisma.reportExecution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('throws when execution not found', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'rep-1' });
    prisma.reportExecution.findFirst.mockResolvedValue(null);

    await expect(
      service.execution('tenant-1', 'rep-1', 'exec-1'),
    ).rejects.toThrow(NotFoundException);
  });
});