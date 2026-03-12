import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-ctrl-test';
const TEST_USER_ID = 'user-ctrl-test';

const mockUser = {
  id: TEST_USER_ID,
  userId: TEST_USER_ID,
  email: 'test@test.com',
  tenantId: TEST_TENANT,
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roleName: 'SUPER_ADMIN',
  roles: ['SUPER_ADMIN'],
};

function createMockOrdersService() {
  return {
    findAll: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
    findOne: jest.fn().mockResolvedValue({ id: 'o1', orderNumber: 'ORD-001', status: 'PENDING' }),
    create: jest.fn().mockResolvedValue({ id: 'o1', orderNumber: 'ORD-001', status: 'PENDING' }),
    createFromQuote: jest.fn().mockResolvedValue({ id: 'o2', orderNumber: 'ORD-002' }),
    createFromTemplate: jest.fn().mockResolvedValue({ id: 'o3', orderNumber: 'ORD-003' }),
    update: jest.fn().mockResolvedValue({ id: 'o1', status: 'PENDING', specialInstructions: 'updated' }),
    clone: jest.fn().mockResolvedValue({ id: 'o4', orderNumber: 'ORD-004' }),
    changeStatus: jest.fn().mockResolvedValue({ id: 'o1', status: 'QUOTED' }),
    cancel: jest.fn().mockResolvedValue({ id: 'o1', status: 'CANCELLED' }),
    delete: jest.fn().mockResolvedValue(undefined),
    getTimeline: jest.fn().mockResolvedValue({ data: [] }),
    getStatusHistory: jest.fn().mockResolvedValue({ data: [] }),
    getStops: jest.fn().mockResolvedValue([]),
    getLoads: jest.fn().mockResolvedValue([]),
    createLoadForOrder: jest.fn().mockResolvedValue({ id: 'l1', loadNumber: 'LD-001' }),
    getItems: jest.fn().mockResolvedValue([]),
    addItem: jest.fn().mockResolvedValue({ id: 'i1', description: 'Widget' }),
    updateItem: jest.fn().mockResolvedValue({ id: 'i1', description: 'Updated Widget' }),
    removeItem: jest.fn().mockResolvedValue(undefined),
  };
}

describe('OrdersController (integration)', () => {
  let app: INestApplication;
  let ordersService: ReturnType<typeof createMockOrdersService>;

  beforeAll(async () => {
    ordersService = createMockOrdersService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = mockUser;
          req.headers['x-tenant-id'] = TEST_TENANT;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET /api/v1/orders ---

  describe('GET /api/v1/orders', () => {
    it('returns 200 with paginated list', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/orders').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(ordersService.findAll).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object));
    });

    it('passes query params to service', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders?page=2&limit=10&status=PENDING').expect(200);

      expect(ordersService.findAll).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({ page: 2, limit: 10, status: 'PENDING' }),
      );
    });
  });

  // --- GET /api/v1/orders/:id ---

  describe('GET /api/v1/orders/:id', () => {
    it('returns 200 with order detail', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/orders/o1').expect(200);

      expect(res.body).toHaveProperty('id', 'o1');
      expect(ordersService.findOne).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- POST /api/v1/orders ---

  describe('POST /api/v1/orders', () => {
    const validPayload = {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      stops: [
        { stopType: 'PICKUP', addressLine1: '123 Main', city: 'Austin', state: 'TX', postalCode: '73301' },
        { stopType: 'DELIVERY', addressLine1: '456 Elm', city: 'Dallas', state: 'TX', postalCode: '75001' },
      ],
    };

    it('returns 201 on valid payload', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/orders').send(validPayload).expect(201);

      expect(res.body).toHaveProperty('id');
      expect(ordersService.create).toHaveBeenCalledWith(TEST_TENANT, expect.objectContaining({ customerId: validPayload.customerId }), TEST_USER_ID);
    });

    it('returns 400 when customerId missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ stops: validPayload.stops })
        .expect(400);
    });

    it('returns 400 when customerId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ ...validPayload, customerId: 'not-a-uuid' })
        .expect(400);
    });

    it('returns 400 when stops array is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ customerId: validPayload.customerId })
        .expect(400);
    });

    it('strips unknown fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({ ...validPayload, hackField: 'injected' })
        .expect(400);
    });

    it('accepts optional fields', async () => {
      const payload = {
        ...validPayload,
        customerReference: 'REF-123',
        specialInstructions: 'Handle with care',
        weightLbs: 5000,
        isHazmat: false,
      };

      await request(app.getHttpServer()).post('/api/v1/orders').send(payload).expect(201);

      expect(ordersService.create).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({ customerReference: 'REF-123', specialInstructions: 'Handle with care' }),
        TEST_USER_ID,
      );
    });
  });

  // --- PUT /api/v1/orders/:id ---

  describe('PUT /api/v1/orders/:id', () => {
    it('returns 200 on valid update', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/v1/orders/o1')
        .send({ specialInstructions: 'updated' })
        .expect(200);

      expect(res.body).toHaveProperty('id', 'o1');
      expect(ordersService.update).toHaveBeenCalledWith(TEST_TENANT, 'o1', expect.any(Object), TEST_USER_ID);
    });

    it('allows empty body (all fields optional)', async () => {
      await request(app.getHttpServer()).put('/api/v1/orders/o1').send({}).expect(200);
    });
  });

  // --- POST /api/v1/orders/:id/clone ---

  describe('POST /api/v1/orders/:id/clone', () => {
    it('returns 201 on clone', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders/o1/clone')
        .send({})
        .expect(201);

      expect(res.body).toHaveProperty('id', 'o4');
      expect(ordersService.clone).toHaveBeenCalledWith(TEST_TENANT, 'o1', expect.any(Object), TEST_USER_ID);
    });
  });

  // --- PATCH /api/v1/orders/:id/status ---

  describe('PATCH /api/v1/orders/:id/status', () => {
    it('returns 200 on valid status change', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/orders/o1/status')
        .send({ status: 'QUOTED' })
        .expect(200);

      expect(res.body).toHaveProperty('status', 'QUOTED');
      expect(ordersService.changeStatus).toHaveBeenCalledWith(TEST_TENANT, 'o1', expect.objectContaining({ status: 'QUOTED' }), TEST_USER_ID);
    });

    it('returns 400 on invalid enum status', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/orders/o1/status')
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('returns 400 when status is missing', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/orders/o1/status')
        .send({})
        .expect(400);
    });
  });

  // --- DELETE /api/v1/orders/:id/cancel ---

  describe('DELETE /api/v1/orders/:id/cancel', () => {
    it('returns 200 on cancel with reason', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/orders/o1/cancel')
        .send({ reason: 'Customer requested' })
        .expect(200);

      expect(ordersService.cancel).toHaveBeenCalledWith(
        TEST_TENANT,
        'o1',
        expect.objectContaining({ reason: 'Customer requested' }),
        TEST_USER_ID,
      );
    });

    it('returns 400 when reason is missing', async () => {
      await request(app.getHttpServer()).delete('/api/v1/orders/o1/cancel').send({}).expect(400);
    });
  });

  // --- DELETE /api/v1/orders/:id ---

  describe('DELETE /api/v1/orders/:id', () => {
    it('returns 204 on successful delete', async () => {
      await request(app.getHttpServer()).delete('/api/v1/orders/o1').expect(204);

      expect(ordersService.delete).toHaveBeenCalledWith(TEST_TENANT, 'o1', TEST_USER_ID);
    });
  });

  // --- GET /api/v1/orders/:id/timeline ---

  describe('GET /api/v1/orders/:id/timeline', () => {
    it('returns 200 with timeline data', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/orders/o1/timeline').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(ordersService.getTimeline).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- GET /api/v1/orders/:id/history ---

  describe('GET /api/v1/orders/:id/history', () => {
    it('returns 200 with status history', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders/o1/history').expect(200);

      expect(ordersService.getStatusHistory).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- GET /api/v1/orders/:id/stops ---

  describe('GET /api/v1/orders/:id/stops', () => {
    it('returns 200 with stops list', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders/o1/stops').expect(200);

      expect(ordersService.getStops).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- GET /api/v1/orders/:id/loads ---

  describe('GET /api/v1/orders/:id/loads', () => {
    it('returns 200 with loads list', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders/o1/loads').expect(200);

      expect(ordersService.getLoads).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- POST /api/v1/orders/:id/loads ---

  describe('POST /api/v1/orders/:id/loads', () => {
    it('returns 201 on load creation', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders/o1/loads')
        .send({ carrierRate: 1500 })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'l1');
      expect(ordersService.createLoadForOrder).toHaveBeenCalledWith(TEST_TENANT, TEST_USER_ID, 'o1', expect.any(Object));
    });
  });

  // --- GET /api/v1/orders/:id/items ---

  describe('GET /api/v1/orders/:id/items', () => {
    it('returns 200 with items list', async () => {
      await request(app.getHttpServer()).get('/api/v1/orders/o1/items').expect(200);

      expect(ordersService.getItems).toHaveBeenCalledWith(TEST_TENANT, 'o1');
    });
  });

  // --- POST /api/v1/orders/:id/items ---

  describe('POST /api/v1/orders/:id/items', () => {
    it('returns 201 on item addition', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders/o1/items')
        .send({ description: 'Widget', quantity: 10 })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'i1');
      expect(ordersService.addItem).toHaveBeenCalledWith(
        TEST_TENANT,
        TEST_USER_ID,
        'o1',
        expect.objectContaining({ description: 'Widget' }),
      );
    });

    it('returns 400 when description is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders/o1/items')
        .send({ quantity: 10 })
        .expect(400);
    });
  });

  // --- PUT /api/v1/orders/:id/items/:itemId ---

  describe('PUT /api/v1/orders/:id/items/:itemId', () => {
    it('returns 200 on item update', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/orders/o1/items/i1')
        .send({ description: 'Updated Widget' })
        .expect(200);

      expect(ordersService.updateItem).toHaveBeenCalledWith(TEST_TENANT, TEST_USER_ID, 'o1', 'i1', expect.any(Object));
    });
  });

  // --- DELETE /api/v1/orders/:id/items/:itemId ---

  describe('DELETE /api/v1/orders/:id/items/:itemId', () => {
    it('returns 204 on item removal', async () => {
      await request(app.getHttpServer()).delete('/api/v1/orders/o1/items/i1').expect(204);

      expect(ordersService.removeItem).toHaveBeenCalledWith(TEST_TENANT, TEST_USER_ID, 'o1', 'i1');
    });
  });

  // --- POST /api/v1/orders/from-quote/:quoteId ---

  describe('POST /api/v1/orders/from-quote/:quoteId', () => {
    it('returns 201 on create from quote', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders/from-quote/q1')
        .send()
        .expect(201);

      expect(res.body).toHaveProperty('id', 'o2');
      expect(ordersService.createFromQuote).toHaveBeenCalledWith(TEST_TENANT, TEST_USER_ID, 'q1');
    });
  });
});
