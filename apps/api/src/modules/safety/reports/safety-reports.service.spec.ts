import { Test, TestingModule } from '@nestjs/testing';
import { SafetyReportsService } from './safety-reports.service';
import { PrismaService } from '../../../prisma.service';

describe('SafetyReportsService', () => {
  let service: SafetyReportsService;
  let prisma: {
    driverQualificationFile: { findMany: jest.Mock };
    carrierInsurance: { findMany: jest.Mock };
    carrierWatchlist: { findMany: jest.Mock };
    safetyIncident: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      driverQualificationFile: { findMany: jest.fn() },
      carrierInsurance: { findMany: jest.fn() },
      carrierWatchlist: { findMany: jest.fn() },
      safetyIncident: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SafetyReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(SafetyReportsService);
  });

  it('builds compliance report', async () => {
    prisma.driverQualificationFile.findMany.mockResolvedValue([
      { isExpired: false, isVerified: true, expirationDate: new Date(Date.now() + 86400000) },
      { isExpired: true, isVerified: false, expirationDate: new Date(Date.now() - 86400000) },
    ]);
    prisma.carrierInsurance.findMany.mockResolvedValue([
      { isExpired: false, expirationDate: new Date(Date.now() + 10 * 86400000) },
    ]);
    prisma.carrierWatchlist.findMany.mockResolvedValue([{ id: 'w1' }]);

    const result = await service.complianceReport('tenant-1');

    expect(result.dqfTotal).toBe(2);
    expect(result.dqfExpired).toBe(1);
    expect(result.dqfVerified).toBe(1);
    expect(result.insuranceTotal).toBe(1);
    expect(result.watchlistActive).toBe(1);
  });

  it('builds incident report summary', async () => {
    prisma.safetyIncident.findMany.mockResolvedValue([
      { incidentType: 'ACCIDENT', severity: 'HIGH' },
      { incidentType: 'ACCIDENT', severity: null },
      { incidentType: 'INSPECTION', severity: 'LOW' },
    ]);

    const result = await service.incidentReport('tenant-1');

    expect(result.total).toBe(3);
    expect(result.byType.ACCIDENT).toBe(2);
    expect(result.bySeverity.UNSPECIFIED).toBe(1);
  });

  it('returns expiring insurance and dqf', async () => {
    prisma.carrierInsurance.findMany.mockResolvedValue([{ id: 'i1' }]);
    prisma.driverQualificationFile.findMany.mockResolvedValue([{ id: 'd1' }]);

    const result = await service.expiringReport('tenant-1');

    expect(result).toEqual({ insurance: [{ id: 'i1' }], dqf: [{ id: 'd1' }] });
  });
});