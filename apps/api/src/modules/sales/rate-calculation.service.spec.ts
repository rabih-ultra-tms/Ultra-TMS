import { Test, TestingModule } from '@nestjs/testing';
import { RateCalculationService } from './rate-calculation.service';
import { PrismaService } from '../../prisma.service';

describe('RateCalculationService', () => {
  let service: RateCalculationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      rateContract: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateCalculationService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RateCalculationService);
  });

  it('uses contract rate when available', async () => {
    prisma.rateContract.findFirst.mockResolvedValue({ laneRates: [{ rateAmount: '2.5' }] });
    jest.spyOn(service as any, 'calculateMiles').mockReturnValue(1000);

    const result = await service.calculateRate('t1', {
      origin: { city: 'A', state: 'TX' },
      destination: { city: 'B', state: 'CA' },
      serviceType: 'LTL',
      equipmentType: 'DRY_VAN',
      customerId: 'c1',
    });

    expect(result.rateSource).toBe('CONTRACT');
    expect(result.totalMiles).toBe(1000);
    expect(result.linehaulRate).toBe(2500);
  });

  it('falls back to market rate when no contract', async () => {
    prisma.rateContract.findFirst.mockResolvedValue(null);
    jest.spyOn(service as any, 'calculateMiles').mockReturnValue(800);

    const result = await service.calculateRate('t1', {
      origin: { city: 'A', state: 'TX' },
      destination: { city: 'B', state: 'CA' },
      serviceType: 'LTL',
      equipmentType: 'REEFER',
    });

    expect(result.rateSource).toBe('MARKET');
    expect(result.breakdown.baseRatePerMile).toBe(3.5);
    expect(result.totalMiles).toBe(800);
  });

  it('enforces minimum margin', async () => {
    const result = await service.enforceMinimumMargin(1000, 20);

    expect(result).toBe(1250);
  });
});
