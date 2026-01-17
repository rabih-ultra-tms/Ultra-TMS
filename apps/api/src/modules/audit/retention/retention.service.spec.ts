import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RetentionService } from './retention.service';
import { PrismaService } from '../../../prisma.service';

describe('RetentionService', () => {
  let service: RetentionService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      auditRetentionPolicy: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RetentionService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(RetentionService);
  });

  it('lists retention policies', async () => {
    prisma.auditRetentionPolicy.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.auditRetentionPolicy.findMany).toHaveBeenCalled();
  });

  it('creates retention policy and emits event', async () => {
    prisma.auditRetentionPolicy.create.mockResolvedValue({ id: 'p1' });

    const result = await service.create('tenant-1', { logType: 'AUDIT', retentionDays: 30 } as any);

    expect(result).toEqual({ id: 'p1' });
    expect(events.emit).toHaveBeenCalledWith('audit.retention.completed', { policyId: 'p1', records: 0 });
  });

  it('creates policy with archive first defaults', async () => {
    prisma.auditRetentionPolicy.create.mockResolvedValue({ id: 'p2' });

    await service.create('tenant-1', { logType: 'AUDIT', retentionDays: 90, archiveFirst: true } as any);

    expect(prisma.auditRetentionPolicy.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        archiveAfterDays: 90,
        deleteAfterDays: 90,
        isActive: true,
      }),
    });
  });

  it('creates policy with explicit archive and delete settings', async () => {
    prisma.auditRetentionPolicy.create.mockResolvedValue({ id: 'p3' });

    await service.create('tenant-1', {
      logType: 'AUDIT',
      retentionDays: 30,
      archiveAfterDays: 7,
      deleteAfterDays: 60,
      isActive: false,
      archiveLocation: 's3://bucket',
    } as any);

    expect(prisma.auditRetentionPolicy.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        archiveAfterDays: 7,
        deleteAfterDays: 60,
        isActive: false,
        customFields: { archiveLocation: 's3://bucket' },
      }),
    });
  });

  it('throws when updating missing policy', async () => {
    prisma.auditRetentionPolicy.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'p1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updates policy with archive-first fallback and custom fields', async () => {
    prisma.auditRetentionPolicy.findFirst.mockResolvedValue({
      id: 'p1',
      entityType: 'AUDIT',
      retentionDays: 45,
      archiveAfterDays: 10,
      deleteAfterDays: 90,
      isActive: true,
      customFields: { note: 'existing' },
    });
    prisma.auditRetentionPolicy.update.mockResolvedValue({ id: 'p1' });

    await service.update('tenant-1', 'p1', { archiveFirst: true, archiveLocation: 's3://new' } as any);

    expect(prisma.auditRetentionPolicy.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({
        archiveAfterDays: 45,
        deleteAfterDays: 90,
        isActive: true,
        customFields: { note: 'existing', archiveLocation: 's3://new' },
      }),
    });
  });

  it('updates policy without archiveLocation', async () => {
    prisma.auditRetentionPolicy.findFirst.mockResolvedValue({
      id: 'p1',
      entityType: 'AUDIT',
      retentionDays: 30,
      archiveAfterDays: null,
      deleteAfterDays: null,
      isActive: false,
      customFields: null,
    });
    prisma.auditRetentionPolicy.update.mockResolvedValue({ id: 'p1' });

    await service.update('tenant-1', 'p1', { retentionDays: 60 } as any);

    expect(prisma.auditRetentionPolicy.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: expect.objectContaining({
        retentionDays: 60,
        archiveAfterDays: null,
        deleteAfterDays: null,
        isActive: false,
        customFields: null,
      }),
    });
  });
});
