import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp } from './helpers/test-app.helper';

describe('Accounting API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp('tenant-accounting', 'user-accounting', 'user@accounting.test');
    app = setup.app;
    prisma = setup.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists invoices', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .expect(200);
  });

  it('allows accounting access to invoices', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .set('x-test-role', 'ACCOUNTING')
      .expect(200);
  });

  it('denies dispatcher access to invoices', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .set('x-test-role', 'DISPATCHER')
      .expect(403);
  });

  it('lists chart of accounts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/chart-of-accounts')
      .expect(200);
  });

  it('gets trial balance summary', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/chart-of-accounts/trial-balance')
      .expect(200);
  });

  it('lists journal entries', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/journal-entries')
      .expect(200);
  });

  it('lists payments received', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/payments-received')
      .expect(200);
  });

  it('lists payments made', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/payments-made')
      .expect(200);
  });

  it('lists settlements', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/settlements')
      .expect(200);
  });

  it('gets settlements payables summary', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/settlements/payables-summary')
      .expect(200);
  });
});
