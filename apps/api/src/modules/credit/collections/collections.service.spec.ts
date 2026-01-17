import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CollectionsService } from './collections.service';
import { PrismaService } from '../../../prisma.service';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      collectionActivity: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
      company: { findFirst: jest.fn() },
      invoice: { findMany: jest.fn(), findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(CollectionsService);
  });

  it('returns queue', async () => {
    prisma.collectionActivity.findMany.mockResolvedValue([]);
    prisma.collectionActivity.count.mockResolvedValue(0);

    const result = await service.queue('tenant-1', {} as any);

    expect(result.total).toBe(0);
  });

  it('creates activity and emits event', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.collectionActivity.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', activityType: 'CALL' } as any);

    expect(events.emit).toHaveBeenCalledWith('collection.activity.logged', expect.any(Object));
  });

  it('rejects create when company missing', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(service.create('tenant-1', 'u1', { companyId: 'c1', activityType: 'CALL' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects create when invoice missing', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'u1', { companyId: 'c1', invoiceId: 'i1', activityType: 'CALL' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates activity with invoice', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.invoice.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.collectionActivity.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', invoiceId: 'i1', activityType: 'CALL' } as any);

    expect(prisma.collectionActivity.create).toHaveBeenCalled();
  });

  it('throws when activity missing', async () => {
    prisma.collectionActivity.findFirst.mockResolvedValue(null);

    await expect(service.update('tenant-1', 'u1', 'a1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updates activity with dates and invoice', async () => {
    prisma.collectionActivity.findFirst.mockResolvedValue({ id: 'a1', companyId: 'c1' });
    prisma.invoice.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.collectionActivity.update.mockResolvedValue({ id: 'a1' });

    await service.update('tenant-1', 'u1', 'a1', {
      invoiceId: 'i1',
      followUpDate: null,
      promisedPaymentDate: '2026-01-01',
    } as any);

    expect(prisma.collectionActivity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ followUpDate: null, promisedPaymentDate: new Date('2026-01-01') }),
      }),
    );
  });

  it('returns history by customer', async () => {
    prisma.collectionActivity.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.historyByCustomer('tenant-1', 'c1');

    expect(result).toEqual([{ id: 'a1' }]);
  });

  it('returns aging report', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      { dueDate: new Date(Date.now() + 86400000), balanceDue: 10 },
      { dueDate: new Date(Date.now() - 10 * 86400000), balanceDue: 20 },
      { dueDate: new Date(Date.now() - 40 * 86400000), balanceDue: 30 },
      { dueDate: new Date(Date.now() - 70 * 86400000), balanceDue: 40 },
      { dueDate: new Date(Date.now() - 120 * 86400000), balanceDue: 50 },
    ]);

    const result = await service.agingReport('tenant-1');

    expect(result.CURRENT).toBe(10);
    expect(result['1-30']).toBe(20);
    expect(result['31-60']).toBe(30);
    expect(result['61-90']).toBe(40);
    expect(result['90+']).toBe(50);
  });

  it('returns follow-ups due', async () => {
    prisma.collectionActivity.findMany.mockResolvedValue([{ id: 'a1' }]);

    const result = await service.followUpsDue('tenant-1');

    expect(result).toEqual([{ id: 'a1' }]);
  });
});
