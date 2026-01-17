import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EdiDirection, EdiMessageStatus, EdiTransactionType, Prisma } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { createTestAppWithRole, getTestPrisma } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-edi';
const TEST_USER = {
  id: 'user-edi',
  email: 'user@edi.test',
  tenantId: TEST_TENANT,
  roleName: 'SUPER_ADMIN',
  role: { name: 'SUPER_ADMIN', permissions: [] },
  roles: ['SUPER_ADMIN'],
};

describe('EDI Service API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const sharedPrisma = await getTestPrisma();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          return true;
        },
      })
      .overrideProvider(PrismaService)
      .useValue(sharedPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req, _res, next) => {
      req.user = TEST_USER;
      req.headers['x-tenant-id'] = TEST_TENANT;
      req.tenantId = TEST_TENANT;
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'EDI Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'EDI Tenant' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.ediAcknowledgment.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediError.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediBatchMessage.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediBatch.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediMessage.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediTransactionMapping.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediCommunicationLog.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediControlNumber.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.ediTradingPartner.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  const createPartner = async () => {
    const isaId = `ISA-${Math.random().toString(36).slice(2, 10)}`;
    return prisma.ediTradingPartner.create({
      data: {
        tenantId: TEST_TENANT,
        partnerName: 'EDI Partner',
        partnerType: 'CUSTOMER',
        isaId,
        protocol: 'FTP',
        sendFunctionalAck: true,
        requireFunctionalAck: true,
        fieldMappings: Prisma.JsonNull,
      },
    });
  };

  describe('Trading Partners', () => {
    it('should create partner, test connection, toggle status', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/edi/trading-partners')
        .send({ partnerName: 'Partner One', partnerType: 'CUSTOMER', isaId: 'ISA-100', protocol: 'FTP' })
        .expect(201);

      const partnerId = createRes.body.data.id;

      const testRes = await request(app.getHttpServer())
        .post(`/api/v1/edi/trading-partners/${partnerId}/test`)
        .expect(201);

      expect(testRes.body.success).toBe(true);

      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/v1/edi/trading-partners/${partnerId}/status`)
        .expect(200);

      expect(toggleRes.body.data.isActive).toBe(false);
    });

    it('restricts trading partner creation to EDI managers', async () => {
      const setup = await createTestAppWithRole('tenant-edi-rbac', 'user-edi-ops', 'ops@edi.test', 'OPERATIONS_MANAGER');
      const rbacApp = setup.app;

      await request(rbacApp.getHttpServer())
        .post('/api/v1/edi/trading-partners')
        .send({ partnerName: 'RBAC Partner', partnerType: 'CUSTOMER', isaId: 'ISA-RBAC-1', protocol: 'FTP' })
        .expect(403);

      await rbacApp.close();
    });
  });

  describe('Document Processing', () => {
    it('should import 204, link load, and acknowledge', async () => {
      const partner = await createPartner();

      const importRes = await request(app.getHttpServer())
        .post('/api/v1/edi/documents/import')
        .send({
          tradingPartnerId: partner.id,
          transactionType: 'EDI_204',
          rawContent: JSON.stringify({ loadId: 'LOAD-123', status: 'NEW' }),
        })
        .expect(201);

      expect(importRes.body.data.status).toBe(EdiMessageStatus.DELIVERED);
      expect(importRes.body.data.entityType).toBe('LOAD');
      expect(importRes.body.data.entityId).toBe('LOAD-123');

      const ackRes = await request(app.getHttpServer())
        .post(`/api/v1/edi/documents/${importRes.body.data.id}/acknowledge`)
        .send({ ackControlNumber: '000000001', ackStatus: 'ACCEPTED' })
        .expect(201);

      expect(ackRes.body.data.ackStatus).toBe('ACCEPTED');

      const message = await prisma.ediMessage.findUnique({ where: { id: importRes.body.data.id } });
      expect(message?.status).toBe(EdiMessageStatus.ACKNOWLEDGED);
    });

    it('should handle parsing errors for malformed payload', async () => {
      const partner = await createPartner();

      const errorRes = await request(app.getHttpServer())
        .post('/api/v1/edi/documents/import')
        .send({ tradingPartnerId: partner.id, transactionType: 'EDI_204', rawContent: 'not-json' })
        .expect(201);

      expect(errorRes.body.data.status).toBe(EdiMessageStatus.ERROR);
      expect(errorRes.body.data.validationStatus).toBe('ERROR');
    });

    it('restricts EDI document import to EDI managers', async () => {
      const setup = await createTestAppWithRole('tenant-edi-rbac', 'user-edi-dispatch', 'dispatch@edi.test', 'DISPATCHER');
      const rbacApp = setup.app;
      const rbacPrisma = setup.prisma;

      const partner = await rbacPrisma.ediTradingPartner.create({
        data: {
          tenantId: 'tenant-edi-rbac',
          partnerName: 'RBAC Partner',
          partnerType: 'CUSTOMER',
          isaId: 'ISA-RBAC-2',
          protocol: 'FTP',
          sendFunctionalAck: true,
          requireFunctionalAck: true,
          fieldMappings: Prisma.JsonNull,
        },
      });

      await request(rbacApp.getHttpServer())
        .post('/api/v1/edi/documents/import')
        .send({
          tradingPartnerId: partner.id,
          transactionType: 'EDI_204',
          rawContent: JSON.stringify({ loadId: 'LOAD-RBAC', status: 'NEW' }),
        })
        .expect(403);

      await rbacPrisma.ediTradingPartner.deleteMany({ where: { tenantId: 'tenant-edi-rbac' } });
      await rbacApp.close();
    });
  });

  describe('Document Generation', () => {
    it('should generate 210 and 214 and send', async () => {
      const partner = await createPartner();

      const invoiceRes = await request(app.getHttpServer())
        .post('/api/v1/edi/generate/210')
        .send({ tradingPartnerId: partner.id, invoiceId: 'INV-100' })
        .expect(201);

      expect(invoiceRes.body.data.transactionType).toBe(EdiTransactionType.EDI_210);
      expect(invoiceRes.body.data.status).toBe(EdiMessageStatus.QUEUED);

      const statusRes = await request(app.getHttpServer())
        .post('/api/v1/edi/generate/214')
        .send({ tradingPartnerId: partner.id, loadId: 'LOAD-777', statusCode: 'X1' })
        .expect(201);

      expect(statusRes.body.data.transactionType).toBe(EdiTransactionType.EDI_214);

      await request(app.getHttpServer())
        .post(`/api/v1/edi/send/${invoiceRes.body.data.id}`)
        .expect(201);

      const sent = await prisma.ediMessage.findUnique({ where: { id: invoiceRes.body.data.id } });
      expect(sent?.status).toBe(EdiMessageStatus.SENT);
    });
  });

  describe('Queue Management', () => {
    it('should process, retry, and cancel queue items', async () => {
      const partner = await createPartner();

      const pending = await prisma.ediMessage.create({
        data: {
          tenantId: TEST_TENANT,
          tradingPartnerId: partner.id,
          messageId: `MSG-${Date.now()}`,
          transactionType: EdiTransactionType.EDI_214,
          direction: EdiDirection.OUTBOUND,
          status: EdiMessageStatus.PENDING,
          isaControlNumber: '000000010',
          gsControlNumber: '000000010',
          stControlNumber: '000000010',
          rawContent: 'payload',
        },
      });

      const errorItem = await prisma.ediMessage.create({
        data: {
          tenantId: TEST_TENANT,
          tradingPartnerId: partner.id,
          messageId: `MSG-${Date.now()}-err`,
          transactionType: EdiTransactionType.EDI_214,
          direction: EdiDirection.OUTBOUND,
          status: EdiMessageStatus.ERROR,
          isaControlNumber: '000000011',
          gsControlNumber: '000000011',
          stControlNumber: '000000011',
          rawContent: 'payload',
        },
      });

      const cancelItem = await prisma.ediMessage.create({
        data: {
          tenantId: TEST_TENANT,
          tradingPartnerId: partner.id,
          messageId: `MSG-${Date.now()}-cancel`,
          transactionType: EdiTransactionType.EDI_214,
          direction: EdiDirection.OUTBOUND,
          status: EdiMessageStatus.PENDING,
          isaControlNumber: '000000012',
          gsControlNumber: '000000012',
          stControlNumber: '000000012',
          rawContent: 'payload',
        },
      });

      const processRes = await request(app.getHttpServer())
        .post('/api/v1/edi/queue/process')
        .expect(201);

      expect(processRes.body.data.processed).toBeGreaterThanOrEqual(1);

      await request(app.getHttpServer()).post(`/api/v1/edi/queue/${errorItem.id}/retry`).expect(201);
      const retried = await prisma.ediMessage.findUnique({ where: { id: errorItem.id } });
      expect(retried?.status).toBe(EdiMessageStatus.QUEUED);
      expect(retried?.retryCount).toBe(1);

      await request(app.getHttpServer()).post(`/api/v1/edi/queue/${cancelItem.id}/cancel`).expect(201);
      const canceled = await prisma.ediMessage.findUnique({ where: { id: cancelItem.id } });
      expect(canceled?.status).toBe(EdiMessageStatus.REJECTED);
    });
  });
});
