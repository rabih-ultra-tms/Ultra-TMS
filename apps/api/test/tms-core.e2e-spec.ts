import request from 'supertest';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-test';
const TEST_USER = {
  id: 'user-test',
  email: 'user@test.com',
  tenantId: TEST_TENANT,
  roleName: 'SUPER_ADMIN',
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roles: ['SUPER_ADMIN'],
};

type EventBucket = Record<string, any[]>;

function captureEvents(emitter: EventEmitter2, names: string[]): { bucket: EventBucket; dispose: () => void } {
  const bucket: EventBucket = Object.fromEntries(names.map((n) => [n, []]));
  const listeners = names.map((name) => {
    const handler = (payload: any) => bucket[name].push(payload);
    emitter.on(name, handler);
    return { name, handler };
  });
  return {
    bucket,
    dispose: () => listeners.forEach(({ name, handler }) => emitter.off(name, handler)),
  };
}

describe('TMS Core E2E (domain events)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emitter: EventEmitter2;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    emitter = app.get(EventEmitter2);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Test Tenant' },
      create: {
        id: TEST_TENANT,
        name: 'Test Tenant',
        slug: TEST_TENANT,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.statusHistory.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.checkCall.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.stop.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.orderItem.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.invoiceLineItem?.deleteMany?.({ where: { tenantId: TEST_TENANT } });
    await prisma.invoice?.deleteMany?.({ where: { tenantId: TEST_TENANT } });
    await prisma.load.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.order.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.carrier.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.company.deleteMany({ where: { tenantId: TEST_TENANT } });

    await prisma.company.create({
      data: {
        tenantId: TEST_TENANT,
        name: 'Test Customer',
        companyType: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
  });

  const createOrderDto = () => ({
    customerId: '',
    customerReference: 'REF-123',
    specialInstructions: 'Fragile',
    stops: [
      {
        stopType: 'PICKUP',
        companyName: 'Origin',
        address: '123 Main',
        city: 'Austin',
        state: 'TX',
        zip: '73301',
        stopSequence: 1,
      },
      {
        stopType: 'DELIVERY',
        companyName: 'Destination',
        address: '456 Elm',
        city: 'Dallas',
        state: 'TX',
        zip: '75001',
        stopSequence: 2,
      },
    ],
    items: [
      {
        description: 'Widgets',
        quantity: 10,
        weightLbs: 1000,
      },
    ],
  });

  async function seedOrder(): Promise<{ orderId: string; stops: any[] }> {
    const customer = await prisma.company.findFirstOrThrow({ where: { tenantId: TEST_TENANT } });
    const payload = { ...createOrderDto(), customerId: customer.id };
    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(payload)
      .expect(201);
    return { orderId: res.body.data.id, stops: res.body.data.stops };
  }

  it('emits order.created on order creation', async () => {
    const { bucket, dispose } = captureEvents(emitter, ['order.created']);
    const customer = await prisma.company.findFirstOrThrow({ where: { tenantId: TEST_TENANT } });
    const payload = { ...createOrderDto(), customerId: customer.id };

    const res = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(payload)
      .expect(201);

    dispose();

    expect(res.body.data).toHaveProperty('id');
    expect(bucket['order.created']).toHaveLength(1);
    expect(bucket['order.created'][0]).toMatchObject({
      orderId: res.body.data.id,
      tenantId: TEST_TENANT,
    });
  });

  it('emits load lifecycle events (created, assigned, dispatched, status change, delivered, check-call)', async () => {
    const { orderId } = await seedOrder();
    const carrier = await prisma.carrier.create({
      data: {
        tenantId: TEST_TENANT,
        legalName: 'Test Carrier',
        equipmentTypes: ['VAN'],
        serviceStates: ['TX'],
        status: 'ACTIVE',
      },
    });

    const { bucket, dispose } = captureEvents(emitter, [
      'load.created',
      'load.assigned',
      'load.dispatched',
      'load.status.changed',
      'load.delivered',
      'check-call.received',
    ]);

    const createLoadRes = await request(app.getHttpServer())
      .post('/api/v1/loads')
      .send({ orderId, carrierRate: 1000 })
      .expect(201);

    const loadId = createLoadRes.body.data.id;
    expect(bucket['load.created']).toHaveLength(1);

    await request(app.getHttpServer())
      .patch(`/api/v1/loads/${loadId}/assign`)
      .send({ carrierId: carrier.id, carrierRate: 1200 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/loads/${loadId}/dispatch`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/loads/${loadId}/status`)
      .send({ status: 'AT_PICKUP' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/loads/${loadId}/status`)
      .send({ status: 'IN_TRANSIT' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/loads/${loadId}/status`)
      .send({ status: 'DELIVERED' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/loads/${loadId}/check-calls`)
      .send({
        timestamp: new Date().toISOString(),
        status: 'OK',
        city: 'Waco',
        state: 'TX',
        lat: 31.5493,
        lng: -97.1467,
      })
      .expect(201);

    dispose();

    expect(bucket['load.assigned']).toHaveLength(1);
    expect(bucket['load.dispatched']).toHaveLength(1);
    const statusEvents = bucket['load.status.changed'];
    expect(statusEvents.some((e) => e.newStatus === 'DELIVERED')).toBe(true);
    expect(bucket['load.delivered']).toHaveLength(1);
    expect(bucket['check-call.received']).toHaveLength(1);
  });

  it('emits stop events on arrive/depart', async () => {
    const { orderId, stops } = await seedOrder();
    const stopId = stops[0].id;
    const { bucket, dispose } = captureEvents(emitter, ['stop.arrived', 'stop.departed', 'stop.completed']);

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/stops/${stopId}/arrive`)
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/orders/${orderId}/stops/${stopId}/depart`)
      .send({ signedBy: 'John Doe' })
      .expect(200);

    dispose();

    expect(bucket['stop.arrived']).toHaveLength(1);
    expect(bucket['stop.departed']).toHaveLength(1);
    expect(bucket['stop.completed']).toHaveLength(1);
  });
});
