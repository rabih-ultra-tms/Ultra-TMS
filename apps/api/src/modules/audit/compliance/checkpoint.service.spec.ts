jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  Prisma: { JsonNull: null },
  ComplianceStatus: {
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    COMPLIANT: 'COMPLIANT',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckpointService } from './checkpoint.service';
import { PrismaService } from '../../../prisma.service';

describe('CheckpointService', () => {
  let service: CheckpointService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      complianceCheckpoint: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      auditLog: { count: jest.fn() },
      changeHistory: { count: jest.fn() },
      accessLog: { count: jest.fn() },
      loginAudit: { count: jest.fn() },
      aPIAuditLog: { count: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckpointService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(CheckpointService);
  });

  it('lists checkpoints', async () => {
    prisma.complianceCheckpoint.findMany.mockResolvedValue([{ id: 'c1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('creates checkpoint with stats and emits event', async () => {
    prisma.auditLog.count.mockResolvedValue(1);
    prisma.changeHistory.count.mockResolvedValue(2);
    prisma.accessLog.count.mockResolvedValue(3);
    prisma.loginAudit.count.mockResolvedValue(4);
    prisma.aPIAuditLog.count.mockResolvedValue(5);
    prisma.complianceCheckpoint.create.mockResolvedValue({ id: 'c1' });

    const result = await service.create('t1', 'u1', {
      checkpointName: 'Test',
      entityType: 'ORDER',
      entityId: 'o1',
    } as any);

    expect(result.id).toBe('c1');
    expect(events.emit).toHaveBeenCalledWith('audit.checkpoint.created', { checkpointId: 'c1' });
  });

  it('throws when verifying missing checkpoint', async () => {
    prisma.complianceCheckpoint.findFirst.mockResolvedValue(null);

    await expect(service.verify('t1', 'c1', 'u1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifies checkpoint', async () => {
    prisma.complianceCheckpoint.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.complianceCheckpoint.update.mockResolvedValue({ id: 'c1', status: 'COMPLIANT' });

    const result = await service.verify('t1', 'c1', 'u1');

    expect(result.status).toBe('COMPLIANT');
  });
});
