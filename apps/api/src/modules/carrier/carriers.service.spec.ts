import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { PrismaService } from '../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CarriersService', () => {
  let service: CarriersService;
  let prisma: {
    carrier: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    load: { count: jest.Mock; findMany: jest.Mock };
    insuranceCertificate?: { findMany: jest.Mock };
    carrierDocument?: { findMany: jest.Mock };
    fmcsaComplianceLog?: { findMany: jest.Mock; create?: jest.Mock };
  };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    prisma = {
      carrier: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      load: { count: jest.fn(), findMany: jest.fn() },
      insuranceCertificate: { findMany: jest.fn() },
      carrierDocument: { findMany: jest.fn() },
      fmcsaComplianceLog: { findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarriersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(CarriersService);
  });

  it('findAll filters by deletedAt', async () => {
    prisma.carrier.findMany.mockResolvedValue([]);
    prisma.carrier.count.mockResolvedValue(0);

    await service.findAll('tenant-1', {} as any);

    expect(prisma.carrier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null }),
      }),
    );
  });

  it('findAll applies filters and search', async () => {
    prisma.carrier.findMany.mockResolvedValue([]);
    prisma.carrier.count.mockResolvedValue(0);

    await service.findAll('tenant-1', {
      status: 'ACTIVE',
      tier: 'GOLD',
      state: 'TX',
      equipmentTypes: ['VAN'],
      search: 'Acme',
      hasExpiredInsurance: true,
      hasExpiredDocuments: true,
    } as any);

    expect(prisma.carrier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          qualificationTier: 'GOLD',
          state: 'TX',
          equipmentTypes: { hasSome: ['VAN'] },
        }),
      }),
    );
  });

  it('throws when carrier not found', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'car-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects create when duplicate identifiers found', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });

    await expect(
      service.create('tenant-1', 'user-1', { mcNumber: '123', dotNumber: '456' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates carrier and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);
    prisma.carrier.create.mockResolvedValue({ id: 'car-1', dotNumber: '123', legalName: 'Acme' });

    const result = await service.create('tenant-1', 'user-1', {
      mcNumber: 'MC1',
      dotNumber: '123',
      name: 'Acme',
      contacts: [],
    } as any);

    expect(result.id).toBe('car-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'carrier.created',
      expect.objectContaining({ carrierId: 'car-1', dotNumber: '123', tenantId: 'tenant-1' }),
    );
  });

  it('prevents update for blacklisted carrier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', status: 'BLACKLISTED' });

    await expect(
      service.update('tenant-1', 'car-1', { legalName: 'New' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates carrier with new DOT number', async () => {
    prisma.carrier.findFirst
      .mockResolvedValueOnce({ id: 'car-1', status: 'ACTIVE', dotNumber: 'OLD', mcNumber: 'MC1' })
      .mockResolvedValueOnce(null);
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', dotNumber: 'NEW' });

    const result = await service.update('tenant-1', 'car-1', { dotNumber: 'NEW' } as any);

    expect(result.dotNumber).toBe('NEW');
  });

  it('rejects status update when reason missing', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', status: 'ACTIVE' });

    await expect(service.updateStatus('tenant-1', 'car-1', 'SUSPENDED' as any)).rejects.toThrow(BadRequestException);
  });

  it('updates status to suspended and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', status: 'ACTIVE', internalNotes: '' });
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', status: 'SUSPENDED' });

    const result = await service.updateStatus('tenant-1', 'car-1', 'SUSPENDED' as any, 'Docs missing');

    expect(result.status).toBe('SUSPENDED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('carrier.suspended', expect.objectContaining({ carrierId: 'car-1' }));
  });

  it('updates status to blacklisted and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', status: 'ACTIVE', internalNotes: '' });
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', status: 'BLACKLISTED' });

    const result = await service.updateStatus('tenant-1', 'car-1', 'BLACKLISTED' as any, 'Fraud');

    expect(result.status).toBe('BLACKLISTED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('carrier.blacklisted', expect.objectContaining({ carrierId: 'car-1' }));
  });

  it('updates status without reason when allowed', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', status: 'INACTIVE', internalNotes: 'note' });
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', status: 'ACTIVE' });

    const result = await service.updateStatus('tenant-1', 'car-1', 'ACTIVE' as any);

    expect(result.status).toBe('ACTIVE');
    expect(prisma.carrier.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ internalNotes: 'note' }) }),
    );
  });

  it('updates tier and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', qualificationTier: 'BRONZE' });
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', qualificationTier: 'SILVER' });

    const result = await service.updateTier('tenant-1', 'car-1', 'SILVER' as any);

    expect(result.qualificationTier).toBe('SILVER');
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'carrier.tier.changed',
      expect.objectContaining({ carrierId: 'car-1', oldTier: 'BRONZE', newTier: 'SILVER' }),
    );
  });

  it('deactivates carrier when no active loads', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', internalNotes: null });
    prisma.load.count.mockResolvedValue(0);
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', status: 'INACTIVE' });

    const result = await service.deactivate('tenant-1', 'car-1');

    expect(result.status).toBe('INACTIVE');
    expect(prisma.carrier.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'INACTIVE' }) }),
    );
  });

  it('rejects deactivate when active loads exist', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.load.count.mockResolvedValue(2);

    await expect(service.deactivate('tenant-1', 'car-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deletes carrier when no load history', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.load.count.mockResolvedValue(0);
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', deletedAt: new Date() });

    const result = await service.delete('tenant-1', 'car-1');

    expect(result.success).toBe(true);
  });

  it('rejects delete when load history exists', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.load.count.mockResolvedValue(5);

    await expect(service.delete('tenant-1', 'car-1')).rejects.toThrow(BadRequestException);
  });

  it('returns performance metrics with no loads', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', legalName: 'Carrier' });
    prisma.load.findMany.mockResolvedValue([]);

    const result = await service.getCarrierPerformance('tenant-1', 'car-1', 30);

    expect(result.metrics.totalLoads).toBe(0);
    expect(result.metrics.completionRate).toBe('0');
  });

  it('returns N/A on-time rate when no delivery data', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', legalName: 'Carrier' });
    prisma.load.findMany.mockResolvedValue([
      { status: 'COMPLETED', carrierRate: { toNumber: () => 0 }, order: { stops: [{ stopType: 'DELIVERY' }] } },
    ]);

    const result = await service.getCarrierPerformance('tenant-1', 'car-1', 30);

    expect(result.metrics.onTimeRate).toBe('N/A');
  });

  it('calculates on-time performance', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1', legalName: 'Carrier' });
    prisma.load.findMany.mockResolvedValue([
      {
        status: 'COMPLETED',
        carrierRate: { toNumber: () => 500 },
        order: {
          stops: [
            { stopType: 'DELIVERY', appointmentTimeEnd: new Date('2026-01-02'), arrivedAt: new Date('2026-01-01') },
          ],
        },
      },
    ]);

    const result = await service.getCarrierPerformance('tenant-1', 'car-1', 30);

    expect(result.metrics.onTimeRate).toBe('100.0');
    expect(result.metrics.totalRevenue).toBe(500);
  });

  it('rejects approval when missing W9 document', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      tenantId: 'tenant-1',
      status: 'PENDING',
      documents: [{ documentType: 'CARRIER_AGREEMENT', status: 'APPROVED' }],
      insuranceCertificates: [],
    });

    await expect(service.approve('tenant-1', 'car-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects approval when missing agreement document', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      tenantId: 'tenant-1',
      status: 'PENDING',
      documents: [{ documentType: 'W9', status: 'APPROVED' }],
      insuranceCertificates: [],
    });

    await expect(service.approve('tenant-1', 'car-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects approval when insurance non-compliant', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      tenantId: 'tenant-1',
      status: 'PENDING',
      documents: [
        { documentType: 'W9', status: 'APPROVED' },
        { documentType: 'CARRIER_AGREEMENT', status: 'APPROVED' },
      ],
      insuranceCertificates: [],
    });

    await expect(service.approve('tenant-1', 'car-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('approves carrier and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      tenantId: 'tenant-1',
      status: 'PENDING',
      documents: [
        { documentType: 'W9', status: 'APPROVED' },
        { documentType: 'CARRIER_AGREEMENT', status: 'APPROVED' },
      ],
      insuranceCertificates: [
        { insuranceType: 'AUTO_LIABILITY', coverageAmount: 1000000, expirationDate: new Date(Date.now() + 100000) },
        { insuranceType: 'CARGO', coverageAmount: 100000, expirationDate: new Date(Date.now() + 100000) },
      ],
    });
    prisma.carrier.update.mockResolvedValue({ id: 'car-1', status: 'ACTIVE' });

    const result = await service.approve('tenant-1', 'car-1', 'user-1');

    expect(result.status).toBe('ACTIVE');
    expect(eventEmitter.emit).toHaveBeenCalledWith('carrier.approved', expect.objectContaining({ carrierId: 'car-1' }));
  });

  it('computes scorecard with recommended tier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      legalName: 'Carrier',
      status: 'ACTIVE',
      qualificationTier: 'UNQUALIFIED',
      createdAt: new Date(),
      fmcsaOutOfService: false,
      fmcsaLastChecked: null,
    });
    prisma.load.findMany.mockResolvedValue(
      Array.from({ length: 10 }, () => ({
        status: 'COMPLETED',
        carrierRate: { toNumber: () => 100 },
        order: { stops: [{ stopType: 'DELIVERY', appointmentTimeEnd: new Date('2026-01-02'), arrivedAt: new Date('2026-01-01') }] },
      })),
    );
    prisma.insuranceCertificate.findMany.mockResolvedValue([{ expirationDate: new Date('2030-01-01') }]);
    prisma.carrierDocument.findMany.mockResolvedValue([{ expirationDate: null }]);

    const result = await service.getScorecard('tenant-1', 'car-1');

    expect(result.carrier.recommendedTier).toBe('BRONZE');
    expect(result.metrics.totalLoads).toBe(10);
  });

  it('returns compliance issues for expired insurance/documents', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      legalName: 'Carrier',
      status: 'ACTIVE',
      qualificationTier: 'BRONZE',
      fmcsaOutOfService: false,
    });
    prisma.insuranceCertificate.findMany.mockResolvedValue([
      { expirationDate: new Date('2020-01-01') },
    ]);
    prisma.carrierDocument.findMany.mockResolvedValue([
      { documentType: 'W9', status: 'PENDING', expirationDate: new Date('2020-01-01') },
    ]);
    prisma.fmcsaComplianceLog.findMany.mockResolvedValue([]);

    const result = await service.getCompliance('tenant-1', 'car-1');

    expect(result.issues.hasExpiredInsurance).toBe(true);
    expect(result.issues.hasExpiredDocuments).toBe(true);
    expect(result.issues.missingW9).toBe(true);
    expect(result.issues.missingAgreement).toBe(true);
  });

  it('rejects onboarding when DOT and MC missing', async () => {
    await expect(service.onboardFromFmcsa('tenant-1', 'user-1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('returns existing carrier on onboarding', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });

    const result = await service.onboardFromFmcsa('tenant-1', 'user-1', { dotNumber: '123' } as any);

    expect(result.existing).toBe(true);
    expect(result.carrier.id).toBe('car-1');
  });

  it('creates carrier on onboarding with fallback contact info', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);
    prisma.fmcsaComplianceLog.create.mockResolvedValue({ id: 'log-1' });
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({ id: 'car-2' } as any);

    const result = await service.onboardFromFmcsa('tenant-1', 'user-1', { dotNumber: '999' } as any);

    expect(result.existing).toBe(false);
    expect(createSpy).toHaveBeenCalledWith(
      'tenant-1',
      'user-1',
      expect.objectContaining({ email: expect.stringContaining('onboard+'), phone: '555-555-5555' }),
    );

    createSpy.mockRestore();
  });

  it('flags compliance issues for expired docs and missing W9', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      legalName: 'Carrier',
      status: 'ACTIVE',
      qualificationTier: 'BRONZE',
      fmcsaOutOfService: true,
    });
    prisma.insuranceCertificate?.findMany.mockResolvedValue([
      { expirationDate: new Date(Date.now() - 1000) },
    ]);
    prisma.carrierDocument?.findMany.mockResolvedValue([
      { documentType: 'CARRIER_AGREEMENT', status: 'APPROVED', expirationDate: new Date(Date.now() - 1000) },
    ]);
    prisma.fmcsaComplianceLog?.findMany.mockResolvedValue([]);

    const result = await service.getCompliance('tenant-1', 'car-1');

    expect(result.issues.hasExpiredInsurance).toBe(true);
    expect(result.issues.hasExpiredDocuments).toBe(true);
    expect(result.issues.missingW9).toBe(true);
    expect(result.issues.isOutOfService).toBe(true);
  });

  it('onboards carrier from FMCSA when not existing', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);
    prisma.fmcsaComplianceLog?.create?.mockResolvedValue({ id: 'log-1' });
    jest.spyOn(service, 'create').mockResolvedValue({ id: 'car-1' } as any);

    const result = await service.onboardFromFmcsa('tenant-1', 'user-1', { dotNumber: '123' } as any);

    expect(result.existing).toBe(false);
    expect(service.create).toHaveBeenCalled();
  });

  it('returns existing carrier from FMCSA onboarding', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    const createSpy = jest.spyOn(service, 'create');

    const result = await service.onboardFromFmcsa('tenant-1', 'user-1', { dotNumber: '123' } as any);

    expect(result.existing).toBe(true);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('rejects onboarding without DOT or MC number', async () => {
    await expect(service.onboardFromFmcsa('tenant-1', 'user-1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('builds scorecard and recommends tier', async () => {
    prisma.carrier.findFirst.mockResolvedValue({
      id: 'car-1',
      legalName: 'Carrier',
      status: 'ACTIVE',
      qualificationTier: 'BRONZE',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fmcsaOutOfService: false,
      fmcsaLastChecked: null,
    });
    prisma.load.findMany.mockResolvedValue(
      Array.from({ length: 10 }).map(() => ({
        status: 'COMPLETED',
        carrierRate: { toNumber: () => 100 },
        order: { stops: [{ stopType: 'DELIVERY', appointmentTimeEnd: new Date('2026-01-02'), arrivedAt: new Date('2026-01-01') }] },
      })),
    );
    prisma.insuranceCertificate?.findMany.mockResolvedValue([]);
    prisma.carrierDocument?.findMany.mockResolvedValue([]);

    const result = await service.getScorecard('tenant-1', 'car-1');

    expect(result.metrics.totalLoads).toBe(10);
    expect(result.carrier.recommendedTier).toBe('BRONZE');
  });
});
