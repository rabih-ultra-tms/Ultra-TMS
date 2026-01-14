import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuditAction, AuditActionCategory, AuditSeverity, LoginMethod } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AuditLogsService } from '../src/modules/audit/logs/audit-logs.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

const TEST_TENANT = 'tenant-audit';
const TEST_USER = {
  id: 'user-audit',
  email: 'user@audit.test',
  tenantId: TEST_TENANT,
  roles: ['admin'],
};

describe('Audit API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let auditLogs: AuditLogsService;
  let events: EventEmitter2;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          req.headers['x-tenant-id'] = TEST_TENANT;
          req.tenantId = TEST_TENANT;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    auditLogs = app.get(AuditLogsService);
    events = app.get(EventEmitter2);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Audit Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Audit Tenant' },
    });

    await prisma.user.upsert({
      where: { id: TEST_USER.id },
      update: {
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Audit',
        lastName: 'User',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
      },
      create: {
        id: TEST_USER.id,
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Audit',
        lastName: 'User',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
      },
    });
  });

  beforeEach(async () => {
    await prisma.auditRetentionPolicy.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.auditAlertIncident.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.auditAlert.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.complianceCheckpoint.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.aPIAuditLog.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.loginAudit.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.accessLog.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.changeHistory.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.auditLog.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('queries audit logs and summary with filters', async () => {
    await auditLogs.log({
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      action: AuditAction.CREATE,
      category: AuditActionCategory.DATA,
      severity: AuditSeverity.INFO,
      entityType: 'order',
      entityId: 'order-1',
    });

    await auditLogs.log({
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      action: AuditAction.UPDATE,
      category: AuditActionCategory.DATA,
      severity: AuditSeverity.WARNING,
      entityType: 'order',
      entityId: 'order-2',
    });

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/audit/logs?action=CREATE')
      .expect(200);

    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.total).toBeGreaterThanOrEqual(1);

    const summaryRes = await request(app.getHttpServer())
      .get('/api/v1/audit/logs/summary')
      .expect(200);

    expect(summaryRes.body.total).toBeGreaterThanOrEqual(2);
    expect(summaryRes.body.byAction.CREATE).toBeGreaterThanOrEqual(1);
  });

  it('verifies hash chain integrity', async () => {
    const first = await auditLogs.log({
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      action: AuditAction.CREATE,
      category: AuditActionCategory.DATA,
      severity: AuditSeverity.INFO,
      entityType: 'entity',
      entityId: '1',
      description: 'first',
    });

    await auditLogs.log({
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      action: AuditAction.UPDATE,
      category: AuditActionCategory.DATA,
      severity: AuditSeverity.INFO,
      entityType: 'entity',
      entityId: '1',
      description: 'second',
    });

    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/audit/logs/verify')
      .send({ startId: first.id })
      .expect(201);

    expect(verifyRes.body.valid).toBe(true);
  });

  it('returns change history versions', async () => {
    await prisma.changeHistory.createMany({
      data: [
        {
          id: 'chg-1',
          tenantId: TEST_TENANT,
          entityType: 'order',
          entityId: 'order-1',
          field: 'status',
          oldValue: 'draft',
          newValue: 'open',
        },
        {
          id: 'chg-2',
          tenantId: TEST_TENANT,
          entityType: 'order',
          entityId: 'order-1',
          field: 'status',
          oldValue: 'open',
          newValue: 'closed',
        },
      ],
    });

    const historyRes = await request(app.getHttpServer())
      .get('/api/v1/audit/history/order/order-1')
      .expect(200);

    expect(historyRes.body.data.length).toBe(2);

    const versionsRes = await request(app.getHttpServer())
      .get('/api/v1/audit/history/order/order-1/versions')
      .expect(200);

    expect(versionsRes.body.length).toBe(2);
  });

  it('lists login and API audit records', async () => {
    await prisma.loginAudit.create({
      data: {
        tenantId: TEST_TENANT,
        userId: TEST_USER.id,
        email: TEST_USER.email,
        loginMethod: LoginMethod.PASSWORD,
        success: false,
        failureReason: 'bad-password',
      },
    });

    await prisma.aPIAuditLog.createMany({
      data: [
        {
          tenantId: TEST_TENANT,
          userId: TEST_USER.id,
          endpoint: '/api/v1/demo',
          method: 'GET',
          responseStatus: 500,
          responseTimeMs: 50,
        },
        {
          tenantId: TEST_TENANT,
          userId: TEST_USER.id,
          endpoint: '/api/v1/demo',
          method: 'GET',
          responseStatus: 200,
          responseTimeMs: 20,
        },
      ],
    });

    const loginsRes = await request(app.getHttpServer())
      .get('/api/v1/audit/logins?email=user@audit.test')
      .expect(200);

    expect(loginsRes.body.data.length).toBe(1);

    const apiErrorsRes = await request(app.getHttpServer())
      .get('/api/v1/audit/api/errors')
      .expect(200);

    expect(apiErrorsRes.body.data.length).toBe(1);
    expect(apiErrorsRes.body.data[0].responseStatus).toBe(500);
  });

  it('creates retention policy via API', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/audit/retention')
      .send({ logType: 'audit_logs', retentionDays: 90, archiveFirst: true, archiveAfterDays: 30 })
      .expect(201);

    expect(createRes.body.id).toBeDefined();

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/audit/retention')
      .expect(200);

    expect(listRes.body.length).toBe(1);
  });

  it('records emitted domain events into audit logs', async () => {
    events.emit('order.created', {
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      entityId: 'order-evt-1',
      description: 'order created via event',
      metadata: { source: 'test' },
    });

    events.emit('order.updated', {
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      entityId: 'order-evt-1',
      metadata: { status: 'updated' },
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const res = await request(app.getHttpServer())
      .get('/api/v1/audit/logs?entityId=order-evt-1')
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it('records login events emitted on the bus', async () => {
    events.emit('user.login', {
      tenantId: TEST_TENANT,
      userId: TEST_USER.id,
      email: TEST_USER.email,
      method: LoginMethod.PASSWORD,
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    });

    events.emit('user.login.failed', {
      tenantId: TEST_TENANT,
      email: 'fail@audit.test',
      method: LoginMethod.PASSWORD,
      failureReason: 'bad-password',
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const res = await request(app.getHttpServer())
      .get('/api/v1/audit/logins')
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.some((entry: any) => entry.failureReason === 'bad-password')).toBe(true);
  });
});
