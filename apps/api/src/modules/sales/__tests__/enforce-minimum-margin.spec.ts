import { Test, TestingModule } from '@nestjs/testing';
import { QuotesService } from '../quotes.service';
import { PrismaService } from '../../../prisma.service';
import { RateCalculationService } from '../rate-calculation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('QuotesService - Enforce Minimum 5% Margin', () => {
  let service: QuotesService;
  let prisma: any;
  let rateCalc: { calculateRate: jest.Mock };
  let events: { emit: jest.Mock };

  const testTenantId = 'tenant-123';
  const testUserId = 'user-123';

  beforeEach(async () => {
    prisma = {
      quote: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      quoteStop: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };
    rateCalc = { calculateRate: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        { provide: PrismaService, useValue: prisma },
        { provide: RateCalculationService, useValue: rateCalc },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(QuotesService);
  });

  describe('create with minimum 5% margin requirement', () => {
    it('should reject quote with 3% margin', async () => {
      prisma.quote.findFirst.mockResolvedValue(null); // For quote number generation

      // Margin calculation: ((total - linehaul) / total) * 100
      // With linehaulRate=1000, total=1030: ((1030-1000)/1030)*100 = 2.91%
      await expect(
        service.create(testTenantId, testUserId, {
          companyId: 'cust-1',
          serviceType: 'FTL',
          equipmentType: 'DRY_VAN',
          linehaulRate: 1000,
          fuelSurcharge: 0,
          accessorialsTotal: 30,
          totalAmount: 1030,
          stops: [
            {
              stopType: 'PICKUP',
              stopSequence: 1,
              city: 'Dallas',
              state: 'TX',
              addressLine1: '123 Main',
            },
            {
              stopType: 'DELIVERY',
              stopSequence: 2,
              city: 'Houston',
              state: 'TX',
              addressLine1: '456 Oak',
            },
          ],
        } as any)
      ).rejects.toThrow(/below the minimum required margin of 5%/);
    });

    it('should accept quote with 5.5% margin (above minimum)', async () => {
      prisma.quote.findFirst.mockResolvedValue(null);
      prisma.quote.create.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'Q-202603-0001',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 58.32,
        totalAmount: 1058.32,
        marginPercent: 5.5,
        status: 'DRAFT',
      });

      // Margin = 5.5%: ((total - 1000) / total) = 0.055
      // total = 1000 / (1 - 0.055) = 1000 / 0.945 = 1058.32
      const result = await service.create(testTenantId, testUserId, {
        companyId: 'cust-2',
        serviceType: 'FTL',
        equipmentType: 'DRY_VAN',
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 58.32,
        totalAmount: 1058.32,
        stops: [
          {
            stopType: 'PICKUP',
            stopSequence: 1,
            city: 'Dallas',
            state: 'TX',
            addressLine1: '123 Main',
          },
          {
            stopType: 'DELIVERY',
            stopSequence: 2,
            city: 'Houston',
            state: 'TX',
            addressLine1: '456 Oak',
          },
        ],
      } as any);

      expect(result.id).toBe('quote-1');
      expect(result.marginPercent).toBe(5.5);
    });

    it('should accept quote with greater than 5% margin', async () => {
      prisma.quote.findFirst.mockResolvedValue(null);
      prisma.quote.create.mockResolvedValue({
        id: 'quote-3',
        quoteNumber: 'Q-202603-0002',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 111.11,
        totalAmount: 1111.11,
        marginPercent: 10,
        status: 'DRAFT',
      });

      // Margin = 10%: total = 1000 / 0.9 = 1111.11
      const result = await service.create(testTenantId, testUserId, {
        companyId: 'cust-3',
        serviceType: 'FTL',
        equipmentType: 'DRY_VAN',
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 111.11,
        totalAmount: 1111.11,
        stops: [
          {
            stopType: 'PICKUP',
            stopSequence: 1,
            city: 'Dallas',
            state: 'TX',
            addressLine1: '123 Main',
          },
          {
            stopType: 'DELIVERY',
            stopSequence: 2,
            city: 'Houston',
            state: 'TX',
            addressLine1: '456 Oak',
          },
        ],
      } as any);

      expect(result.id).toBe('quote-3');
      expect(result.marginPercent).toBe(10);
    });

    it('should accept quote when using overrideMarginCheck flag', async () => {
      prisma.quote.findFirst.mockResolvedValue(null);
      prisma.quote.create.mockResolvedValue({
        id: 'quote-override',
        quoteNumber: 'Q-202603-0003',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 20,
        totalAmount: 1020,
        marginPercent: 2,
        status: 'DRAFT',
      });

      // Margin = 2%, below threshold, but with override
      const result = await service.create(testTenantId, testUserId, {
        companyId: 'cust-4',
        serviceType: 'FTL',
        equipmentType: 'DRY_VAN',
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 20,
        totalAmount: 1020,
        overrideMarginCheck: true,
        stops: [
          {
            stopType: 'PICKUP',
            stopSequence: 1,
            city: 'Dallas',
            state: 'TX',
            addressLine1: '123 Main',
          },
          {
            stopType: 'DELIVERY',
            stopSequence: 2,
            city: 'Houston',
            state: 'TX',
            addressLine1: '456 Oak',
          },
        ],
      } as any);

      expect(result.id).toBe('quote-override');
    });
  });

  describe('update with minimum 5% margin requirement', () => {
    it('should reject update that sets margin below 5%', async () => {
      prisma.quote.findFirst.mockResolvedValue({
        id: 'quote-4',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 111.11,
        totalAmount: 1111.11,
        marginPercent: 10,
        status: 'DRAFT',
        stops: [],
      });

      // Directly set marginPercent to 2%, which is below 5%
      // Using totalAmount for validation: (1111.11 - 1000) / 1111.11 * 100 = 10%
      // But marginPercent=2% is still < 5%
      await expect(
        service.update(testTenantId, 'quote-4', testUserId, {
          marginPercent: 2,
        } as any)
      ).rejects.toThrow(/below the minimum required margin of 5%/);
    });

    it('should accept update that maintains 5%+ margin', async () => {
      prisma.quote.findFirst.mockResolvedValue({
        id: 'quote-5',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 111.11,
        totalAmount: 1111.11,
        marginPercent: 10,
        status: 'DRAFT',
        stops: [],
      });

      prisma.quoteStop.deleteMany.mockResolvedValue({ count: 0 });
      prisma.quote.update.mockResolvedValue({
        id: 'quote-5',
        tenantId: testTenantId,
        linehaulRate: 950,
        fuelSurcharge: 0,
        accessorialsTotal: 63.16,
        totalAmount: 1013.16,
        marginPercent: 6.25,
        status: 'DRAFT',
      });

      // linehaulRate=950, total=1013.16 gives margin = (1013.16-950)/1013.16 = 6.25%
      const result = await service.update(testTenantId, 'quote-5', testUserId, {
        linehaulRate: 950,
        totalAmount: 1013.16,
      } as any);

      expect(result.marginPercent).toBe(6.25);
    });

    it('should accept update when using overrideMarginCheck flag', async () => {
      prisma.quote.findFirst.mockResolvedValue({
        id: 'quote-6',
        tenantId: testTenantId,
        linehaulRate: 1000,
        fuelSurcharge: 0,
        accessorialsTotal: 111.11,
        totalAmount: 1111.11,
        marginPercent: 10,
        status: 'DRAFT',
        stops: [],
      });

      prisma.quoteStop.deleteMany.mockResolvedValue({ count: 0 });
      prisma.quote.update.mockResolvedValue({
        id: 'quote-6',
        tenantId: testTenantId,
        linehaulRate: 990,
        fuelSurcharge: 0,
        accessorialsTotal: 15,
        totalAmount: 1005,
        marginPercent: 1.49,
        status: 'DRAFT',
      });

      // linehaulRate=990, total=1005 gives margin = (1005-990)/1005 = 1.49%, below 5%
      const result = await service.update(testTenantId, 'quote-6', testUserId, {
        linehaulRate: 990,
        totalAmount: 1005,
        overrideMarginCheck: true,
      } as any);

      expect(result.id).toBe('quote-6');
    });
  });

  describe('margin calculation edge cases', () => {
    it('should handle zero total amount without crashing', async () => {
      // When both linehaulRate and accessorialsTotal are 0, margin check should be skipped
      prisma.quote.findFirst.mockResolvedValue(null);
      prisma.quote.create.mockResolvedValue({
        id: 'quote-edge-1',
        quoteNumber: 'Q-202603-0004',
      });

      const result = await service.create(testTenantId, testUserId, {
        companyId: 'cust-edge',
        serviceType: 'FTL',
        equipmentType: 'DRY_VAN',
        linehaulRate: 0,
        fuelSurcharge: 0,
        accessorialsTotal: 0,
        totalAmount: 0,
        stops: [
          {
            stopType: 'PICKUP',
            stopSequence: 1,
            city: 'Dallas',
            state: 'TX',
            addressLine1: '123 Main',
          },
        ],
      } as any);

      expect(result.id).toBe('quote-edge-1');
    });

    it('should reject quote with 4.5% margin', async () => {
      prisma.quote.findFirst.mockResolvedValue(null);

      // 4.5% margin: total = 1000 / (1 - 0.045) = 1000 / 0.955 = 1047.12
      await expect(
        service.create(testTenantId, testUserId, {
          companyId: 'cust-5',
          serviceType: 'FTL',
          equipmentType: 'DRY_VAN',
          linehaulRate: 1000,
          fuelSurcharge: 0,
          accessorialsTotal: 47.12,
          totalAmount: 1047.12,
          stops: [
            {
              stopType: 'PICKUP',
              stopSequence: 1,
              city: 'Dallas',
              state: 'TX',
              addressLine1: '123 Main',
            },
            {
              stopType: 'DELIVERY',
              stopSequence: 2,
              city: 'Houston',
              state: 'TX',
              addressLine1: '456 Oak',
            },
          ],
        } as any)
      ).rejects.toThrow(/below the minimum required margin of 5%/);
    });
  });
});
