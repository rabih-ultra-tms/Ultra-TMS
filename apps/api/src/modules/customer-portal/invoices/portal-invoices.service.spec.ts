import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PortalInvoicesService } from './portal-invoices.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalInvoicesService', () => {
  let service: PortalInvoicesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      invoice: { findMany: jest.fn(), findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalInvoicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalInvoicesService);
  });

  it('lists invoices', async () => {
    prisma.invoice.findMany.mockResolvedValue([]);

    const result = await service.list('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('returns invoice detail', async () => {
    prisma.invoice.findFirst.mockResolvedValue({ id: 'i1', lineItems: [] });

    const result = await service.detail('t1', 'c1', 'i1');

    expect(result.id).toBe('i1');
  });

  it('throws when invoice missing', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'c1', 'i1')).rejects.toThrow(NotFoundException);
  });

  it('computes aging buckets', async () => {
    prisma.invoice.findMany.mockResolvedValue([{ dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), balanceDue: 100 }]);

    const result = await service.aging('t1', 'c1');

    expect(result['1-30']).toBe(100);
  });

  it('computes current and 90+ buckets', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      { dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), balanceDue: 50 },
      { dueDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), balanceDue: 200 },
    ]);

    const result = await service.aging('t1', 'c1');

    expect(result.CURRENT).toBe(50);
    expect(result['90+']).toBe(200);
  });

  it('returns statement info', () => {
    const result = service.statement('t1', 'c1', '2025-01');

    expect(result.downloadUrl).toContain('/statements/');
  });
});
