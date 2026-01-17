import { Test, TestingModule } from '@nestjs/testing';
import { AlertProcessorService } from './alert-processor.service';
import { PrismaService } from '../../../prisma.service';
import { AlertsService } from './alerts.service';

describe('AlertProcessorService', () => {
  let service: AlertProcessorService;
  let prisma: any;
  let alerts: { createIncident: jest.Mock };

  beforeEach(async () => {
    prisma = { auditAlert: { findMany: jest.fn() } };
    alerts = { createIncident: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertProcessorService,
        { provide: PrismaService, useValue: prisma },
        { provide: AlertsService, useValue: alerts },
      ],
    }).compile();

    service = module.get(AlertProcessorService);
  });

  it('skips evaluation without tenant', async () => {
    await service.evaluateAlertsForLog({ id: 'l1', tenantId: null } as any);

    expect(prisma.auditAlert.findMany).not.toHaveBeenCalled();
  });

  it('creates incident when conditions match', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: { actions: ['CREATE'] }, severity: 'LOW' },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE' } as any);

    expect(alerts.createIncident).toHaveBeenCalled();
  });

  it('skips alert when action does not match', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: { actions: ['UPDATE'] } },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE' } as any);

    expect(alerts.createIncident).not.toHaveBeenCalled();
  });

  it('skips alert when resource type does not match', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: { resourceTypes: ['ORDER'] } },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE', entityType: 'LOAD' } as any);

    expect(alerts.createIncident).not.toHaveBeenCalled();
  });

  it('skips alert when user does not match', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: { userIds: ['u2'] } },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE', userId: 'u1' } as any);

    expect(alerts.createIncident).not.toHaveBeenCalled();
  });

  it('skips alert when ip does not match', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: { ipAddresses: ['1.1.1.1'] } },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE', ipAddress: '2.2.2.2' } as any);

    expect(alerts.createIncident).not.toHaveBeenCalled();
  });

  it('uses default severity when missing', async () => {
    prisma.auditAlert.findMany.mockResolvedValue([
      { id: 'a1', alertName: 'Alert', triggerConditions: null, severity: null },
    ]);

    await service.evaluateAlertsForLog({ id: 'l1', tenantId: 't1', action: 'CREATE', entityType: 'LOAD' } as any);

    expect(alerts.createIncident).toHaveBeenCalledWith(expect.objectContaining({ severity: 'MEDIUM' }));
  });
});
