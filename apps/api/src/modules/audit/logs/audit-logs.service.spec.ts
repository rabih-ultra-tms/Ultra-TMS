import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogsService } from './audit-logs.service';
import { PrismaService } from '../../../prisma.service';
import { AlertProcessorService } from '../alerts/alert-processor.service';
import { AuditHashService } from './audit-hash.service';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let prisma: any;
  let events: { emit: jest.Mock };
  let hashService: any;
  let alertProcessor: any;

  beforeEach(async () => {
    prisma = {
      auditLog: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        groupBy: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    events = { emit: jest.fn() };
    hashService = {
      verifyChain: jest.fn(),
      extractHashes: jest.fn(),
      withHashMetadata: jest.fn(),
    };
    alertProcessor = { evaluateAlertsForLog: jest.fn().mockResolvedValue(null) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
        { provide: AuditHashService, useValue: hashService },
        { provide: AlertProcessorService, useValue: alertProcessor },
      ],
    }).compile();

    service = module.get(AuditLogsService);
  });

  it('lists audit logs with pagination', async () => {
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'l1', metadata: null }]);
    prisma.auditLog.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', {} as any);

    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual(expect.objectContaining({ id: 'l1', metadata: {} }));
  });

  it('throws when log missing', async () => {
    prisma.auditLog.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('exports with summary data', async () => {
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'l1', action: 'CREATED' }]);

    const result = await service.export('tenant-1', { format: 'csv', includeDetails: false } as any);

    expect(result.count).toBe(1);
    expect(result.data[0]).toEqual(expect.objectContaining({ id: 'l1', action: 'CREATED' }));
  });

  it('summarizes audit logs', async () => {
    prisma.auditLog.count.mockResolvedValue(2);
    prisma.auditLog.groupBy.mockResolvedValueOnce([{ action: 'CREATED', _count: { _all: 1 } }])
      .mockResolvedValueOnce([{ category: 'DATA', _count: { _all: 2 } }])
      .mockResolvedValueOnce([{ severity: 'INFO', _count: { _all: 2 } }]);

    const result = await service.summary('tenant-1');

    expect(result.total).toBe(2);
    expect(result.byAction.CREATED).toBe(1);
  });

  it('verifies chain and emits on broken integrity', async () => {
    prisma.auditLog.findMany.mockResolvedValue([]);
    hashService.verifyChain.mockReturnValue({ valid: false, brokenAt: 'l1' });

    await service.verifyChain('tenant-1', {} as any);

    expect(events.emit).toHaveBeenCalledWith('audit.integrity.broken', { logId: 'l1' });
  });

  it('logs with redaction and triggers alert evaluation', async () => {
    prisma.auditLog.findFirst.mockResolvedValue(null);
    prisma.auditLog.create.mockResolvedValue({ id: 'l1', metadata: { password: 'secret' } });
    hashService.extractHashes.mockReturnValue({ hash: null });
    hashService.withHashMetadata.mockReturnValue({ metadata: { password: '[REDACTED]' } });
    prisma.auditLog.update.mockResolvedValue({ id: 'l1', action: 'CREATED', metadata: { password: '[REDACTED]' } });

    const result = await service.log({ tenantId: 't1', action: 'CREATED', metadata: { password: 'secret' } } as any);

    expect(result.metadata).toEqual({ password: '[REDACTED]' });
    expect(events.emit).toHaveBeenCalledWith('audit.logged', { logId: 'l1', action: 'CREATED' });
  });
});
