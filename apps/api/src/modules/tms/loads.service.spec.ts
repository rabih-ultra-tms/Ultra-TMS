import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoadsService } from './loads.service';
import { PrismaService } from '../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('LoadsService', () => {
  let service: LoadsService;
  let prisma: {
    order: { findFirst: jest.Mock };
    load: { findFirst: jest.Mock; findMany: jest.Mock; count: jest.Mock; create: jest.Mock; update: jest.Mock };
    carrier: { findFirst: jest.Mock };
    checkCall: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    statusHistory: { create: jest.Mock };
  };
  const eventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    prisma = {
      order: { findFirst: jest.fn() },
      load: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      carrier: { findFirst: jest.fn() },
      checkCall: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      statusHistory: { create: jest.fn() },
    };

    eventEmitter.emit.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(LoadsService);
  });

  it('throws when order not found on create', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'user-1', { orderId: 'order-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates load and emits event', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'order-1' });
    prisma.load.findFirst.mockResolvedValueOnce(null);
    prisma.load.create.mockResolvedValue({
      id: 'load-1',
      loadNumber: 'LD2026010001',
      orderId: 'order-1',
    });

    const result = await service.create('tenant-1', 'user-1', { orderId: 'order-1' } as any);

    expect(result.id).toBe('load-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.created',
      expect.objectContaining({ loadId: 'load-1', orderId: 'order-1', tenantId: 'tenant-1' }),
    );
  });

  it('creates load with load number in expected format', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-15T00:00:00Z'));
    prisma.order.findFirst.mockResolvedValue({ id: 'order-1' });
    prisma.load.findFirst.mockResolvedValueOnce(null);
    prisma.load.create.mockResolvedValue({
      id: 'load-1',
      loadNumber: 'LD2026010001',
      orderId: 'order-1',
    });

    const result = await service.create('tenant-1', 'user-1', { orderId: 'order-1' } as any);

    expect(result.loadNumber).toMatch(/^LD\d{6}\d{4}$/);
    jest.useRealTimers();
  });

  it('increments load number sequence on create', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-15T00:00:00Z'));
    prisma.order.findFirst.mockResolvedValue({ id: 'order-1' });
    prisma.load.findFirst.mockResolvedValue({ id: 'l1', loadNumber: 'LD2026010007' });
    prisma.load.create.mockResolvedValue({ id: 'load-1', loadNumber: 'LD2026010008', orderId: 'order-1' });

    await service.create('tenant-1', 'user-1', { orderId: 'order-1' } as any);

    expect(prisma.load.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ loadNumber: 'LD2026010008' }),
      }),
    );
    jest.useRealTimers();
  });

  it('throws when load not found', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'load-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns load with relations', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', order: { id: 'order-1' }, carrier: { id: 'car-1' } });

    const result = await service.findOne('tenant-1', 'load-1');

    expect(result.id).toBe('load-1');
    expect(result.order.id).toBe('order-1');
    expect(result.carrier?.id).toBe('car-1');
  });

  it('returns paginated loads', async () => {
    prisma.load.findMany.mockResolvedValue([{ id: 'load-1' }]);
    prisma.load.count.mockResolvedValue(10);

    const result = await service.findAll('tenant-1', { page: 2, limit: 5, status: 'PENDING' } as any);

    expect(result).toEqual({ data: [{ id: 'load-1' }], total: 10, page: 2, limit: 5 });
  });

  it('applies filters when listing loads', async () => {
    prisma.load.findMany.mockResolvedValue([]);
    prisma.load.count.mockResolvedValue(0);

    await service.findAll('tenant-1', {
      page: 3,
      limit: 10,
      status: 'PENDING',
      carrierId: 'car-1',
      orderId: 'order-1',
      dispatcherId: 'user-1',
      equipmentType: 'VAN',
      fromDate: '2026-01-01T00:00:00Z',
      toDate: '2026-01-02T00:00:00Z',
      search: 'LD2026',
    } as any);

    expect(prisma.load.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          status: 'PENDING',
          carrierId: 'car-1',
          orderId: 'order-1',
          createdById: 'user-1',
          equipmentType: 'VAN',
          createdAt: expect.objectContaining({
            gte: new Date('2026-01-01T00:00:00Z'),
            lte: new Date('2026-01-02T00:00:00Z'),
          }),
          OR: expect.any(Array),
        }),
        skip: 20,
        take: 10,
      }),
    );
  });

  it('rejects invalid status transition', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'DELIVERED' });

    await expect(
      service.update('tenant-1', 'load-1', 'user-1', { status: 'PENDING' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when updating missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tenant-1', 'load-1', 'user-1', { status: 'IN_TRANSIT' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('does not emit status change when status is not provided', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'PENDING' });

    await service.update('tenant-1', 'load-1', 'user-1', { carrierRate: 1000 } as any);

    expect(prisma.statusHistory.create).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('updates status to in-transit and records history', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'DISPATCHED' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.update('tenant-1', 'load-1', 'user-1', { status: 'IN_TRANSIT' } as any);

    expect(result.status).toBe('IN_TRANSIT');
    expect(prisma.statusHistory.create).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.status.changed',
      expect.objectContaining({ loadId: 'load-1', oldStatus: 'DISPATCHED', newStatus: 'IN_TRANSIT', tenantId: 'tenant-1' }),
    );
  });

  it('updates status to delivered and emits events', async () => {
    const deliveredAt = new Date('2026-01-01T00:00:00Z');
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT', orderId: 'order-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DELIVERED', deliveredAt, orderId: 'order-1' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.update('tenant-1', 'load-1', 'user-1', { status: 'DELIVERED' } as any);

    expect(result.status).toBe('DELIVERED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.status.changed',
      expect.objectContaining({ loadId: 'load-1', oldStatus: 'IN_TRANSIT', newStatus: 'DELIVERED', tenantId: 'tenant-1' }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.delivered',
      expect.objectContaining({ loadId: 'load-1', orderId: 'order-1', tenantId: 'tenant-1' }),
    );
  });

  it('sets deliveredAt when updating to delivered', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT', orderId: 'order-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DELIVERED' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.update('tenant-1', 'load-1', 'user-1', { status: 'DELIVERED' } as any);

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deliveredAt: expect.any(Date) }),
      }),
    );
  });

  it('throws when assigning carrier for missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.assignCarrier('tenant-1', 'load-1', 'user-1', { carrierId: 'car-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when carrier not found on assignCarrier', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.assignCarrier('tenant-1', 'load-1', 'user-1', { carrierId: 'car-1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('dispatches load and emits events', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'ACCEPTED', carrierId: 'car-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DISPATCHED' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.dispatch('tenant-1', 'load-1', 'user-1');

    expect(result.status).toBe('DISPATCHED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.dispatched',
      expect.objectContaining({ loadId: 'load-1', carrierId: 'car-1', tenantId: 'tenant-1' }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.status.changed',
      expect.objectContaining({ loadId: 'load-1', oldStatus: 'ACCEPTED', newStatus: 'DISPATCHED', tenantId: 'tenant-1' }),
    );
  });

  it('throws when dispatching missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.dispatch('tenant-1', 'load-1', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('records status history when dispatching', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'ACCEPTED', carrierId: 'car-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DISPATCHED' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.dispatch('tenant-1', 'load-1', 'user-1');

    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          oldStatus: 'ACCEPTED',
          newStatus: 'DISPATCHED',
          notes: 'Load dispatched',
        }),
      }),
    );
  });

  it('rejects dispatch when status transition is invalid', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING', carrierId: 'car-1' });

    await expect(service.dispatch('tenant-1', 'load-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('updates status via updateStatus and emits delivered event', async () => {
    const deliveredAt = new Date('2026-01-02T00:00:00Z');
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT', orderId: 'order-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DELIVERED', deliveredAt });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.updateStatus('tenant-1', 'load-1', 'user-1', 'DELIVERED', 'done');

    expect(result.status).toBe('DELIVERED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.status.changed',
      expect.objectContaining({ loadId: 'load-1', oldStatus: 'IN_TRANSIT', newStatus: 'DELIVERED', tenantId: 'tenant-1' }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.delivered',
      expect.objectContaining({ loadId: 'load-1', orderId: 'order-1', tenantId: 'tenant-1' }),
    );
  });

  it('rejects invalid status transition in updateStatus', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });

    await expect(
      service.updateStatus('tenant-1', 'load-1', 'user-1', 'DELIVERED'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when updating status for missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.updateStatus('tenant-1', 'load-1', 'user-1', 'IN_TRANSIT'),
    ).rejects.toThrow(NotFoundException);
  });

  it('sets deliveredAt when updateStatus moves to delivered', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'IN_TRANSIT', orderId: 'order-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DELIVERED' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.updateStatus('tenant-1', 'load-1', 'user-1', 'DELIVERED');

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deliveredAt: expect.any(Date) }),
      }),
    );
  });

  it('records notes on updateStatus history', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'ACCEPTED' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'DISPATCHED' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.updateStatus('tenant-1', 'load-1', 'user-1', 'DISPATCHED', 'progress update');

    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: 'progress update' }),
      }),
    );
  });

  it.each([
    ['PENDING', 'TENDERED'],
    ['PENDING', 'ACCEPTED'],
    ['PENDING', 'CANCELLED'],
    ['TENDERED', 'ACCEPTED'],
    ['TENDERED', 'CANCELLED'],
    ['ACCEPTED', 'DISPATCHED'],
    ['ACCEPTED', 'CANCELLED'],
    ['DISPATCHED', 'AT_PICKUP'],
    ['DISPATCHED', 'IN_TRANSIT'],
    ['DISPATCHED', 'CANCELLED'],
    ['AT_PICKUP', 'PICKED_UP'],
    ['AT_PICKUP', 'IN_TRANSIT'],
    ['PICKED_UP', 'IN_TRANSIT'],
    ['IN_TRANSIT', 'AT_DELIVERY'],
    ['IN_TRANSIT', 'DELIVERED'],
    ['IN_TRANSIT', 'CANCELLED'],
    ['AT_DELIVERY', 'DELIVERED'],
    ['AT_DELIVERY', 'IN_TRANSIT'],
    ['DELIVERED', 'COMPLETED'],
  ])('allows updateStatus transition %s -> %s', async (current, next) => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: current, orderId: 'order-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: next });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.updateStatus('tenant-1', 'load-1', 'user-1', next, 'progress');

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: next }) }),
    );
    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ oldStatus: current, newStatus: next, notes: 'progress' }),
      }),
    );
  });

  it.each([
    ['PENDING', 'IN_TRANSIT'],
    ['TENDERED', 'DISPATCHED'],
    ['ACCEPTED', 'DELIVERED'],
    ['DISPATCHED', 'DELIVERED'],
    ['AT_PICKUP', 'DELIVERED'],
    ['PICKED_UP', 'DELIVERED'],
    ['DELIVERED', 'PENDING'],
    ['CANCELLED', 'PENDING'],
  ])('rejects updateStatus transition %s -> %s', async (current, next) => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: current });

    await expect(
      service.updateStatus('tenant-1', 'load-1', 'user-1', next),
    ).rejects.toThrow(BadRequestException);
  });

  it('updates load location', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', currentCity: 'Austin' });

    const result = await service.updateLocation('tenant-1', 'load-1', { latitude: 30, longitude: -97, city: 'Austin', state: 'TX' } as any);

    expect(result.currentCity).toBe('Austin');
  });

  it('updates load location with eta and tracking timestamp', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });

    await service.updateLocation('tenant-1', 'load-1', {
      latitude: 30,
      longitude: -97,
      city: 'Austin',
      state: 'TX',
      eta: '2026-01-05T00:00:00Z',
    } as any);

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eta: new Date('2026-01-05T00:00:00Z'),
          lastTrackingUpdate: expect.any(Date),
        }),
      }),
    );
  });

  it('throws when updating location for missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.updateLocation('tenant-1', 'load-1', { latitude: 30, longitude: -97, city: 'Austin', state: 'TX' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects delete when status not pending or cancelled', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'DISPATCHED' });

    await expect(service.delete('tenant-1', 'load-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('adds check call and emits event', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.create.mockResolvedValue({ id: 'cc-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });

    const result = await service.addCheckCall('tenant-1', 'load-1', 'user-1', {
      lat: 30,
      lng: -97,
      city: 'Austin',
      state: 'TX',
      status: 'IN_TRANSIT',
    } as any);

    expect(result).toEqual({ id: 'cc-1' });
    expect(eventEmitter.emit).toHaveBeenCalledWith('check-call.received',
      expect.objectContaining({ loadId: 'load-1', tenantId: 'tenant-1' }),
    );
  });

  it('throws when adding check call for missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.addCheckCall('tenant-1', 'load-1', 'user-1', { lat: 1, lng: 2 } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates load location from check call', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.create.mockResolvedValue({ id: 'cc-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });

    await service.addCheckCall('tenant-1', 'load-1', 'user-1', {
      lat: 30,
      lng: -97,
      city: 'Austin',
      state: 'TX',
      status: 'IN_TRANSIT',
      eta: '2026-01-06T00:00:00Z',
    } as any);

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentLocationLat: 30,
          currentLocationLng: -97,
          currentCity: 'Austin',
          currentState: 'TX',
          eta: new Date('2026-01-06T00:00:00Z'),
          lastTrackingUpdate: expect.any(Date),
        }),
      }),
    );
  });

  it('emits check call location and eta', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.create.mockResolvedValue({ id: 'cc-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });

    await service.addCheckCall('tenant-1', 'load-1', 'user-1', {
      lat: 30,
      lng: -97,
      city: 'Austin',
      state: 'TX',
      status: 'IN_TRANSIT',
      eta: '2026-01-06T00:00:00Z',
    } as any);

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'check-call.received',
      expect.objectContaining({
        loadId: 'load-1',
        eta: new Date('2026-01-06T00:00:00Z'),
        location: expect.objectContaining({ lat: 30, lng: -97, city: 'Austin', state: 'TX' }),
        tenantId: 'tenant-1',
      }),
    );
  });

  it('converts check call timestamps', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.create.mockResolvedValue({ id: 'cc-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });
    const timestamp = '2026-01-03T00:00:00Z';
    const eta = '2026-01-04T00:00:00Z';

    await service.addCheckCall('tenant-1', 'load-1', 'user-1', {
      lat: 30,
      lng: -97,
      city: 'Austin',
      state: 'TX',
      status: 'IN_TRANSIT',
      timestamp,
      eta,
    } as any);

    expect(prisma.checkCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eta: new Date(eta),
          createdAt: new Date(timestamp),
        }),
      }),
    );
  });

  it('returns paginated check calls', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.findMany.mockResolvedValue([{ id: 'cc-1' }]);
    prisma.checkCall.count.mockResolvedValue(5);

    const result = await service.getCheckCalls('tenant-1', 'load-1', { page: 2, limit: 2 } as any);

    expect(result).toEqual({ data: [{ id: 'cc-1' }], total: 5, page: 2, limit: 2 });
  });

  it('throws when getting check calls for missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.getCheckCalls('tenant-1', 'load-1', { page: 1, limit: 5 } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('uses pagination when fetching check calls', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1' });
    prisma.checkCall.findMany.mockResolvedValue([]);
    prisma.checkCall.count.mockResolvedValue(0);

    await service.getCheckCalls('tenant-1', 'load-1', { page: 3, limit: 4 } as any);

    expect(prisma.checkCall.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 8, take: 4 }),
    );
  });

  it('throws when rate confirmation load not found', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(
      service.generateRateConfirmation('tenant-1', 'load-1', { includeAccessorials: false, includeTerms: false } as any, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when rate confirmation load has no carrier', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', carrierId: null });

    await expect(
      service.generateRateConfirmation('tenant-1', 'load-1', { includeAccessorials: false, includeTerms: false } as any, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('deletes load when pending', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.delete('tenant-1', 'load-1', 'user-1');

    expect(result).toEqual({ success: true, message: 'Load deleted successfully' });
  });

  it('keeps status cancelled when deleting cancelled load', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'CANCELLED' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.delete('tenant-1', 'load-1', 'user-1');

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    );
  });

  it('records status history when deleting load', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });
    prisma.load.update.mockResolvedValue({ id: 'load-1' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.delete('tenant-1', 'load-1', 'user-1');

    expect(prisma.statusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ oldStatus: 'PENDING', newStatus: 'CANCELLED' }),
      }),
    );
  });

  it('throws when deleting missing load', async () => {
    prisma.load.findFirst.mockResolvedValue(null);

    await expect(service.delete('tenant-1', 'load-1', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('generates a rate confirmation PDF', async () => {
    prisma.load.findFirst.mockResolvedValue({
      id: 'load-1',
      loadNumber: 'LD2026010001',
      carrierId: 'car-1',
      carrierRate: 1000,
      accessorialCosts: 50,
      fuelAdvance: 25,
      carrier: { legalName: 'Carrier', mcNumber: 'MC1' },
      order: { customer: { id: 'cust-1', name: 'Acme' } },
      stops: [
        {
          stopType: 'PICKUP',
          facilityName: 'Warehouse',
          addressLine1: '123 Main',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          appointmentDate: new Date('2026-01-01T00:00:00Z'),
          appointmentTimeStart: '08:00',
        },
      ],
    });

    const buffer = await service.generateRateConfirmation(
      'tenant-1',
      'load-1',
      { includeAccessorials: true, includeTerms: true, customMessage: 'Thanks' } as any,
      'user-1',
    );

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('groups loads by status for load board', async () => {
    prisma.load.findMany.mockResolvedValue([
      { id: 'l1', status: 'PENDING' },
      { id: 'l2', status: 'IN_TRANSIT' },
      { id: 'l3', status: 'PENDING' },
    ]);

    const result = await service.getLoadBoard('tenant-1');

    expect(result.total).toBe(3);
    expect(result.byStatus.PENDING).toHaveLength(2);
    expect(result.byStatus.IN_TRANSIT).toHaveLength(1);
  });

  it('uses provided status filter for load board', async () => {
    prisma.load.findMany.mockResolvedValue([]);

    await service.getLoadBoard('tenant-1', { status: ['ACCEPTED'] });

    expect(prisma.load.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', status: { in: ['ACCEPTED'] } },
      }),
    );
  });

  it('assigns carrier and emits events', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'ACCEPTED' });
    prisma.statusHistory.create.mockResolvedValue({});

    const result = await service.assignCarrier('tenant-1', 'load-1', 'user-1', { carrierId: 'car-1', carrierRate: 1000 } as any);

    expect(result.status).toBe('ACCEPTED');
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.assigned',
      expect.objectContaining({ loadId: 'load-1', carrierId: 'car-1', tenantId: 'tenant-1' }),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('load.status.changed',
      expect.objectContaining({ loadId: 'load-1', oldStatus: 'PENDING', newStatus: 'ACCEPTED', tenantId: 'tenant-1' }),
    );
  });

  it('passes driver details when assigning carrier', async () => {
    prisma.load.findFirst.mockResolvedValue({ id: 'load-1', status: 'PENDING' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'car-1' });
    prisma.load.update.mockResolvedValue({ id: 'load-1', status: 'ACCEPTED' });
    prisma.statusHistory.create.mockResolvedValue({});

    await service.assignCarrier('tenant-1', 'load-1', 'user-1', {
      carrierId: 'car-1',
      driverName: 'Driver',
      driverPhone: '555',
      truckNumber: 'T1',
      trailerNumber: 'TR1',
    } as any);

    expect(prisma.load.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          carrierId: 'car-1',
          driverName: 'Driver',
          driverPhone: '555',
          truckNumber: 'T1',
          trailerNumber: 'TR1',
        }),
      }),
    );
  });
});
