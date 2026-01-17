import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AmendmentsService } from './amendments.service';
import { PrismaService } from '../../../prisma.service';

describe('AmendmentsService', () => {
  let service: AmendmentsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { contractAmendment: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() } };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AmendmentsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(AmendmentsService);
  });

  it('lists amendments', async () => {
    prisma.contractAmendment.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1', 'c1');

    expect(result).toEqual([]);
  });

  it('creates amendment and emits', async () => {
    prisma.contractAmendment.count.mockResolvedValue(0);
    prisma.contractAmendment.create.mockResolvedValue({ id: 'a1', contractId: 'c1' });

    const result = await service.create('tenant-1', 'c1', 'u1', { effectiveDate: '2025-01-01' } as any);

    expect(result.id).toBe('a1');
    expect(events.emit).toHaveBeenCalledWith('amendment.created', expect.any(Object));
  });

  it('throws when amendment missing', async () => {
    prisma.contractAmendment.findFirst.mockResolvedValue(null);

    await expect(service.detail('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('approves amendment', async () => {
    prisma.contractAmendment.findFirst.mockResolvedValue({ id: 'a1', contractId: 'c1' });
    prisma.contractAmendment.update.mockResolvedValue({ id: 'a1', contractId: 'c1' });

    await service.approve('a1', 'tenant-1', 'u1');

    expect(events.emit).toHaveBeenCalledWith('amendment.approved', expect.any(Object));
  });
});
