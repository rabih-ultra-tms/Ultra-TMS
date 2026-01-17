import { Test, TestingModule } from '@nestjs/testing';
import { CarrierDocumentStatus } from '@prisma/client';
import { CarrierPortalComplianceService } from './carrier-portal-compliance.service';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalComplianceService', () => {
  let service: CarrierPortalComplianceService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { carrierPortalDocument: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalComplianceService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalComplianceService);
  });

  it('returns compliance status', async () => {
    prisma.carrierPortalDocument.findMany.mockResolvedValue([
      { status: CarrierDocumentStatus.APPROVED },
      { status: CarrierDocumentStatus.REVIEWING },
    ]);

    const result = await service.status('t1', 'c1');

    expect(result.total).toBe(2);
    expect(result.expiring).toBe(1);
  });

  it('returns required docs', () => {
    const result = service.requiredDocs();

    expect(result.length).toBeGreaterThan(0);
  });

  it('uploads compliance doc', async () => {
    prisma.carrierPortalDocument.create.mockResolvedValue({ id: 'd1' });

    const result = await service.upload('t1', 'c1', 'u1', { fileName: 'doc.pdf' });

    expect(result.id).toBe('d1');
  });

  it('returns expiring docs', async () => {
    prisma.carrierPortalDocument.findMany.mockResolvedValue([]);

    const result = await service.expiring('t1', 'c1');

    expect(result).toEqual([]);
  });
});
