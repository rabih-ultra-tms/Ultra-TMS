import { PaymentRoutingService } from './payment-routing.service';
import { PrismaService } from '../../../prisma.service';
import { FactoringStatus, NoaStatus } from '../dto/enums';

describe('PaymentRoutingService', () => {
  let service: PaymentRoutingService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      carrierFactoringStatus: { findFirst: jest.fn() },
      nOARecord: { findFirst: jest.fn() },
    };
    service = new PaymentRoutingService(prisma as PrismaService);
  });

  it('routes to carrier when status missing', async () => {
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue(null);

    const result = await service.determineDestination('t1', 'c1');

    expect(result.type).toBe('CARRIER');
  });

  it('routes to override factoring company', async () => {
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({ customFields: { overrideFactoringCompanyId: 'f1' } });

    const result = await service.determineDestination('t1', 'c1');

    expect(result.type).toBe('OVERRIDE');
  });

  it('routes to factoring company when noa valid', async () => {
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({
      factoringStatus: FactoringStatus.FACTORED,
      factoringCompanyId: 'f1',
      activeNoaId: 'n1',
      customFields: {},
    });
    prisma.nOARecord.findFirst.mockResolvedValue({ status: NoaStatus.ACTIVE, effectiveDate: new Date(Date.now() - 1000) });

    const result = await service.determineDestination('t1', 'c1');

    expect(result.type).toBe('FACTORING_COMPANY');
  });

  it('routes to quick pay when enabled', async () => {
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({ factoringStatus: FactoringStatus.QUICK_PAY_ONLY, quickPayEnabled: true, customFields: {} });

    const result = await service.determineDestination('t1', 'c1');

    expect(result.type).toBe('QUICK_PAY');
  });
});
