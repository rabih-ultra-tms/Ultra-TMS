import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../../../prisma.service';

describe('Audit AlertsService', () => {
  let service: AlertsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      auditAlert: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      auditAlertIncident: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(AlertsService);
  });

  it('lists alerts', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([]);

    await service.list('tenant-1', true);

    expect(prisma.auditAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1', isActive: true }) }),
    );
  });

  it('creates alert', async () => {
    prisma.auditAlert.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'user-1', { name: 'Alert' } as any);

    expect(prisma.auditAlert.create).toHaveBeenCalled();
  });

  it('throws when updating missing alert', async () => {
    prisma.auditAlert.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'a1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('lists incidents', async () => {
    prisma.auditAlertIncident.findMany.mockResolvedValue([]);
    prisma.auditAlertIncident.count.mockResolvedValue(0);

    const result = await service.listIncidents('tenant-1', { resolved: 'true' } as any);

    expect(result.total).toBe(0);
  });

  it('creates incident and emits event', async () => {
    prisma.auditAlertIncident.create.mockResolvedValue({ id: 'i1' });

    const result = await service.createIncident({ tenantId: 't1', alertId: 'a1', severity: 'MEDIUM', triggerData: {}, message: 'msg' } as any);

    expect(result).toEqual({ id: 'i1' });
    expect(events.emit).toHaveBeenCalledWith('audit.alert.triggered', expect.any(Object));
  });
});
