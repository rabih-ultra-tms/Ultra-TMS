import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      company: { findFirst: jest.fn() },
      stop: { findMany: jest.fn() },
      load: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
      orderItem: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      statusHistory: { create: jest.fn(), findMany: jest.fn() },
      quote: { findFirst: jest.fn(), update: jest.fn() },
      orderTemplate: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(OrdersService);
  });

  it('lists orders with pagination', async () => {
    prisma.order.findMany.mockResolvedValue([]);
    prisma.order.count.mockResolvedValue(0);

    const result = await service.findAll('tenant-1', {} as any);

    expect(result.pagination.total).toBe(0);
  });

  it('throws when order not found', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'o1')).rejects.toThrow(NotFoundException);
  });

  it('requires at least two stops', async () => {
    await expect(service.create('tenant-1', { customerId: 'c1', stops: [] } as any, 'user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates order and emits event', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.order.create.mockResolvedValue({ id: 'o1', orderNumber: 'ORD-20250101-ABCD', customerId: 'c1' });

    const result = await service.create(
      'tenant-1',
      {
        customerId: 'c1',
        stops: [
          { stopType: 'PICKUP', companyName: 'A', address: 'a', city: 'c', state: 'TX', zip: '1' },
          { stopType: 'DELIVERY', companyName: 'B', address: 'b', city: 'd', state: 'CA', zip: '2' },
        ],
      } as any,
      'user-1',
    );

    expect(result.id).toBe('o1');
    expect(events.emit).toHaveBeenCalledWith('order.created', expect.objectContaining({ orderId: 'o1' }));
  });

  it('prevents invalid status transition', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'PENDING' });

    await expect(service.changeStatus('tenant-1', 'o1', { status: 'IN_TRANSIT' } as any, 'user-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('prevents cancellation for completed order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'COMPLETED' });

    await expect(service.cancel('tenant-1', 'o1', { reason: 'N/A' } as any, 'user-1')).rejects.toThrow(ConflictException);
  });

  it('prevents delete when loads exist', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.load.count.mockResolvedValue(1);

    await expect(service.delete('tenant-1', 'o1', 'user-1')).rejects.toThrow(ConflictException);
  });

  it('throws when quote not found on createFromQuote', async () => {
    prisma.quote.findFirst.mockResolvedValue(null);

    await expect(service.createFromQuote('tenant-1', 'user-1', 'q1')).rejects.toThrow(NotFoundException);
  });

  it('throws when quote missing companyId on createFromQuote', async () => {
    prisma.quote.findFirst.mockResolvedValue({ id: 'q1', companyId: null, stops: [] });

    await expect(service.createFromQuote('tenant-1', 'user-1', 'q1')).rejects.toThrow(BadRequestException);
  });

  it('prevents update when order is completed', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'COMPLETED' });

    await expect(service.update('tenant-1', 'o1', { customerReference: 'R1' } as any, 'user-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('updates order and emits event', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 'o1',
      status: 'PENDING',
      customerReference: 'R0',
      specialInstructions: 'old',
    });
    prisma.order.update.mockResolvedValue({ id: 'o1', customerReference: 'R1' });

    const result = await service.update('tenant-1', 'o1', { customerReference: 'R1' } as any, 'user-1');

    expect(result.customerReference).toBe('R1');
    expect(events.emit).toHaveBeenCalledWith('order.updated',
      expect.objectContaining({ orderId: 'o1', tenantId: 'tenant-1' }),
    );
  });

  it('throws when template not found on createFromTemplate', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(service.createFromTemplate('tenant-1', 'user-1', 't1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('throws when template missing customerId on createFromTemplate', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 't1', customerId: null, stops: [], items: [] });

    await expect(service.createFromTemplate('tenant-1', 'user-1', 't1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('deletes order when no loads exist', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'PENDING' });
    prisma.load.count.mockResolvedValue(0);
    prisma.order.update.mockResolvedValue({ id: 'o1' });

    const result = await service.delete('tenant-1', 'o1', 'user-1');

    expect(result).toEqual({ id: 'o1' });
  });

  it('returns order status history', async () => {
    prisma.statusHistory.findMany.mockResolvedValue([{ id: 'h1' }]);

    const result = await service.getStatusHistory('tenant-1', 'o1');

    expect(result).toEqual([{ id: 'h1' }]);
  });

  it('changes order status and emits event', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'PENDING' });
    prisma.order.update.mockResolvedValue({ id: 'o1', status: 'QUOTED' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.changeStatus('tenant-1', 'o1', { status: 'QUOTED' } as any, 'user-1');

    expect(result.status).toBe('QUOTED');
    expect(events.emit).toHaveBeenCalledWith('order.status.changed',
      expect.objectContaining({ orderId: 'o1', oldStatus: 'PENDING', newStatus: 'QUOTED', tenantId: 'tenant-1' }),
    );
  });

  it('cancels order and emits events', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', status: 'BOOKED' });
    prisma.order.update.mockResolvedValue({ id: 'o1', status: 'CANCELLED' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.cancel('tenant-1', 'o1', { reason: 'No capacity' } as any, 'user-1');

    expect(result.status).toBe('CANCELLED');
    expect(events.emit).toHaveBeenCalledWith('order.cancelled',
      expect.objectContaining({ orderId: 'o1', tenantId: 'tenant-1' }),
    );
    expect(events.emit).toHaveBeenCalledWith('order.status.changed',
      expect.objectContaining({ orderId: 'o1', oldStatus: 'BOOKED', newStatus: 'CANCELLED', tenantId: 'tenant-1' }),
    );
  });

  it('throws when order item not found on removeItem', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.orderItem.findFirst.mockResolvedValue(null);

    await expect(service.removeItem('tenant-1', 'user-1', 'o1', 'i1')).rejects.toThrow(NotFoundException);
  });

  it('removes order item when found', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1' });
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.orderItem.update.mockResolvedValue({ id: 'i1' });

    await service.removeItem('tenant-1', 'user-1', 'o1', 'i1');

    expect(prisma.orderItem.update).toHaveBeenCalledWith({
      where: { id: 'i1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date), updatedById: 'user-1' }),
    });
  });

  it('creates order from quote and updates quote', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'q1',
      companyId: 'c1',
      quoteNumber: 'Q-1',
      stops: [{ stopType: 'PICKUP', facilityName: 'A', addressLine1: 'a', city: 'x', state: 'TX', postalCode: '1', stopSequence: 1 }],
    });
    prisma.quote.update.mockResolvedValue({ id: 'q1', status: 'CONVERTED' });
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({ id: 'o1' } as any);

    const result = await service.createFromQuote('tenant-1', 'user-1', 'q1');

    expect(result.id).toBe('o1');
    expect(prisma.quote.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'q1' }, data: expect.objectContaining({ status: 'CONVERTED' }) }),
    );
    createSpy.mockRestore();
  });

  it('creates order from template', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 't1',
      customerId: 'c1',
      customerReference: 'REF',
      specialInstructions: 'x',
      stops: [{ stopType: 'PICKUP', facilityName: 'A', addressLine1: 'a', city: 'x', state: 'TX', postalCode: '1', stopSequence: 1 }],
      items: [{ description: 'Item', quantity: 1 }],
    });
    const createSpy = jest.spyOn(service, 'create').mockResolvedValue({ id: 'o1' } as any);

    const result = await service.createFromTemplate('tenant-1', 'user-1', 't1', {} as any);

    expect(result.id).toBe('o1');
    createSpy.mockRestore();
  });

  it('clones order with stops', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 'o1',
      customerId: 'c1',
      customerReference: 'R',
      specialInstructions: 'S',
      stops: [{ stopType: 'PICKUP', facilityName: 'A', addressLine1: 'a', city: 'x', state: 'TX', postalCode: '1', stopSequence: 1 }],
      loads: [],
      items: [],
    });
    prisma.order.create.mockResolvedValue({ id: 'o2' });

    const result = await service.clone('tenant-1', 'o1', {} as any, 'user-1');

    expect(result).toEqual({ id: 'o2' });
  });

  it('returns stops for order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', stops: [], loads: [], items: [] });
    prisma.stop.findMany.mockResolvedValue([{ id: 's1' }]);

    const result = await service.getStops('tenant-1', 'o1');

    expect(result).toEqual([{ id: 's1' }]);
  });

  it('returns loads for order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', stops: [], loads: [], items: [] });
    prisma.load.findMany.mockResolvedValue([{ id: 'l1' }]);

    const result = await service.getLoads('tenant-1', 'o1');

    expect(result).toEqual([{ id: 'l1' }]);
  });

  it('returns items for order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', stops: [], loads: [], items: [] });
    prisma.orderItem.findMany.mockResolvedValue([{ id: 'i1' }]);

    const result = await service.getItems('tenant-1', 'o1');

    expect(result).toEqual([{ id: 'i1' }]);
  });

  it('adds item to order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', stops: [], loads: [], items: [] });
    prisma.orderItem.create.mockResolvedValue({ id: 'i1' });

    const result = await service.addItem('tenant-1', 'user-1', 'o1', { description: 'Item' } as any);

    expect(result).toEqual({ id: 'i1' });
  });

  it('updates item on order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'o1', stops: [], loads: [], items: [] });
    prisma.orderItem.findFirst.mockResolvedValue({ id: 'i1', description: 'Old' });
    prisma.orderItem.update.mockResolvedValue({ id: 'i1', description: 'New' });

    const result = await service.updateItem('tenant-1', 'user-1', 'o1', 'i1', { description: 'New' } as any);

    expect(result.description).toBe('New');
  });
});
