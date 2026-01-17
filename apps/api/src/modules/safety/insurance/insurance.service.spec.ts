import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InsuranceService } from './insurance.service';
import { PrismaService } from '../../../prisma.service';

describe('InsuranceService', () => {
  let service: InsuranceService;
  let prisma: {
    carrierInsurance: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      carrierInsurance: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(InsuranceService);
  });

  it('lists insurance with filters', async () => {
    prisma.carrierInsurance.findMany.mockResolvedValue([]);

    await service.list('tenant-1', { carrierId: 'c1', isVerified: true } as any);

    expect(prisma.carrierInsurance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', carrierId: 'c1', isVerified: true }),
      }),
    );
  });

  it('rejects when coverage below minimum', async () => {
    await expect(
      service.create('tenant-1', 'user-1', {
        carrierId: 'c1',
        insuranceType: 'AUTO_LIABILITY',
        coverageAmount: 1000,
        effectiveDate: '2025-01-01',
        expirationDate: '2026-01-01',
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates insurance and emits expiring when within window', async () => {
    prisma.carrierInsurance.create.mockResolvedValue({
      id: 'i1',
      carrierId: 'c1',
      expirationDate: new Date(Date.now() + 5 * 86400000),
    });

    await service.create('tenant-1', 'user-1', {
      carrierId: 'c1',
      insuranceType: 'CARGO',
      coverageAmount: 100000,
      effectiveDate: '2025-01-01',
      expirationDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    } as any);

    expect(events.emit).toHaveBeenCalledWith(
      'safety.insurance.expiring',
      expect.objectContaining({ carrierId: 'c1' }),
    );
  });

  it('throws when record not found', async () => {
    prisma.carrierInsurance.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'i1')).rejects.toThrow(NotFoundException);
  });

  it('updates insurance and sets isExpired', async () => {
    prisma.carrierInsurance.findFirst.mockResolvedValue({
      id: 'i1',
      insuranceType: 'CARGO',
      coverageAmount: { toNumber: () => 100000 },
      expirationDate: new Date(Date.now() - 86400000),
    });
    prisma.carrierInsurance.update.mockResolvedValue({
      id: 'i1',
      carrierId: 'c1',
      expirationDate: new Date(Date.now() - 86400000),
    });

    await service.update('tenant-1', 'user-1', 'i1', { coverageAmount: 100000 } as any);

    expect(prisma.carrierInsurance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isExpired: true, updatedById: 'user-1' }) }),
    );
  });

  it('removes insurance with soft delete', async () => {
    prisma.carrierInsurance.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.carrierInsurance.update.mockResolvedValue({ id: 'i1' });

    const result = await service.remove('tenant-1', 'user-1', 'i1');

    expect(result).toEqual({ success: true });
    expect(prisma.carrierInsurance.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date), isExpired: true }) }),
    );
  });

  it('verifies insurance record', async () => {
    prisma.carrierInsurance.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.carrierInsurance.update.mockResolvedValue({ id: 'i1', isVerified: true });

    const result = await service.verify('tenant-1', 'user-1', 'i1');

    expect(result.isVerified).toBe(true);
  });

  it('returns expiring policies', async () => {
    prisma.carrierInsurance.findMany.mockResolvedValue([{ id: 'i1' }]);

    const result = await service.expiring('tenant-1', 10);

    expect(result).toEqual([{ id: 'i1' }]);
  });
});