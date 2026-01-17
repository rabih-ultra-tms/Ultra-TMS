import { Test, TestingModule } from '@nestjs/testing';
import { PortalDashboardService } from './portal-dashboard.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalDashboardService', () => {
  let service: PortalDashboardService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      load: { count: jest.fn(), findMany: jest.fn() },
      quoteRequest: { count: jest.fn() },
      invoice: { findMany: jest.fn(), count: jest.fn() },
      portalPayment: { findMany: jest.fn() },
      portalNotification: { findMany: jest.fn() },
      portalActivityLog: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalDashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalDashboardService);
  });

  it('returns dashboard summary', async () => {
    prisma.load.count.mockResolvedValue(2);
    prisma.quoteRequest.count.mockResolvedValue(1);
    prisma.invoice.findMany.mockResolvedValue([{ balanceDue: 100 }, { balanceDue: 50 }]);
    prisma.portalPayment.findMany.mockResolvedValue([]);
    prisma.portalNotification.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('t1', 'c1', 'u1');

    expect(result.outstandingBalance).toBe(150);
  });

  it('returns active shipments', async () => {
    prisma.load.findMany.mockResolvedValue([]);

    const result = await service.getActiveShipments('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('returns recent activity', async () => {
    prisma.portalActivityLog.findMany.mockResolvedValue([]);

    const result = await service.getRecentActivity('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('returns alerts', async () => {
    prisma.invoice.count.mockResolvedValue(2);
    prisma.load.count.mockResolvedValue(1);

    const result = await service.getAlerts('t1', 'c1');

    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
  });
});
