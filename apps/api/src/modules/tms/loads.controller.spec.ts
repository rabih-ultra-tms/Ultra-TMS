import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { LoadsController } from './loads.controller';
import { LoadsService } from './loads.service';
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

function createMockLoadsService() {
  return {
    create: jest.fn().mockResolvedValue({ id: 'l1', loadNumber: 'LD-001', status: 'PENDING' }),
    findAll: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
    findOne: jest.fn().mockResolvedValue({ id: 'l1', loadNumber: 'LD-001', status: 'PENDING' }),
    update: jest.fn().mockResolvedValue({ id: 'l1', status: 'PENDING', dispatchNotes: 'updated' }),
    assignCarrier: jest.fn().mockResolvedValue({ id: 'l1', status: 'ASSIGNED', carrierId: 'c1' }),
    dispatch: jest.fn().mockResolvedValue({ id: 'l1', status: 'DISPATCHED' }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'l1', status: 'IN_TRANSIT' }),
    updateLocation: jest.fn().mockResolvedValue({ id: 'l1', currentLocationLat: 30.1, currentLocationLng: -97.7 }),
    addCheckCall: jest.fn().mockResolvedValue({ id: 'cc1', status: 'OK' }),
    getCheckCalls: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
    generateRateConfirmation: jest.fn().mockResolvedValue(Buffer.from('PDF')),
    sendRateConfirmation: jest.fn().mockResolvedValue({ sent: true }),
    generateBolPdf: jest.fn().mockResolvedValue(Buffer.from('BOL-PDF')),
    getLoadBoard: jest.fn().mockResolvedValue({ data: [] }),
    getStats: jest.fn().mockResolvedValue({ total: 0, pending: 0, inTransit: 0 }),
    delete: jest.fn().mockResolvedValue({ success: true }),
    tenderLoad: jest.fn().mockResolvedValue({ id: 'l1', status: 'TENDERED', tenderId: 't1' }),
    acceptTender: jest.fn().mockResolvedValue({ id: 'l1', status: 'ACCEPTED' }),
    rejectTender: jest.fn().mockResolvedValue({ id: 'l1', status: 'PENDING' }),
  };
}

describe('LoadsController (integration)', () => {
  let app: INestApplication;
  let loadsService: ReturnType<typeof createMockLoadsService>;

  beforeAll(async () => {
    loadsService = createMockLoadsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoadsController],
      providers: [{ provide: LoadsService, useValue: loadsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
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

  // --- POST /api/v1/loads ---

  describe('POST /api/v1/loads', () => {
    it('returns 201 on valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loads')
        .send({ orderId: '550e8400-e29b-41d4-a716-446655440000', carrierRate: 1500 })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'l1');
      expect(loadsService.create).toHaveBeenCalledWith(TEST_TENANT, TEST_USER_ID, expect.any(Object));
    });

    it('accepts empty body (all fields optional)', async () => {
      await request(app.getHttpServer()).post('/api/v1/loads').send({}).expect(201);
    });

    it('rejects non-UUID orderId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads')
        .send({ orderId: 'not-a-uuid' })
        .expect(400);
    });

    it('strips unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads')
        .send({ hackField: 'injected' })
        .expect(400);
    });
  });

  // --- GET /api/v1/loads ---

  describe('GET /api/v1/loads', () => {
    it('returns 200 with paginated list', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/loads').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(loadsService.findAll).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object));
    });

    it('passes query params to service', async () => {
      await request(app.getHttpServer()).get('/api/v1/loads?page=3&limit=5').expect(200);

      expect(loadsService.findAll).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({ page: 3, limit: 5 }),
      );
    });
  });

  // --- GET /api/v1/loads/board ---

  describe('GET /api/v1/loads/board', () => {
    it('returns 200 with load board', async () => {
      await request(app.getHttpServer()).get('/api/v1/loads/board').expect(200);

      expect(loadsService.getLoadBoard).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object));
    });

    it('passes status filter as array', async () => {
      await request(app.getHttpServer()).get('/api/v1/loads/board?status=PENDING,IN_TRANSIT').expect(200);

      expect(loadsService.getLoadBoard).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({ status: ['PENDING', 'IN_TRANSIT'] }),
      );
    });
  });

  // --- GET /api/v1/loads/stats ---

  describe('GET /api/v1/loads/stats', () => {
    it('returns 200 with statistics', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/loads/stats').expect(200);

      expect(res.body).toHaveProperty('total');
      expect(loadsService.getStats).toHaveBeenCalledWith(TEST_TENANT);
    });
  });

  // --- GET /api/v1/loads/:id ---

  describe('GET /api/v1/loads/:id', () => {
    it('returns 200 with load detail', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/loads/l1').expect(200);

      expect(res.body).toHaveProperty('id', 'l1');
      expect(loadsService.findOne).toHaveBeenCalledWith(TEST_TENANT, 'l1');
    });
  });

  // --- PUT /api/v1/loads/:id ---

  describe('PUT /api/v1/loads/:id', () => {
    it('returns 200 on valid update', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/loads/l1')
        .send({ dispatchNotes: 'updated' })
        .expect(200);

      expect(loadsService.update).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.any(Object));
    });

    it('allows empty body', async () => {
      await request(app.getHttpServer()).put('/api/v1/loads/l1').send({}).expect(200);
    });
  });

  // --- POST /api/v1/loads/:id/assign-carrier ---

  describe('POST /api/v1/loads/:id/assign-carrier', () => {
    const validAssign = {
      carrierId: '550e8400-e29b-41d4-a716-446655440000',
      carrierRate: 1200,
    };

    it('returns 200 on valid carrier assignment', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loads/l1/assign-carrier')
        .send(validAssign)
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ASSIGNED');
      expect(loadsService.assignCarrier).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.objectContaining(validAssign));
    });

    it('returns 400 when carrierId missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/assign-carrier')
        .send({ carrierRate: 1200 })
        .expect(400);
    });

    it('returns 400 when carrierRate missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/assign-carrier')
        .send({ carrierId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(400);
    });

    it('returns 400 when carrierId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/assign-carrier')
        .send({ carrierId: 'bad-id', carrierRate: 1200 })
        .expect(400);
    });
  });

  // --- PATCH /api/v1/loads/:id/assign ---

  describe('PATCH /api/v1/loads/:id/assign', () => {
    it('assigns carrier via alias endpoint', async () => {
      const payload = {
        carrierId: '550e8400-e29b-41d4-a716-446655440000',
        carrierRate: 1200,
      };

      await request(app.getHttpServer())
        .patch('/api/v1/loads/l1/assign')
        .send(payload)
        .expect(200);

      expect(loadsService.assignCarrier).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.any(Object));
    });
  });

  // --- PATCH /api/v1/loads/:id/dispatch ---

  describe('PATCH /api/v1/loads/:id/dispatch', () => {
    it('returns 200 on dispatch', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/loads/l1/dispatch')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'DISPATCHED');
      expect(loadsService.dispatch).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID);
    });
  });

  // --- PATCH /api/v1/loads/:id/status ---

  describe('PATCH /api/v1/loads/:id/status', () => {
    it('returns 200 on status update', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/loads/l1/status')
        .send({ status: 'IN_TRANSIT' })
        .expect(200);

      expect(loadsService.updateStatus).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, 'IN_TRANSIT', undefined);
    });

    it('passes notes to service', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/loads/l1/status')
        .send({ status: 'AT_PICKUP', notes: 'Arrived early' })
        .expect(200);

      expect(loadsService.updateStatus).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, 'AT_PICKUP', 'Arrived early');
    });
  });

  // --- PUT /api/v1/loads/:id/location ---

  describe('PUT /api/v1/loads/:id/location', () => {
    it('returns 200 on valid location update', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/loads/l1/location')
        .send({ latitude: 30.1, longitude: -97.7 })
        .expect(200);

      expect(loadsService.updateLocation).toHaveBeenCalledWith(
        TEST_TENANT,
        'l1',
        expect.objectContaining({ latitude: 30.1, longitude: -97.7 }),
      );
    });

    it('returns 400 when latitude missing', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/loads/l1/location')
        .send({ longitude: -97.7 })
        .expect(400);
    });

    it('returns 400 when longitude missing', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/loads/l1/location')
        .send({ latitude: 30.1 })
        .expect(400);
    });
  });

  // --- POST /api/v1/loads/:id/check-calls ---

  describe('POST /api/v1/loads/:id/check-calls', () => {
    it('returns 201 on valid check call', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loads/l1/check-calls')
        .send({ timestamp: new Date().toISOString(), status: 'OK', city: 'Waco', state: 'TX' })
        .expect(201);

      expect(res.body).toHaveProperty('id', 'cc1');
      expect(loadsService.addCheckCall).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.any(Object));
    });
  });

  // --- GET /api/v1/loads/:id/check-calls ---

  describe('GET /api/v1/loads/:id/check-calls', () => {
    it('returns 200 with check calls', async () => {
      await request(app.getHttpServer()).get('/api/v1/loads/l1/check-calls').expect(200);

      expect(loadsService.getCheckCalls).toHaveBeenCalledWith(TEST_TENANT, 'l1', expect.any(Object));
    });
  });

  // --- POST /api/v1/loads/:id/tender ---

  describe('POST /api/v1/loads/:id/tender', () => {
    it('returns 200 on valid tender', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loads/l1/tender')
        .send({ carrierId: '550e8400-e29b-41d4-a716-446655440000', rate: 2000 })
        .expect(200);

      expect(res.body).toHaveProperty('status', 'TENDERED');
      expect(loadsService.tenderLoad).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.any(Object));
    });

    it('returns 400 when carrierId missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/tender')
        .send({ rate: 2000 })
        .expect(400);
    });

    it('returns 400 when carrierId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/tender')
        .send({ carrierId: 'bad-uuid' })
        .expect(400);
    });
  });

  // --- POST /api/v1/loads/:id/accept ---

  describe('POST /api/v1/loads/:id/accept', () => {
    it('returns 200 on tender acceptance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loads/l1/accept')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ACCEPTED');
      expect(loadsService.acceptTender).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID);
    });
  });

  // --- POST /api/v1/loads/:id/reject ---

  describe('POST /api/v1/loads/:id/reject', () => {
    it('returns 200 on tender rejection', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/reject')
        .send({ reason: 'Rate too low' })
        .expect(200);

      expect(loadsService.rejectTender).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID, expect.objectContaining({ reason: 'Rate too low' }));
    });

    it('accepts empty body (reason is optional)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/loads/l1/reject')
        .send({})
        .expect(200);
    });
  });

  // --- DELETE /api/v1/loads/:id ---

  describe('DELETE /api/v1/loads/:id', () => {
    it('returns 200 on delete', async () => {
      const res = await request(app.getHttpServer()).delete('/api/v1/loads/l1').expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(loadsService.delete).toHaveBeenCalledWith(TEST_TENANT, 'l1', TEST_USER_ID);
    });
  });
});
