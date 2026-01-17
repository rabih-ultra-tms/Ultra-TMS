import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StopsService } from './stops.service';
import { PrismaService } from '../../prisma.service';

describe('StopsService', () => {
  let service: StopsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      order: { findFirst: jest.fn(), update: jest.fn() },
      stop: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), count: jest.fn() },
      statusHistory: { create: jest.fn() },
      $transaction: jest.fn(),
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StopsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(StopsService);
  });

  it('creates stop', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.stop.create.mockResolvedValue({ id: 's1' });

    const result = await service.create('t1', 'o1', 'u1', { stopType: 'PICKUP', city: 'A', state: 'TX' } as any);

    expect(result.id).toBe('s1');
  });

  it('throws when order missing on create', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.create('t1', 'o1', 'u1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('lists stops for order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.stop.findMany.mockResolvedValue([]);

    const result = await service.findAllForOrder('t1', 'o1');

    expect(result).toEqual([]);
  });

  it('throws when order missing on list', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.findAllForOrder('t1', 'o1')).rejects.toThrow(NotFoundException);
  });

  it('returns stop by id', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1' });

    const result = await service.findOne('t1', 's1');

    expect(result).toEqual({ id: 's1' });
  });

  it('throws when stop missing', async () => {
    prisma.stop.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('throws when stop missing on update', async () => {
    prisma.stop.findFirst.mockResolvedValue(null);

    await expect(service.update('t1', 'u1', 's1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updates stop fields', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', stopType: 'PICKUP', stopSequence: 1 });
    prisma.stop.update.mockResolvedValue({ id: 's1', stopType: 'DELIVERY' });

    const result = await service.update('t1', 'u1', 's1', { stopType: 'DELIVERY' } as any);

    expect(result.stopType).toBe('DELIVERY');
  });

  it('marks arrived and emits', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', orderId: 'o1', stopType: 'PICKUP', status: 'PENDING', arrivedAt: null });
    prisma.order.findFirst.mockResolvedValue({ status: 'ASSIGNED' });
    prisma.stop.update.mockResolvedValue({ id: 's1', status: 'AT_PICKUP', arrivedAt: new Date() });
    prisma.order.update.mockResolvedValue({ id: 'o1' });
    prisma.statusHistory.create.mockResolvedValue({ id: 'h1' });

    const result = await service.markArrived('t1', 'u1', 's1');

    expect(result.status).toBe('AT_PICKUP');
    expect(events.emit).toHaveBeenCalledWith('stop.arrived', expect.any(Object));
  });

  it('throws when stop missing on arrival', async () => {
    prisma.stop.findFirst.mockResolvedValue(null);

    await expect(service.markArrived('t1', 'u1', 's1')).rejects.toThrow(NotFoundException);
  });

  it('blocks arrival when already arrived', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', arrivedAt: new Date() });

    await expect(service.markArrived('t1', 'u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('blocks departure when not arrived', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', arrivedAt: null });

    await expect(service.markDeparted('t1', 'u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('blocks departure when already departed', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', arrivedAt: new Date(), departedAt: new Date() });

    await expect(service.markDeparted('t1', 'u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('marks departed and completes order when last stop', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', orderId: 'o1', status: 'AT_PICKUP', arrivedAt: new Date(), departedAt: null });
    prisma.order.findFirst.mockResolvedValue({ status: 'IN_TRANSIT' });
    prisma.stop.update.mockResolvedValue({ id: 's1', status: 'COMPLETED', departedAt: new Date() });
    prisma.stop.count.mockResolvedValue(0);
    prisma.order.update.mockResolvedValue({ id: 'o1', status: 'DELIVERED' });
    prisma.statusHistory.create.mockResolvedValue({ id: 'h1' });

    const result = await service.markDeparted('t1', 'u1', 's1');

    expect(result.status).toBe('COMPLETED');
    expect(events.emit).toHaveBeenCalledWith('stop.departed', expect.any(Object));
    expect(events.emit).toHaveBeenCalledWith('stop.completed', expect.any(Object));
  });

  it('marks departed and keeps order in transit when remaining stops exist', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', orderId: 'o1', status: 'AT_PICKUP', arrivedAt: new Date(), departedAt: null });
    prisma.order.findFirst.mockResolvedValue({ status: 'IN_TRANSIT' });
    prisma.stop.update.mockResolvedValue({ id: 's1', status: 'COMPLETED', departedAt: new Date() });
    prisma.stop.count.mockResolvedValue(1);
    prisma.order.update.mockResolvedValue({ id: 'o1', status: 'IN_TRANSIT' });
    prisma.statusHistory.create.mockResolvedValue({ id: 'h1' });

    const result = await service.markDeparted('t1', 'u1', 's1');

    expect(result.status).toBe('COMPLETED');
  });

  it('reorders stops', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.$transaction.mockResolvedValue([]);
    prisma.stop.findMany.mockResolvedValue([]);

    const result = await service.reorder('t1', 'u1', 'o1', ['s1', 's2']);

    expect(result).toEqual([]);
  });

  it('throws when reordering missing order', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.reorder('t1', 'u1', 'o1', ['s1'])).rejects.toThrow(NotFoundException);
  });

  it('blocks delete when arrived', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', arrivedAt: new Date(), orderId: 'o1' });

    await expect(service.delete('t1', 'u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('deletes stop and resequences', async () => {
    prisma.stop.findFirst.mockResolvedValue({ id: 's1', arrivedAt: null, orderId: 'o1' });
    prisma.stop.update.mockResolvedValue({ id: 's1' });
    prisma.stop.findMany.mockResolvedValue([{ id: 's2' }]);
    prisma.$transaction.mockResolvedValue([]);

    const result = await service.delete('t1', 'u1', 's1');

    expect(result.success).toBe(true);
  });
});
