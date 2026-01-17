import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InsurancesService } from './insurances.service';
import { PrismaService } from '../../prisma.service';
import { InsuranceType } from './dto';

describe('InsurancesService', () => {
  let service: InsurancesService;
  let prisma: {
    carrier: { findFirst: jest.Mock };
    insuranceCertificate: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findMany: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      carrier: { findFirst: jest.fn() },
      insuranceCertificate: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsurancesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(InsurancesService);
  });

  it('rejects below minimum coverage', async () => {
    await expect(
      service.create('tenant-1', 'car-1', 'user-1', {
        type: InsuranceType.AUTO_LIABILITY,
        coverageAmount: 1,
        effectiveDate: new Date().toISOString(),
        expirationDate: new Date(Date.now() + 86400000).toISOString(),
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when carrier not found', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.findAllForCarrier('tenant-1', 'car-1', {} as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects update when insurance not found', async () => {
    prisma.insuranceCertificate.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'ins-1', {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates insurance and expires existing active certificate', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.insuranceCertificate.findFirst.mockResolvedValue({ id: 'ins-old' });
    prisma.insuranceCertificate.update.mockResolvedValue({ id: 'ins-old', status: 'EXPIRED' });
    prisma.insuranceCertificate.create.mockResolvedValue({ id: 'ins-1', status: 'ACTIVE' });

    const result = await service.create('tenant-1', 'car-1', 'user-1', {
      type: InsuranceType.AUTO_LIABILITY,
      coverageAmount: 1_000_000,
      effectiveDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
    } as any);

    expect(result.status).toBe('ACTIVE');
    expect(prisma.insuranceCertificate.update).toHaveBeenCalledWith({
      where: { id: 'ins-old' },
      data: { status: 'EXPIRED' },
    });
  });

  it('lists carrier insurance with default active filter', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.insuranceCertificate.findMany.mockResolvedValue([{ id: 'ins-1' }]);

    const result = await service.findAllForCarrier('tenant-1', 'car-1', {} as any);

    expect(result).toEqual([{ id: 'ins-1' }]);
    expect(prisma.insuranceCertificate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) }),
    );
  });

  it('finds insurance by id', async () => {
    prisma.insuranceCertificate.findFirst.mockResolvedValue({ id: 'ins-1' });

    const result = await service.findOne('tenant-1', 'ins-1');

    expect(result).toEqual({ id: 'ins-1' });
  });

  it('updates insurance when valid', async () => {
    prisma.insuranceCertificate.findFirst.mockResolvedValue({
      id: 'ins-1',
      insuranceType: InsuranceType.AUTO_LIABILITY,
      coverageAmount: 1_000_000,
      effectiveDate: new Date('2026-01-01'),
      expirationDate: new Date('2026-02-01'),
      status: 'ACTIVE',
    });
    prisma.insuranceCertificate.update.mockResolvedValue({ id: 'ins-1', status: 'ACTIVE' });

    const result = await service.update('tenant-1', 'ins-1', { coverageAmount: 1_500_000 } as any);

    expect(result.id).toBe('ins-1');
  });

  it('verifies insurance', async () => {
    prisma.insuranceCertificate.findFirst.mockResolvedValue({ id: 'ins-1', verified: false });
    prisma.insuranceCertificate.update.mockResolvedValue({ id: 'ins-1', verified: true });

    const result = await service.verify('tenant-1', 'ins-1', 'user-1');

    expect(result.verified).toBe(true);
  });

  it('deletes insurance', async () => {
    prisma.insuranceCertificate.findFirst.mockResolvedValue({ id: 'ins-1' });
    prisma.insuranceCertificate.delete.mockResolvedValue({ id: 'ins-1' });

    const result = await service.delete('tenant-1', 'ins-1');

    expect(result.success).toBe(true);
  });

  it('marks expired insurance in batch', async () => {
    prisma.insuranceCertificate.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.checkExpiredInsurance('tenant-1');

    expect(result.expiredCount).toBe(3);
  });
});
