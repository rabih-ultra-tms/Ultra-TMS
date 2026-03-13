import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { InvoicesController } from './invoices.controller';
import { InvoicesService, PdfService } from '../services';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-acct-test';
const TEST_USER_ID = 'user-acct-test';

const mockSuperAdmin = {
  id: TEST_USER_ID,
  userId: TEST_USER_ID,
  email: 'admin@test.com',
  tenantId: TEST_TENANT,
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roleName: 'SUPER_ADMIN',
  roles: ['SUPER_ADMIN'],
};

const mockViewerUser = {
  id: 'viewer-1',
  userId: 'viewer-1',
  email: 'viewer@test.com',
  tenantId: TEST_TENANT,
  role: { name: 'CLAIMS_VIEWER', permissions: [] },
  roleName: 'CLAIMS_VIEWER',
  roles: ['CLAIMS_VIEWER'],
};

function createMockInvoicesService() {
  return {
    create: jest
      .fn()
      .mockResolvedValue({
        id: 'inv1',
        invoiceNumber: 'INV-001',
        status: 'DRAFT',
      }),
    findAll: jest
      .fn()
      .mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    findOne: jest
      .fn()
      .mockResolvedValue({
        id: 'inv1',
        invoiceNumber: 'INV-001',
        status: 'DRAFT',
        company: { name: 'Test' },
      }),
    update: jest.fn().mockResolvedValue({ id: 'inv1', status: 'DRAFT' }),
    sendInvoice: jest.fn().mockResolvedValue({ sent: true }),
    sendReminder: jest.fn().mockResolvedValue({ sent: true }),
    voidInvoice: jest.fn().mockResolvedValue({ id: 'inv1', status: 'VOID' }),
    generateFromLoad: jest
      .fn()
      .mockResolvedValue({ id: 'inv2', invoiceNumber: 'INV-002' }),
    getAgingReport: jest
      .fn()
      .mockResolvedValue({
        current: 0,
        thirtyDays: 0,
        sixtyDays: 0,
        ninetyPlus: 0,
      }),
    getStatementData: jest
      .fn()
      .mockResolvedValue({
        company: {},
        invoices: [],
        fromDate: new Date(),
        toDate: new Date(),
      }),
  };
}

function createMockPdfService() {
  return {
    generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('PDF')),
    generateStatementPdf: jest
      .fn()
      .mockResolvedValue(Buffer.from('STATEMENT-PDF')),
  };
}

describe('InvoicesController (integration)', () => {
  let app: INestApplication;
  let invoicesService: ReturnType<typeof createMockInvoicesService>;
  let activeUser: typeof mockSuperAdmin;

  beforeAll(async () => {
    invoicesService = createMockInvoicesService();
    activeUser = mockSuperAdmin;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        { provide: InvoicesService, useValue: invoicesService },
        { provide: PdfService, useValue: createMockPdfService() },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = activeUser;
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
      })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    activeUser = mockSuperAdmin;
  });

  // --- Role-based access ---

  describe('Role-based access', () => {
    it('allows SUPER_ADMIN access', async () => {
      activeUser = mockSuperAdmin;
      await request(app.getHttpServer()).get('/api/v1/invoices').expect(200);
    });

    it('denies CLAIMS_VIEWER access (wrong role)', async () => {
      activeUser = mockViewerUser;
      await request(app.getHttpServer()).get('/api/v1/invoices').expect(403);
    });
  });

  // --- POST /api/v1/invoices ---

  describe('POST /api/v1/invoices', () => {
    const validPayload = {
      companyId: 'comp-1',
      invoiceDate: '2026-03-01',
      dueDate: '2026-03-31',
      subtotal: 1500,
      totalAmount: 1500,
      balanceDue: 1500,
    };

    it('returns 201 on valid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send(validPayload)
        .expect(201);

      expect(res.body).toHaveProperty('id', 'inv1');
      expect(invoicesService.create).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.any(Object),
        expect.objectContaining(validPayload)
      );
    });

    it('returns 400 when companyId missing', async () => {
      const { companyId: _companyId, ...incomplete } = validPayload;
      await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send(incomplete)
        .expect(400);
    });

    it('returns 400 when invoiceDate is not a valid date string', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send({ ...validPayload, invoiceDate: 'not-a-date' })
        .expect(400);
    });

    it('returns 400 when subtotal missing', async () => {
      const { subtotal: _subtotal, ...incomplete } = validPayload;
      await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send(incomplete)
        .expect(400);
    });

    it('strips unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send({ ...validPayload, hackField: 'injected' })
        .expect(400);
    });

    it('accepts optional line items', async () => {
      const payload = {
        ...validPayload,
        lineItems: [
          {
            lineNumber: 1,
            description: 'Freight',
            unitPrice: 1500,
            amount: 1500,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/v1/invoices')
        .send(payload)
        .expect(201);
    });
  });

  // --- GET /api/v1/invoices ---

  describe('GET /api/v1/invoices', () => {
    it('returns 200 with list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/invoices')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(invoicesService.findAll).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.any(Object)
      );
    });

    it('passes query filters', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/invoices?status=SENT&companyId=c1&page=2&limit=10')
        .expect(200);

      expect(invoicesService.findAll).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.objectContaining({
          status: 'SENT',
          companyId: 'c1',
          page: 2,
          limit: 10,
        })
      );
    });
  });

  // --- GET /api/v1/invoices/aging ---

  describe('GET /api/v1/invoices/aging', () => {
    it('returns 200 with aging report', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/invoices/aging')
        .expect(200);

      expect(res.body).toHaveProperty('current');
      expect(invoicesService.getAgingReport).toHaveBeenCalledWith(TEST_TENANT);
    });
  });

  // --- GET /api/v1/invoices/:id ---

  describe('GET /api/v1/invoices/:id', () => {
    it('returns 200 with invoice detail', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/invoices/inv1')
        .expect(200);

      expect(res.body).toHaveProperty('id', 'inv1');
      expect(invoicesService.findOne).toHaveBeenCalledWith('inv1', TEST_TENANT);
    });
  });

  // --- PUT /api/v1/invoices/:id ---

  describe('PUT /api/v1/invoices/:id', () => {
    it('returns 200 on update', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/invoices/inv1')
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(invoicesService.update).toHaveBeenCalledWith(
        'inv1',
        TEST_TENANT,
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  // --- POST /api/v1/invoices/:id/void ---

  describe('POST /api/v1/invoices/:id/void', () => {
    it('returns 201 on void', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/invoices/inv1/void')
        .send({ reason: 'Duplicate' })
        .expect(201);

      expect(invoicesService.voidInvoice).toHaveBeenCalledWith(
        'inv1',
        TEST_TENANT,
        expect.any(Object),
        'Duplicate'
      );
    });
  });

  // --- POST /api/v1/invoices/generate-from-load/:loadId ---

  describe('POST /api/v1/invoices/generate-from-load/:loadId', () => {
    it('returns 201 on generate from load', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/invoices/generate-from-load/l1')
        .expect(201);

      expect(res.body).toHaveProperty('id', 'inv2');
      expect(invoicesService.generateFromLoad).toHaveBeenCalledWith(
        TEST_TENANT,
        expect.any(Object),
        'l1'
      );
    });
  });

  // --- POST /api/v1/invoices/:id/remind ---

  describe('POST /api/v1/invoices/:id/remind', () => {
    it('returns 201 on reminder', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/invoices/inv1/remind')
        .expect(201);

      expect(invoicesService.sendReminder).toHaveBeenCalledWith(
        'inv1',
        TEST_TENANT
      );
    });
  });
});
