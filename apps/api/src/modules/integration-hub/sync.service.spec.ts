import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExecutionStatus } from '@prisma/client';
import { SyncService } from './sync.service';
import { PrismaService } from '../../prisma.service';

describe('SyncService', () => {
  let service: SyncService;
  let prisma: {
    syncJob: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
    integration: { findFirst: jest.Mock };
    aPIRequestLog: { findMany: jest.Mock; count: jest.Mock; findFirst: jest.Mock };
    transformationTemplate: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      syncJob: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      integration: { findFirst: jest.fn() },
      aPIRequestLog: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
      transformationTemplate: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SyncService);
  });

  it('lists jobs with filters', async () => {
    prisma.syncJob.findMany.mockResolvedValue([
      {
        id: 'job-1',
        integrationId: 'int-1',
        jobType: 'ORDER_SYNC',
        direction: 'INBOUND',
        schedule: '0 0 * * *',
        customFields: { filters: { status: 'open' } },
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    prisma.syncJob.count.mockResolvedValue(1);

    const result = await service.listJobs('tenant-1', { page: 1, limit: 10, jobType: 'ORDER_SYNC' } as any);

    expect(prisma.syncJob.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', jobType: 'ORDER_SYNC' }),
      }),
    );
    expect(result.total).toBe(1);
    expect(result.data[0].filters).toEqual({ status: 'open' });
  });

  it('throws when job not found', async () => {
    prisma.syncJob.findFirst.mockResolvedValue(null);

    await expect(service.getJob('tenant-1', 'job-1')).rejects.toThrow(NotFoundException);
  });

  it('creates job when integration exists', async () => {
    prisma.integration.findFirst.mockResolvedValue({ id: 'int-1' });
    prisma.syncJob.create.mockResolvedValue({ id: 'job-1' });
    prisma.syncJob.findFirst.mockResolvedValue({ id: 'job-1', integrationId: 'int-1', jobType: 'ORDER_SYNC', direction: 'INBOUND' });

    await service.createJob('tenant-1', 'user-1', { integrationId: 'int-1', jobType: 'ORDER_SYNC', direction: 'INBOUND', filters: { status: 'open' } } as any);

    expect(prisma.syncJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          integrationId: 'int-1',
          status: ExecutionStatus.PENDING,
          createdById: 'user-1',
          customFields: { filters: { status: 'open' } },
        }),
      }),
    );
  });

  it('rejects create when integration missing', async () => {
    prisma.integration.findFirst.mockResolvedValue(null);

    await expect(
      service.createJob('tenant-1', 'user-1', { integrationId: 'int-1', jobType: 'ORDER_SYNC', direction: 'INBOUND' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('cancels job in pending status', async () => {
    jest.spyOn(service, 'getJob')
      .mockResolvedValueOnce({ id: 'job-1', status: ExecutionStatus.PENDING } as any)
      .mockResolvedValueOnce({ id: 'job-1', status: ExecutionStatus.CANCELLED } as any);

    await service.cancelJob('tenant-1', 'job-1', 'user-1');

    expect(prisma.syncJob.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: ExecutionStatus.CANCELLED, lastError: 'Cancelled by user', updatedById: 'user-1' },
    });
  });

  it('rejects cancelling non-cancellable job', async () => {
    jest.spyOn(service, 'getJob').mockResolvedValue({ id: 'job-1', status: ExecutionStatus.COMPLETED } as any);

    await expect(service.cancelJob('tenant-1', 'job-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('calculates progress percent', async () => {
    jest.spyOn(service, 'getJob').mockResolvedValue({ id: 'job-1', recordsProcessed: 3, recordsFailed: 1 } as any);

    const result = await service.getProgress('tenant-1', 'job-1');

    expect(result.progressPercent).toBe(75);
  });

  it('returns errors from lastError', async () => {
    jest.spyOn(service, 'getJob').mockResolvedValue({ id: 'job-1', lastError: 'Boom' } as any);

    await expect(service.getErrors('tenant-1', 'job-1')).resolves.toEqual(['Boom']);
  });

  it('lists api logs with filters', async () => {
    prisma.aPIRequestLog.findMany.mockResolvedValue([{ id: 'log-1', endpoint: '/v1' }]);
    prisma.aPIRequestLog.count.mockResolvedValue(1);

    const result = await service.listLogs('tenant-1', { endpoint: '/v1' } as any);

    expect(prisma.aPIRequestLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', endpoint: { contains: '/v1', mode: 'insensitive' } }),
      }),
    );
    expect(result.total).toBe(1);
  });

  it('throws when api log missing', async () => {
    prisma.aPIRequestLog.findFirst.mockResolvedValue(null);

    await expect(service.getLog('tenant-1', 'log-1')).rejects.toThrow(NotFoundException);
  });

  it('lists transformations', async () => {
    prisma.transformationTemplate.findMany.mockResolvedValue([
      { id: 'tpl-1', templateName: 'T1', sourceFormat: 'JSON', targetFormat: 'JSON', transformationLogic: 'x', testCases: [{ ok: true }], createdAt: new Date(), updatedAt: new Date() },
    ]);

    const result = await service.listTransformations('tenant-1');

    expect(result.total).toBe(1);
    expect(result.data[0].testCases).toEqual([{ ok: true }]);
  });

  it('updates transformation active status', async () => {
    prisma.transformationTemplate.findFirst.mockResolvedValue({ id: 'tpl-1', tenantId: 'tenant-1' });
    prisma.transformationTemplate.update.mockResolvedValue({});

    await service.updateTransformation('tenant-1', 'tpl-1', 'user-1', { isActive: true } as any);

    expect(prisma.transformationTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: null, updatedById: 'user-1' }),
      }),
    );
  });

  it('deletes transformation', async () => {
    prisma.transformationTemplate.findFirst.mockResolvedValue({ id: 'tpl-1', tenantId: 'tenant-1' });

    await service.deleteTransformation('tenant-1', 'tpl-1');

    expect(prisma.transformationTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('tests transformation with inline logic', async () => {
    const result = await service.testTransformation('tenant-1', { sourceData: { a: 1 }, transformationLogic: 'echo' } as any);

    expect(result.success).toBe(true);
    expect(result.result).toEqual(expect.objectContaining({ a: 1, _transformation: 'applied', _logicPreview: 'echo' }));
  });

  it('fails transformation test without logic', async () => {
    const result = await service.testTransformation('tenant-1', { sourceData: { a: 1 } } as any);

    expect(result).toEqual({ success: false, error: 'No transformation logic provided' });
  });
});
