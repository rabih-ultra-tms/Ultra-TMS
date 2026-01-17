/// <reference types="jest" />
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/test-app.helper';
import { PrismaService } from '../src/prisma.service';
import * as bcrypt from 'bcrypt';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => Promise<void> | void) => void;
declare const beforeAll: (fn: () => Promise<void> | void) => void;
declare const afterAll: (fn: () => Promise<void> | void) => void;
declare const expect: (value: unknown) => { toBeDefined: () => void };

describe('Auth API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  const tenantId = 'tenant-auth';
  const userId = 'user-auth';
  const email = 'user@auth.test';
  const password = 'TestPassword123!';

  beforeAll(async () => {
    const setup = await createTestApp(tenantId, userId, email);
    app = setup.app;
    prisma = setup.prisma;

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password, tenantId })
      .expect(200);

    accessToken = response.body?.data?.accessToken;
    refreshToken = response.body?.data?.refreshToken;

    expect(response.body?.data?.accessToken).toBeDefined();
    expect(response.body?.data?.refreshToken).toBeDefined();
  });

  it('rejects login without tenant id', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(400);
  });

  it('rejects login without email', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ password, tenantId })
      .expect(400);
  });

  it('rejects login without password', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, tenantId })
      .expect(400);
  });

  it('rejects login with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword123!', tenantId })
      .expect(401);
  });

  it('refreshes access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body?.data?.accessToken).toBeDefined();
    expect(response.body?.data?.refreshToken).toBeDefined();
  });

  it('rejects invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });

  it('rejects refresh without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({})
      .expect(400);
  });

  it('returns current user profile', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-test-user-id', userId)
      .expect(200);
  });

  it('rejects unauthenticated profile request', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('x-test-auth', 'false')
      .expect(401);
  });

  it('logs out current session', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-test-user-id', userId)
      .expect(200);
  });

  it('rejects unauthenticated logout', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('x-test-auth', 'false')
      .expect(401);
  });

  it('logs out all sessions', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-test-user-id', userId)
      .expect(200);
  });

  it('requests password reset', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email })
      .expect(200);
  });

  it('rejects invalid email on password reset request', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'invalid-email' })
      .expect(400);
  });

  it('rejects invalid reset token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalid-token', newPassword: 'NewPassword123!' })
      .expect(400);
  });

  it('rejects reset without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/reset-password')
      .send({ newPassword: 'NewPassword123!' })
      .expect(400);
  });

  it('rejects invalid email verification token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({ token: 'invalid-token' })
      .expect(400);
  });

  it('rejects email verification without token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/verify-email')
      .send({})
      .expect(400);
  });
});
