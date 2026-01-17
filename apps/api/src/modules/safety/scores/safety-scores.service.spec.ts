import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SafetyScoresService } from './safety-scores.service';
import { PrismaService } from '../../../prisma.service';

describe('SafetyScoresService', () => {
  let service: SafetyScoresService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      safetyAuditTrail: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
      fmcsaCarrierRecord: { findFirst: jest.fn() },
      carrierInsurance: { findMany: jest.fn() },
      csaScore: { findMany: jest.fn() },
      safetyIncident: { findMany: jest.fn() },
      driverQualificationFile: { findMany: jest.fn() },
      carrier: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SafetyScoresService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(SafetyScoresService);
  });

  it('returns cached score from audit trail', async () => {
    prisma.safetyAuditTrail.findFirst.mockResolvedValue({ eventData: { overallScore: 90 } });

    const result = await service.getScore('tenant-1', 'carrier-1');

    expect(result).toEqual({ overallScore: 90 });
  });

  it('falls back to calculate when no cached score', async () => {
    prisma.safetyAuditTrail.findFirst.mockResolvedValue(null);
    const spy = jest.spyOn(service, 'calculate').mockResolvedValue({ overallScore: 80 } as any);

    const result = await service.getScore('tenant-1', 'carrier-1');

    expect(result).toEqual({ overallScore: 80 });
    expect(spy).toHaveBeenCalled();
  });

  it('returns score history with defaults', async () => {
    prisma.safetyAuditTrail.findMany.mockResolvedValue([{ eventData: { overallScore: 70 } }, { eventData: null }]);

    const result = await service.history('tenant-1', 'carrier-1');

    expect(result).toEqual([{ overallScore: 70 }, {}]);
  });

  it('calculates and stores safety score', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'carrier-1' });
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue({ operatingStatus: 'ACTIVE' });
    prisma.carrierInsurance.findMany.mockResolvedValue([
      { isExpired: false, isVerified: true, coverageAmount: 1000, expirationDate: new Date(Date.now() + 86400000) },
    ]);
    prisma.csaScore.findMany.mockResolvedValue([{ percentile: 20, isAlert: false }]);
    prisma.safetyIncident.findMany.mockResolvedValue([{ incidentDate: new Date() }]);
    prisma.driverQualificationFile.findMany.mockResolvedValue([{ isExpired: false, isVerified: true }]);
    prisma.safetyAuditTrail.create.mockResolvedValue({ id: 'audit-1' });

    const result = await service.calculate({ tenantId: 'tenant-1', carrierId: 'carrier-1', userId: 'user-1' } as any);

    expect(result.carrierId).toBe('carrier-1');
    expect(result.overallScore).toEqual(expect.any(Number));
    expect(prisma.safetyAuditTrail.create).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith('safety.score.updated', expect.objectContaining({ carrierId: 'carrier-1' }));
  });

  it('throws when carrier missing for calculate', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.calculate({ tenantId: 'tenant-1', carrierId: 'carrier-1' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });
});
