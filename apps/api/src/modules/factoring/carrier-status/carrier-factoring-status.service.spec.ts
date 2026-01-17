import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CarrierFactoringStatusService } from './carrier-factoring-status.service';
import { PrismaService } from '../../../prisma.service';
import { PaymentRoutingService } from '../routing/payment-routing.service';
import { FactoringStatus } from '../dto/enums';

describe('CarrierFactoringStatusService', () => {
  let service: CarrierFactoringStatusService;
  let prisma: any;
  let events: { emit: jest.Mock };
  const routing = { determineDestination: jest.fn() };

  beforeEach(async () => {
    prisma = {
      carrierFactoringStatus: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      carrier: { findFirst: jest.fn() },
      factoringCompany: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierFactoringStatusService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
        { provide: PaymentRoutingService, useValue: routing },
      ],
    }).compile();

    service = module.get(CarrierFactoringStatusService);
  });

  it('creates status when missing and returns route', async () => {
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue(null);
    prisma.carrierFactoringStatus.create.mockResolvedValue({ id: 's1', factoringStatus: FactoringStatus.NONE });
    routing.determineDestination.mockResolvedValue({ type: 'CARRIER', carrierId: 'c1' });

    const result = await service.getStatus('t1', 'c1');

    expect(result.paymentRoute.type).toBe('CARRIER');
  });

  it('throws when carrier missing', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.updateStatus('t1', 'u1', 'c1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updates status and emits', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1' });
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({ id: 's1', customFields: {} });
    prisma.carrierFactoringStatus.update.mockResolvedValue({ id: 's1', factoringStatus: FactoringStatus.FACTORED });
    routing.determineDestination.mockResolvedValue({ type: 'FACTORING_COMPANY', factoringCompanyId: 'f1' });

    const result = await service.updateStatus('t1', 'u1', 'c1', { factoringStatus: FactoringStatus.FACTORED, factoringCompanyId: 'f1' } as any);

    expect(result.factoringStatus).toBe(FactoringStatus.FACTORED);
    expect(events.emit).toHaveBeenCalledWith('carrier.factoring.updated', expect.any(Object));
  });

  it('enrolls quick pay', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({ id: 's1', factoringStatus: FactoringStatus.NONE });
    prisma.carrierFactoringStatus.update.mockResolvedValue({ id: 's1', factoringStatus: FactoringStatus.QUICK_PAY_ONLY, quickPayEnabled: true });
    routing.determineDestination.mockResolvedValue({ type: 'QUICK_PAY' });

    const result = await service.enrollQuickPay('t1', 'u1', 'c1', { quickPayFeePercent: 2 } as any);

    expect(result.quickPayEnabled).toBe(true);
  });

  it('sets override', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1' });
    prisma.carrierFactoringStatus.findFirst.mockResolvedValue({ id: 's1', customFields: {} });
    prisma.carrierFactoringStatus.update.mockResolvedValue({ id: 's1', factoringStatus: FactoringStatus.FACTORED });
    routing.determineDestination.mockResolvedValue({ type: 'FACTORING_COMPANY', factoringCompanyId: 'f1' });

    const result = await service.setOverride('t1', 'u1', 'c1', { factoringCompanyId: 'f1' } as any);

    expect(result.id).toBe('s1');
  });
});
