import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EdiDirection, EdiMessageStatus, EdiTransactionType, Prisma } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-edi';
const TEST_USER = { id: 'user-edi', email: 'user@edi.test', tenantId: TEST_TENANT, roles: ['admin'] };

describe('EDI Service API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
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
      .compile();

    app = moduleRef.createNestApplication();
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

      const partnerId = createRes.body.id;

      const testRes = await request(app.getHttpServer())
        .post(`/api/v1/edi/trading-partners/${partnerId}/test`)
        .expect(201);

      expect(testRes.body.success).toBe(true);

      const toggleRes = await request(app.getHttpServer())
        .patch(`/api/v1/edi/trading-partners/${partnerId}/status`)
        .expect(200);

      expect(toggleRes.body.isActive).toBe(false);
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

      expect(importRes.body.status).toBe(EdiMessageStatus.DELIVERED);
      expect(importRes.body.entityType).toBe('LOAD');
      expect(importRes.body.entityId).toBe('LOAD-123');

      const ackRes = await request(app.getHttpServer())
        .post(`/api/v1/edi/documents/${importRes.body.id}/acknowledge`)
        .send({ ackControlNumber: '000000001', ackStatus: 'ACCEPTED' })
        .expect(201);

      expect(ackRes.body.ackStatus).toBe('ACCEPTED');

      const message = await prisma.ediMessage.findUnique({ where: { id: importRes.body.id } });
      expect(message?.status).toBe(EdiMessageStatus.ACKNOWLEDGED);
    });

    it('should handle parsing errors for malformed payload', async () => {
      const partner = await createPartner();

      const errorRes = await request(app.getHttpServer())
        .post('/api/v1/edi/documents/import')
        .send({ tradingPartnerId: partner.id, transactionType: 'EDI_204', rawContent: 'not-json' })
        .expect(201);

      expect(errorRes.body.status).toBe(EdiMessageStatus.ERROR);
      expect(errorRes.body.validationStatus).toBe('ERROR');
    });
  });

  describe('Document Generation', () => {
    it('should generate 210 and 214 and send', async () => {
      const partner = await createPartner();

      const invoiceRes = await request(app.getHttpServer())
        .post('/api/v1/edi/generate/210')
        .send({ tradingPartnerId: partner.id, invoiceId: 'INV-100' })
        .expect(201);

      expect(invoiceRes.body.transactionType).toBe(EdiTransactionType.EDI_210);
      expect(invoiceRes.body.status).toBe(EdiMessageStatus.QUEUED);

      const statusRes = await request(app.getHttpServer())
        .post('/api/v1/edi/generate/214')
        .send({ tradingPartnerId: partner.id, loadId: 'LOAD-777', statusCode: 'X1' })
        .expect(201);

      expect(statusRes.body.transactionType).toBe(EdiTransactionType.EDI_214);

      await request(app.getHttpServer()).post(`/api/v1/edi/send/${invoiceRes.body.id}`).expect(201);

      const sent = await prisma.ediMessage.findUnique({ where: { id: invoiceRes.body.id } });
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

      expect(processRes.body.processed).toBeGreaterThanOrEqual(1);

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
