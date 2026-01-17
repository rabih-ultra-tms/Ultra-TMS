import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { PrismaService } from '../../prisma.service';
import { RateCalculationService } from './rate-calculation.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('QuotesService', () => {
  let service: QuotesService;
  let prisma: any;
  let rateCalc: { calculateRate: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      quote: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        create: jest.fn(),
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

  it('lists quotes with pagination', async () => {
    prisma.quote.findMany.mockResolvedValue([{ id: 'q1' }]);
    prisma.quote.count.mockResolvedValue(1);

    const result = await service.findAll('t1', { page: 2, limit: 10, search: 'Q-2025' });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(prisma.quote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('throws when quote missing', async () => {
    prisma.quote.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'q1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates quote and emits event', async () => {
    prisma.quote.findFirst.mockResolvedValue(null);
    prisma.quote.create.mockResolvedValue({ id: 'q1', quoteNumber: 'Q-202501-0001' });

    const result = await service.create('t1', 'u1', {
      companyId: 'c1',
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
      stops: [{ stopType: 'PICKUP', stopSequence: 1 }],
      linehaulRate: 100,
      fuelSurcharge: 20,
      accessorialsTotal: 5,
    } as any);

    expect(result.id).toBe('q1');
    expect(prisma.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ totalAmount: 125 }) }),
    );
    expect(events.emit).toHaveBeenCalledWith('quote.created', { quote: result, tenantId: 't1', userId: 'u1' });
  });

  it('updates quote and recalculates totals', async () => {
    prisma.quote.findFirst.mockResolvedValue({ id: 'q1' });
    prisma.quote.update.mockResolvedValue({ id: 'q1', totalAmount: 150 });

    const result = await service.update('t1', 'q1', 'u1', {
      linehaulRate: 100,
      fuelSurcharge: 30,
      accessorialsTotal: 20,
    } as any);

    expect(result.totalAmount).toBe(150);
    expect(prisma.quote.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ totalAmount: 150 }) }),
    );
  });

  it('marks quote deleted', async () => {
    prisma.quote.findFirst.mockResolvedValue({ id: 'q1' });
    prisma.quote.update.mockResolvedValue({ id: 'q1' });

    const result = await service.delete('t1', 'q1', 'u1');

    expect(result).toEqual({ success: true });
    expect(prisma.quote.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ updatedById: 'u1' }) }),
    );
  });

  it('converts quote to order', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'q1',
      quoteNumber: 'Q-202501-0001',
      status: 'SENT',
      companyId: 'c1',
      contactId: 'ct1',
      equipmentType: 'DRY_VAN',
      weightLbs: 1000,
      pieces: 10,
      commodity: 'Widgets',
      totalAmount: 200,
      fuelSurcharge: 20,
      accessorialsTotal: 5,
      specialInstructions: 'Careful',
      salesRepId: 'u1',
      stops: [
        { stopType: 'PICKUP', stopSequence: 1, city: 'A', state: 'TX', addressLine1: '1', postalCode: '1' },
      ],
    });
    prisma.order.create.mockResolvedValue({ id: 'o1' });
    prisma.quote.update.mockResolvedValue({ id: 'q1', status: 'CONVERTED' });

    const result = await service.convertToOrder('t1', 'q1', 'u1');

    expect(result.id).toBe('o1');
    expect(events.emit).toHaveBeenCalledWith(
      'quote.converted',
      expect.objectContaining({ tenantId: 't1', userId: 'u1' }),
    );
  });

  it('duplicates quote', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'q1',
      quoteNumber: 'Q-202501-0001',
      companyId: 'c1',
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
      stops: [{ stopType: 'PICKUP', stopSequence: 1, city: 'A', state: 'TX' }],
    });
    prisma.quote.create.mockResolvedValue({ id: 'q2' });

    const result = await service.duplicate('t1', 'q1', 'u1');

    expect(result.id).toBe('q2');
  });

  it('creates new version', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'q1',
      quoteNumber: 'Q-202501-0001',
      version: 1,
      companyId: 'c1',
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
      stops: [{ stopType: 'PICKUP', stopSequence: 1, city: 'A', state: 'TX' }],
    });
    prisma.quote.create.mockResolvedValue({ id: 'q1v2', version: 2 });

    const result = await service.createNewVersion('t1', 'q1', 'u1');

    expect(result.version).toBe(2);
  });

  it('rejects send without customer email', async () => {
    prisma.quote.findFirst.mockResolvedValue({ id: 'q1', customerEmail: null });

    await expect(service.send('t1', 'q1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generates pdf buffer', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'q1',
      quoteNumber: 'Q-202501-0001',
      version: 1,
      customerName: 'Acme',
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
      totalAmount: 123.45,
    });

    const result = await service.generatePdf('t1', 'q1');

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('utf-8')).toContain('Q-202501-0001');
  });

  it('creates quick quote from rate calculation', async () => {
    rateCalc.calculateRate.mockResolvedValue({
      totalMiles: 100,
      linehaulRate: 200,
      fuelSurcharge: 30,
      accessorialsTotal: 10,
      totalAmount: 240,
      marginPercent: 20,
      rateSource: 'MARKET',
    });
    prisma.quote.findFirst.mockResolvedValue(null);
    prisma.quote.create.mockResolvedValue({ id: 'q1' });

    const result = await service.quickQuote('t1', 'u1', {
      originCity: 'A',
      originState: 'TX',
      destinationCity: 'B',
      destinationState: 'CA',
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
    } as any);

    expect(result.id).toBe('q1');
    expect(rateCalc.calculateRate).toHaveBeenCalled();
  });

  it('delegates rate calculation', async () => {
    rateCalc.calculateRate.mockResolvedValue({ totalAmount: 100 });

    const result = await service.calculateRate('t1', {
      origin: { city: 'A', state: 'TX' },
      destination: { city: 'B', state: 'CA' },
      serviceType: 'FTL',
      equipmentType: 'DRY_VAN',
    } as any);

    expect(result.totalAmount).toBe(100);
  });
});
