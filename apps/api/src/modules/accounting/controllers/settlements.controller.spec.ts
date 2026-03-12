import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from '../services';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

const TEST_TENANT = 'tenant-settle-test';
const TEST_USER_ID = 'user-settle-test';

const mockSuperAdmin = {
  id: TEST_USER_ID,
  userId: TEST_USER_ID,
  email: 'admin@test.com',
  tenantId: TEST_TENANT,
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roleName: 'SUPER_ADMIN',
  roles: ['SUPER_ADMIN'],
};

function createMockSettlementsService() {
  return {
    create: jest.fn().mockResolvedValue({ id: 'stl1', settlementNumber: 'STL-001', status: 'DRAFT' }),
    findAll: jest.fn().mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
    findOne: jest.fn().mockResolvedValue({ id: 'stl1', settlementNumber: 'STL-001', status: 'DRAFT' }),
    update: jest.fn().mockResolvedValue({ id: 'stl1', status: 'DRAFT' }),
    approve: jest.fn().mockResolvedValue({ id: 'stl1', status: 'APPROVED' }),
    voidSettlement: jest.fn().mockResolvedValue({ id: 'stl1', status: 'VOID' }),
    generateFromLoad: jest.fn().mockResolvedValue({ id: 'stl2', settlementNumber: 'STL-002' }),
    getPayablesSummary: jest.fn().mockResolvedValue({ totalPayable: 0, pending: 0, approved: 0 }),
  };
}

describe('SettlementsController (integration)', () => {
  let app: INestApplication;
  let settlementsService: ReturnType<typeof createMockSettlementsService>;

  beforeAll(async () => {
    settlementsService = createMockSettlementsService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettlementsController],
      providers: [
        { provide: SettlementsService, useValue: settlementsService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = mockSuperAdmin;
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

  // --- POST /api/v1/settlements ---

  describe('POST /api/v1/settlements', () => {
    const validPayload = {
      carrierId: 'car-1',
      settlementDate: '2026-03-01',
      dueDate: '2026-03-31',
      grossAmount: 2000,
      netAmount: 1900,
      balanceDue: 1900,
    };

    it('returns 201 on valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/settlements')
        .send(validPayload)
        .expect(201);

      expect(res.body).toHaveProperty('id', 'stl1');
      expect(settlementsService.create).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object), expect.objectContaining(validPayload));
    });

    it('returns 400 when carrierId missing', async () => {
      const { carrierId, ...incomplete } = validPayload;
      await request(app.getHttpServer())
        .post('/api/v1/settlements')
        .send(incomplete)
        .expect(400);
    });

    it('returns 400 when settlementDate is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settlements')
        .send({ ...validPayload, settlementDate: 'bad-date' })
        .expect(400);
    });

    it('returns 400 when grossAmount missing', async () => {
      const { grossAmount, ...incomplete } = validPayload;
      await request(app.getHttpServer())
        .post('/api/v1/settlements')
        .send(incomplete)
        .expect(400);
    });

    it('strips unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settlements')
        .send({ ...validPayload, injected: true })
        .expect(400);
    });

    it('accepts optional line items', async () => {
      const payload = {
        ...validPayload,
        lineItems: [
          { lineNumber: 1, description: 'Freight charge', unitRate: 2000, amount: 2000 },
        ],
      };

      await request(app.getHttpServer()).post('/api/v1/settlements').send(payload).expect(201);
    });
  });

  // --- GET /api/v1/settlements ---

  describe('GET /api/v1/settlements', () => {
    it('returns 200 with list', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/settlements').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(settlementsService.findAll).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object));
    });

    it('passes query filters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settlements?status=APPROVED&carrierId=c1&page=2&limit=10')
        .expect(200);

      expect(settlementsService.findAll).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({ status: 'APPROVED', carrierId: 'c1', page: 2, limit: 10 }),
      );
    });
  });

  // --- GET /api/v1/settlements/payables-summary ---

  describe('GET /api/v1/settlements/payables-summary', () => {
    it('returns 200 with payables summary', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/settlements/payables-summary').expect(200);

      expect(res.body).toHaveProperty('totalPayable');
      expect(settlementsService.getPayablesSummary).toHaveBeenCalledWith(TEST_TENANT);
    });
  });

  // --- GET /api/v1/settlements/:id ---

  describe('GET /api/v1/settlements/:id', () => {
    it('returns 200 with settlement detail', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/settlements/stl1').expect(200);

      expect(res.body).toHaveProperty('id', 'stl1');
      expect(settlementsService.findOne).toHaveBeenCalledWith('stl1', TEST_TENANT);
    });
  });

  // --- PUT /api/v1/settlements/:id ---

  describe('PUT /api/v1/settlements/:id', () => {
    it('returns 200 on update', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/settlements/stl1')
        .send({ notes: 'Updated' })
        .expect(200);

      expect(settlementsService.update).toHaveBeenCalledWith('stl1', TEST_TENANT, expect.any(Object), expect.any(Object));
    });
  });

  // --- POST /api/v1/settlements/:id/approve ---

  describe('POST /api/v1/settlements/:id/approve', () => {
    it('returns 201 on approval', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/settlements/stl1/approve')
        .expect(201);

      expect(res.body).toHaveProperty('status', 'APPROVED');
      expect(settlementsService.approve).toHaveBeenCalledWith('stl1', TEST_TENANT, expect.any(Object));
    });
  });

  // --- POST /api/v1/settlements/:id/void ---

  describe('POST /api/v1/settlements/:id/void', () => {
    it('returns 201 on void', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settlements/stl1/void')
        .expect(201);

      expect(settlementsService.voidSettlement).toHaveBeenCalledWith('stl1', TEST_TENANT);
    });
  });

  // --- POST /api/v1/settlements/generate-from-load/:loadId ---

  describe('POST /api/v1/settlements/generate-from-load/:loadId', () => {
    it('returns 201 on generate from load', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/settlements/generate-from-load/l1')
        .expect(201);

      expect(res.body).toHaveProperty('id', 'stl2');
      expect(settlementsService.generateFromLoad).toHaveBeenCalledWith(TEST_TENANT, expect.any(Object), 'l1');
    });
  });
});
