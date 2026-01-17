import { Test, TestingModule } from '@nestjs/testing';
import { CarrierPortalDashboardService } from './carrier-portal-dashboard.service';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalDashboardService', () => {
  let service: CarrierPortalDashboardService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: { count: jest.fn(), findMany: jest.fn() },
      carrierInvoiceSubmission: { count: jest.fn() },
      settlement: { count: jest.fn(), findMany: jest.fn() },
      carrierPortalNotification: { findMany: jest.fn() },
      carrierPortalDocument: { findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalDashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalDashboardService);
  });

  it('returns dashboard summary', async () => {
    prisma.load.count.mockResolvedValue(2);
    prisma.carrierInvoiceSubmission.count.mockResolvedValue(1);
    prisma.settlement.count.mockResolvedValue(3);
    prisma.carrierPortalNotification.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('t1', 'c1', 'u1');

    expect(result.activeLoads).toBe(2);
    expect(result.settlements).toBe(3);
  });

  it('returns active loads', async () => {
    prisma.load.findMany.mockResolvedValue([]);

    const result = await service.activeLoads('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('returns payment summary', async () => {
    prisma.settlement.findMany.mockResolvedValue([{ amountPaid: 50, balanceDue: 25 }, { amountPaid: 75, balanceDue: 0 }]);

    const result = await service.paymentSummary('t1', 'c1');

    expect(result.totalPaid).toBe(125);
  });

  it('returns compliance summary', async () => {
    prisma.carrierPortalDocument.findMany.mockResolvedValue([{ status: 'APPROVED' }, { status: 'REVIEWING' }]);

    const result = await service.compliance('t1', 'c1');

    expect(result.total).toBe(2);
    expect(result.pending).toBe(1);
  });

  it('returns alerts', async () => {
    prisma.carrierPortalDocument.count.mockResolvedValue(2);
    prisma.settlement.count.mockResolvedValue(1);

    const result = await service.alerts('t1', 'c1');

    expect(result[0]?.count).toBe(2);
    expect(result[1]?.count).toBe(1);
  });
});
