import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CarrierPortalInvoicesService } from './carrier-portal-invoices.service';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalInvoicesService', () => {
  let service: CarrierPortalInvoicesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      carrierInvoiceSubmission: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
      settlement: { findMany: jest.fn(), findFirst: jest.fn() },
      carrierQuickPayRequest: { create: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalInvoicesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalInvoicesService);
  });

  it('rejects submit without loads', async () => {
    await expect(service.submitInvoice('t1', 'c1', 'u1', { loadIds: [] } as any)).rejects.toThrow(BadRequestException);
  });

  it('submits invoice', async () => {
    prisma.carrierInvoiceSubmission.create.mockResolvedValue({ id: 'i1' });

    const result = await service.submitInvoice('t1', 'c1', 'u1', { loadIds: ['l1'], totalAmount: 100, carrierInvoiceNumber: 'INV1' } as any);

    expect(result).toHaveLength(1);
  });

  it('throws when invoice missing', async () => {
    prisma.carrierInvoiceSubmission.findFirst.mockResolvedValue(null);

    await expect(service.invoiceDetail('t1', 'c1', 'i1')).rejects.toThrow(NotFoundException);
  });

  it('throws when settlement missing', async () => {
    prisma.settlement.findFirst.mockResolvedValue(null);

    await expect(service.settlementDetail('t1', 'c1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('rejects quick pay when terms not accepted', async () => {
    await expect(service.quickPay('t1', 'c1', 'u1', 's1', { acceptTerms: false } as any)).rejects.toThrow(BadRequestException);
  });

  it('rejects quick pay when below minimum', async () => {
    prisma.settlement.findFirst.mockResolvedValue({ id: 's1', netAmount: 50 });

    await expect(service.quickPay('t1', 'c1', 'u1', 's1', { acceptTerms: true } as any)).rejects.toThrow(BadRequestException);
  });

  it('creates quick pay request', async () => {
    prisma.settlement.findFirst.mockResolvedValue({ id: 's1', netAmount: 200 });
    prisma.carrierQuickPayRequest.create.mockResolvedValue({ id: 'q1' });

    const result = await service.quickPay('t1', 'c1', 'u1', 's1', { acceptTerms: true } as any);

    expect(result.id).toBe('q1');
  });

  it('returns payment history', async () => {
    prisma.carrierQuickPayRequest.findMany.mockResolvedValue([]);

    const result = await service.paymentHistory('t1', 'c1');

    expect(result).toEqual([]);
  });
});
