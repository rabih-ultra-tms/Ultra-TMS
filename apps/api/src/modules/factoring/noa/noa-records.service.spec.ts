import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NoaRecordsService } from './noa-records.service';
import { PrismaService } from '../../../prisma.service';

describe('NoaRecordsService', () => {
  let service: NoaRecordsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      nOARecord: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      carrierFactoringStatus: { upsert: jest.fn() },
      carrier: { findFirst: jest.fn() },
      factoringCompany: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NoaRecordsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(NoaRecordsService);
  });

  it('rejects inactive factoring company', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', status: 'INACTIVE' });

    await expect(service.create('tenant-1', 'user-1', { carrierId: 'c1', factoringCompanyId: 'f1', receivedDate: '2025-01-01', effectiveDate: '2025-01-01' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when carrier missing', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'user-1', { carrierId: 'c1', factoringCompanyId: 'f1', receivedDate: '2025-01-01', effectiveDate: '2025-01-01' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when factoring company missing', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'user-1', { carrierId: 'c1', factoringCompanyId: 'f1', receivedDate: '2025-01-01', effectiveDate: '2025-01-01' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates NOA record and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', status: 'ACTIVE' });
    prisma.nOARecord.count.mockResolvedValue(0);
    prisma.nOARecord.create.mockResolvedValue({ id: 'n1', carrierId: 'c1' });

    await service.create('tenant-1', 'user-1', { carrierId: 'c1', factoringCompanyId: 'f1', receivedDate: '2025-01-01', effectiveDate: '2025-01-01' } as any);

    expect(events.emit).toHaveBeenCalledWith('noa.received', expect.objectContaining({ noaId: 'n1' }));
  });

  it('fails when unable to generate unique NOA number', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', status: 'ACTIVE' });
    prisma.nOARecord.count.mockResolvedValue(1);

    await expect(
      service.create('tenant-1', 'user-1', { carrierId: 'c1', factoringCompanyId: 'f1', receivedDate: '2025-01-01', effectiveDate: '2025-01-01' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('findAll refreshes expired records', async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.nOARecord.findMany.mockResolvedValue([{ id: 'n1', carrierId: 'c1', tenantId: 'tenant-1', expirationDate: past, status: 'PENDING' }]);
    prisma.nOARecord.count.mockResolvedValue(1);
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', status: 'EXPIRED' });

    const result = await service.findAll('tenant-1', { page: 1, limit: 10 } as any);

    expect(result.data[0]?.status).toBe('EXPIRED');
    expect(events.emit).toHaveBeenCalledWith('noa.expired', expect.objectContaining({ noaId: 'n1' }));
  });

  it('findAll applies filters and keeps active records', async () => {
    prisma.nOARecord.findMany.mockResolvedValue([{ id: 'n1', expirationDate: null }]);
    prisma.nOARecord.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', {
      status: 'PENDING',
      carrierId: 'c1',
      factoringCompanyId: 'f1',
      effectiveFrom: '2025-01-01',
      effectiveTo: '2025-01-31',
      page: 2,
      limit: 5,
    } as any);

    expect(prisma.nOARecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
          carrierId: 'c1',
          factoringCompanyId: 'f1',
          effectiveDate: expect.any(Object),
        }),
        skip: 5,
        take: 5,
      }),
    );
    expect(prisma.nOARecord.update).not.toHaveBeenCalled();
    expect(result.totalPages).toBe(1);
  });

  it('throws when updating released NOA', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', status: 'RELEASED' });

    await expect(service.update('tenant-1', 'user-1', 'n1', { noaNumber: 'NOA-1' } as any)).rejects.toThrow(BadRequestException);
  });

  it('updates NOA with factoring company change', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', status: 'PENDING', factoringCompanyId: 'f1' });
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f2', status: 'ACTIVE' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', factoringCompanyId: 'f2' });

    const result = await service.update('tenant-1', 'user-1', 'n1', { factoringCompanyId: 'f2' } as any);

    expect(result.factoringCompanyId).toBe('f2');
    expect(prisma.nOARecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ factoringCompanyId: 'f2', updatedById: 'user-1' }) }),
    );
  });

  it('updates nullable fields', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', status: 'PENDING', factoringCompanyId: 'f1' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1' });

    await service.update('tenant-1', 'user-1', 'n1', { noaDocument: null, expirationDate: null } as any);

    expect(prisma.nOARecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ noaDocument: null, expirationDate: null, updatedById: 'user-1' }) }),
    );
  });

  it('verifies NOA and updates carrier factoring status', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1', status: 'PENDING' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1' });
    prisma.carrierFactoringStatus.upsert.mockResolvedValue({});

    await service.verify('tenant-1', 'user-1', 'n1', { verificationMethod: 'EMAIL' } as any);

    expect(events.emit).toHaveBeenCalledWith('noa.verified', expect.any(Object));
    expect(events.emit).toHaveBeenCalledWith('carrier.factoring.updated', expect.any(Object));
  });

  it('verifies NOA with verification notes', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1', status: 'PENDING', customFields: { note: 'x' } });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1' });
    prisma.carrierFactoringStatus.upsert.mockResolvedValue({});

    await service.verify('tenant-1', 'user-1', 'n1', { verificationMethod: 'EMAIL', verificationNotes: 'checked' } as any);

    expect(prisma.nOARecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customFields: { note: 'x', verificationNotes: 'checked' } }) }),
    );
  });

  it('rejects verify when NOA is released', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', status: 'RELEASED' });

    await expect(service.verify('tenant-1', 'user-1', 'n1', { verificationMethod: 'EMAIL' } as any)).rejects.toThrow(BadRequestException);
  });

  it('rejects verify when NOA is expired', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', status: 'EXPIRED' });

    await expect(service.verify('tenant-1', 'user-1', 'n1', { verificationMethod: 'EMAIL' } as any)).rejects.toThrow(BadRequestException);
  });

  it('releases NOA and updates carrier factoring status', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1', status: 'VERIFIED' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', carrierId: 'c1' });
    prisma.carrierFactoringStatus.upsert.mockResolvedValue({});

    await service.release('tenant-1', 'user-1', 'n1', { releaseReason: 'Done' } as any);

    expect(events.emit).toHaveBeenCalledWith('noa.released', expect.any(Object));
  });

  it('updates carrier factoring status on release', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', factoringCompanyId: 'f1', status: 'VERIFIED' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', carrierId: 'c1' });
    prisma.carrierFactoringStatus.upsert.mockResolvedValue({});

    await service.release('tenant-1', 'user-1', 'n1', { releaseReason: 'Done' } as any);

    expect(prisma.carrierFactoringStatus.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ factoringStatus: 'NONE', factoringCompanyId: null, activeNoaId: null }) }),
    );
  });

  it('removes NOA with soft delete', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1' });

    const result = await service.remove('tenant-1', 'user-1', 'n1');

    expect(result).toEqual({ success: true });
    expect(prisma.nOARecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }) }),
    );
  });

  it('throws when carrier NOA missing', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue(null);

    await expect(service.getCarrierNoa('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });

  it('auto-expires carrier NOA when needed', async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', tenantId: 'tenant-1', expirationDate: past, status: 'PENDING' });
    prisma.nOARecord.update.mockResolvedValue({ id: 'n1', status: 'EXPIRED' });

    const result = await service.getCarrierNoa('tenant-1', 'c1');

    expect(result.status).toBe('EXPIRED');
  });

  it('returns carrier NOA when not expired', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', tenantId: 'tenant-1', expirationDate: null, status: 'PENDING' });

    const result = await service.getCarrierNoa('tenant-1', 'c1');

    expect(result.status).toBe('PENDING');
  });

  it('does not auto-expire released NOA', async () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1', carrierId: 'c1', tenantId: 'tenant-1', expirationDate: past, status: 'RELEASED' });

    const result = await service.getCarrierNoa('tenant-1', 'c1');

    expect(result.status).toBe('RELEASED');
    expect(prisma.nOARecord.update).not.toHaveBeenCalled();
  });
});
