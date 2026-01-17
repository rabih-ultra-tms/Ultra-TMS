import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DqfService } from './dqf.service';
import { PrismaService } from '../../../prisma.service';

describe('DqfService', () => {
  let service: DqfService;
  let prisma: {
    driverQualificationFile: { findMany: jest.Mock; create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    driver: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      driverQualificationFile: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      driver: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DqfService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(DqfService);
  });

  it('lists DQF entries', async () => {
    prisma.driverQualificationFile.findMany.mockResolvedValue([]);

    await service.list('tenant-1');

    expect(prisma.driverQualificationFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('creates DQF entry and marks expired', async () => {
    prisma.driver.findFirst.mockResolvedValue({ id: 'd1' });
    prisma.driverQualificationFile.create.mockResolvedValue({ id: 'dqf-1' });

    const past = new Date(Date.now() - 86400000).toISOString();
    await service.create('tenant-1', 'user-1', {
      driverId: 'd1',
      documentType: 'MEDICAL',
      expirationDate: past,
      isVerified: true,
    } as any);

    expect(prisma.driverQualificationFile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isExpired: true, createdById: 'user-1' }) }),
    );
  });

  it('throws when DQF record not found', async () => {
    prisma.driverQualificationFile.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'dqf-1')).rejects.toThrow(NotFoundException);
  });

  it('updates DQF entry and refreshes expiration', async () => {
    prisma.driverQualificationFile.findFirst.mockResolvedValue({ id: 'dqf-1', isExpired: true, expirationDate: null });
    prisma.driverQualificationFile.update.mockResolvedValue({ id: 'dqf-1' });

    await service.update('tenant-1', 'user-1', 'dqf-1', { expirationDate: '2099-01-01' } as any);

    expect(prisma.driverQualificationFile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isExpired: false, updatedById: 'user-1' }) }),
    );
  });

  it('removes DQF entry', async () => {
    prisma.driverQualificationFile.findFirst.mockResolvedValue({ id: 'dqf-1' });
    prisma.driverQualificationFile.update.mockResolvedValue({ id: 'dqf-1' });

    const result = await service.remove('tenant-1', 'user-1', 'dqf-1');

    expect(result).toEqual({ success: true });
  });

  it('computes compliance status', async () => {
    prisma.driverQualificationFile.findFirst.mockResolvedValue({
      id: 'dqf-1',
      expirationDate: new Date(Date.now() - 86400000),
      isVerified: false,
      documentUrl: null,
    });

    const result = await service.compliance('tenant-1', 'dqf-1');

    expect(result.status).toBe('EXPIRED');
    expect(result.missingDocuments).toEqual(expect.arrayContaining(['DOCUMENT_URL', 'RENEWAL']));
  });

  it('adds document and resets verification', async () => {
    prisma.driverQualificationFile.findFirst.mockResolvedValue({ id: 'dqf-1', isExpired: false, expirationDate: null });
    prisma.driverQualificationFile.update.mockResolvedValue({ id: 'dqf-1' });

    await service.addDocument('tenant-1', 'user-1', 'dqf-1', { documentUrl: 'url' } as any);

    expect(prisma.driverQualificationFile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isVerified: false, updatedById: 'user-1' }) }),
    );
  });
});
