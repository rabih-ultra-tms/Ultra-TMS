import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditHoldsService } from './credit-holds.service';
import { PrismaService } from '../../../prisma.service';

describe('CreditHoldsService', () => {
  let service: CreditHoldsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { creditHold: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() }, company: { findFirst: jest.fn() } };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditHoldsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(CreditHoldsService);
  });

  it('lists credit holds', async () => {
    prisma.creditHold.findMany.mockResolvedValue([]);
    prisma.creditHold.count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', {} as any);

    expect(result.total).toBe(0);
  });

  it('throws when hold missing', async () => {
    prisma.creditHold.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'h1')).rejects.toThrow(NotFoundException);
  });

  it('creates hold and emits event', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditHold.create.mockResolvedValue({ id: 'h1', companyId: 'c1' });

    await service.create('tenant-1', 'u1', { companyId: 'c1', reason: 'OVERDUE' } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.hold.placed', expect.any(Object));
  });

  it('releases hold', async () => {
    prisma.creditHold.findFirst.mockResolvedValue({ id: 'h1', isActive: true, companyId: 'c1' });
    prisma.creditHold.update.mockResolvedValue({ id: 'h1', companyId: 'c1' });

    await service.release('tenant-1', 'h1', { releasedById: 'u1' } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.hold.released', expect.any(Object));
  });
});
