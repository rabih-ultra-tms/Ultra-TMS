import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { HandlerRegistry } from '../src/modules/scheduler/handlers/handler-registry';
import { LockService } from '../src/modules/scheduler/locking/lock.service';
import { JobExecutionStatus } from '@prisma/client';

const TEST_TENANT = 'tenant-scheduler';
const SYSTEM_TENANT = 'system';
const TEST_USER = {
  id: 'user-scheduler',
  email: 'user@scheduler.test',
  tenantId: TEST_TENANT,
  roles: ['admin'],
};

describe('Scheduler API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let handlers: HandlerRegistry;
  let lockService: LockService;

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
    handlers = app.get(HandlerRegistry);
    lockService = app.get(LockService);

    await prisma.tenant.upsert({
      where: { slug: SYSTEM_TENANT },
      update: { name: 'System Tenant' },
      create: { id: SYSTEM_TENANT, slug: SYSTEM_TENANT, name: 'System Tenant' },
    });

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Scheduler Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Scheduler Tenant' },
    });

    await prisma.user.upsert({
      where: { id: TEST_USER.id },
      update: {
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Scheduler',
        lastName: 'User',
        passwordHash: 'hashed',
        status: 'ACTIVE',
      },
      create: {
        id: TEST_USER.id,
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Scheduler',
        lastName: 'User',
        passwordHash: 'hashed',
        status: 'ACTIVE',
      },
    });
  });

  beforeEach(async () => {
    await prisma.jobExecution.deleteMany({});
    await prisma.jobLock.deleteMany({});
    await prisma.jobDependency.deleteMany({});
    await prisma.jobAlert.deleteMany({});
    await prisma.scheduledTask.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.reminder.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.scheduledJob.deleteMany({ where: { OR: [{ tenantId: TEST_TENANT }, { tenantId: null }] } });
    await prisma.jobTemplate.deleteMany({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Job Management', () => {
    it('creates cron and interval jobs with next run times', async () => {
      const cronRes = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({
          code: 'cron-job',
          name: 'Cron Job',
          scheduleType: 'CRON',
          cronExpression: '*/5 * * * *',
          handler: 'noop.handler',
        })
        .expect(201);
      expect(cronRes.body.nextRunAt).toBeTruthy();

      const intervalRes = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({
          code: 'interval-job',
          name: 'Interval Job',
          scheduleType: 'INTERVAL',
          intervalSeconds: 120,
          handler: 'noop.handler',
        })
        .expect(201);
      expect(intervalRes.body.nextRunAt).toBeTruthy();
    });

    it('runs manual job, tracks execution, and toggles pause/resume', async () => {
      let handledPayload: Record<string, any> | null = null;
      handlers.register('test.manual', async payload => {
        handledPayload = payload;
        return { ok: true };
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({ code: 'manual-job', name: 'Manual Job', scheduleType: 'MANUAL', handler: 'test.manual', parameters: { a: 1 } })
        .expect(201);

      const runRes = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${createRes.body.id}/run`)
        .expect(201);
      expect(runRes.body.status).toBe(JobExecutionStatus.COMPLETED);
      expect(handledPayload).toEqual({ a: 1 });

      const paused = await request(app.getHttpServer()).post(`/api/v1/jobs/${createRes.body.id}/pause`).expect(201);
      expect(paused.body.status).toBe('PAUSED');

      const resumed = await request(app.getHttpServer()).post(`/api/v1/jobs/${createRes.body.id}/resume`).expect(201);
      expect(resumed.body.status).toBe('ACTIVE');
    });
  });

  describe('Job Executions and Retry', () => {
    it('schedules retry on failure and caps at max retries', async () => {
      let attempts = 0;
      handlers.register('test.retry', async () => {
        attempts += 1;
        throw new Error(`fail-${attempts}`);
      });

      const jobRes = await request(app.getHttpServer())
        .post('/api/v1/jobs')
        .send({ code: 'retry-job', name: 'Retry Job', scheduleType: 'MANUAL', handler: 'test.retry', maxRetries: 2, retryDelaySeconds: 1 })
        .expect(201);

      const execRes = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${jobRes.body.id}/run`)
        .expect(201);
      expect(execRes.body.status).toBe(JobExecutionStatus.FAILED);
      expect(execRes.body.willRetry).toBe(true);

      const pendingRetry = await prisma.jobExecution.findFirst({
        where: { jobId: jobRes.body.id, status: JobExecutionStatus.PENDING, retryOf: execRes.body.id },
      });
      expect(pendingRetry).toBeTruthy();
      expect(pendingRetry?.attemptNumber).toBe(2);
    });

    it('cancels pending executions and lists history', async () => {
      const job = await prisma.scheduledJob.create({
        data: {
          code: 'list-job',
          name: 'List Job',
          scheduleType: 'MANUAL',
          jobType: 'TENANT',
          handler: 'noop',
          tenantId: TEST_TENANT,
        },
      });

      const execution = await prisma.jobExecution.create({ data: { jobId: job.id, status: JobExecutionStatus.PENDING } });

      const listRes = await request(app.getHttpServer()).get(`/api/v1/jobs/${job.id}/executions`).expect(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(1);

      const cancelRes = await request(app.getHttpServer())
        .post(`/api/v1/jobs/${job.id}/executions/${execution.id}/cancel`)
        .expect(201);
      expect(cancelRes.body.status).toBe(JobExecutionStatus.CANCELLED);
    });
  });

  describe('Distributed Locking', () => {
    it('prevents concurrent lock acquisition until released', async () => {
      const job = await prisma.scheduledJob.create({
        data: {
          code: 'lock-job',
          name: 'Lock Job',
          scheduleType: 'MANUAL',
          jobType: 'TENANT',
          handler: 'noop',
          tenantId: TEST_TENANT,
        },
      });

      const firstAcquire = await lockService.acquire(job.id, 'worker-1', TEST_TENANT, 'test');
      expect(firstAcquire).toBe(true);

      const secondAcquire = await lockService.acquire(job.id, 'worker-2', TEST_TENANT, 'test');
      expect(secondAcquire).toBe(false);

      await lockService.release(job.id, 'worker-1');
      const afterRelease = await lockService.acquire(job.id, 'worker-2', TEST_TENANT, 'test');
      expect(afterRelease).toBe(true);
    });
  });

  describe('Tasks and Reminders', () => {
    it('schedules, lists, and cancels tasks', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          taskType: 'EMAIL',
          scheduledAt: new Date().toISOString(),
          handler: 'task-handler',
          payload: { id: 1 },
        })
        .expect(201);

      const listRes = await request(app.getHttpServer()).get('/api/v1/tasks').expect(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(1);

      const cancelRes = await request(app.getHttpServer()).delete(`/api/v1/tasks/${createRes.body.id}`).expect(200);
      expect(cancelRes.body.status).toBe('CANCELLED');
    });

    it('creates, snoozes, and dismisses reminders', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/v1/reminders')
        .send({
          title: 'Ping',
          remindAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          notificationChannels: ['in_app'],
        })
        .expect(201);

      const snoozeRes = await request(app.getHttpServer())
        .post(`/api/v1/reminders/${createRes.body.id}/snooze`)
        .send({ minutes: 10 })
        .expect(201);
      expect(snoozeRes.body.status).toBe('SNOOZED');

      const dismissRes = await request(app.getHttpServer())
        .post(`/api/v1/reminders/${createRes.body.id}/dismiss`)
        .expect(201);
      expect(dismissRes.body.status).toBe('DISMISSED');
    });
  });

  describe('Templates', () => {
    it('applies job template and creates job for tenant', async () => {
      await prisma.jobTemplate.create({
        data: {
          code: 'tpl-report',
          name: 'Report Job',
          handler: 'report.handler',
          defaultParameters: { report: 'daily' },
        },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/jobs/templates/tpl-report/create')
        .send({ scheduleType: 'ONCE', runAt: new Date(Date.now() + 60000).toISOString() })
        .expect(201);

      expect(res.body.code).toBe('tpl-report');
      expect(res.body.tenantId).toBe(TEST_TENANT);
    });
  });
});
