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
});
