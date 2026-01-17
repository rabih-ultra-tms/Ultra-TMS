# P2: Auth Service E2E Tests

## Priority: P2 - MEDIUM (Critical Path)
## Estimated Time: 1 day
## Dependencies: None

---

## Overview

The Auth service is the foundation of all API security. Despite having RBAC implemented, it has **0 E2E tests**. This is a critical gap that must be addressed.

---

## Current State

| Endpoint | Tests | Status |
|----------|-------|--------|
| POST /auth/register | 0 | 🔴 Critical |
| POST /auth/login | 0 | 🔴 Critical |
| POST /auth/refresh | 0 | 🔴 Critical |
| POST /auth/logout | 0 | 🔴 Critical |
| GET /auth/me | 0 | 🔴 Critical |
| POST /auth/forgot-password | 0 | 🔴 Critical |
| POST /auth/reset-password | 0 | 🔴 Critical |
| PATCH /auth/change-password | 0 | 🔴 Critical |

---

## Test File Structure

**File:** `apps/api/test/e2e/auth.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let testUserId: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await app.close();
  });

  // Test suites follow...
});
```

---

## Task 1: Registration Tests

```typescript
describe('POST /auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toMatchObject({
      user: {
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      },
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    // Password should never be returned
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();

    testUserId = response.body.user.id;
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(400);

    expect(response.body.message).toContain('email must be an email');
  });

  it('should return 400 for weak password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test2@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/password/i),
      ])
    );
  });

  it('should return 409 for duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('should return 400 for missing required fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@example.com' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/password/i),
        expect.stringMatching(/firstName/i),
        expect.stringMatching(/lastName/i),
      ])
    );
  });
});
```

---

## Task 2: Login Tests

```typescript
describe('POST /auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: testUser.email,
        roles: expect.any(Array),
      },
    });

    // Update tokens for subsequent tests
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should return 401 for invalid password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      })
      .expect(401);
  });

  it('should return 401 for non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      })
      .expect(401);
  });

  it('should return 400 for missing email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ password: 'TestPassword123!' })
      .expect(400);
  });

  it('should return 400 for missing password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email })
      .expect(400);
  });

  it('should include user roles in response', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.user.roles).toBeDefined();
    expect(Array.isArray(response.body.user.roles)).toBe(true);
  });
});
```

---

## Task 3: Token Refresh Tests

```typescript
describe('POST /auth/refresh', () => {
  it('should refresh access token with valid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    // New tokens should be different
    expect(response.body.accessToken).not.toBe(accessToken);
    
    // Update tokens
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should return 401 for invalid refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });

  it('should return 401 for expired refresh token', async () => {
    // This test may require mocking time or using a known expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // expired token
    
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: expiredToken })
      .expect(401);
  });

  it('should return 400 for missing refresh token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({})
      .expect(400);
  });
});
```

---

## Task 4: Current User Tests

```typescript
describe('GET /auth/me', () => {
  it('should return current user with valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: testUserId,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      roles: expect.any(Array),
    });

    // Sensitive fields should be excluded
    expect(response.body.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.refreshToken).toBeUndefined();
  });

  it('should return 401 without token', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);
  });

  it('should return 401 with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should return 401 with malformed auth header', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'InvalidFormat token')
      .expect(401);
  });
});
```

---

## Task 5: Password Management Tests

```typescript
describe('PATCH /auth/change-password', () => {
  it('should change password with valid current password', async () => {
    const newPassword = 'NewPassword456!';
    
    await request(app.getHttpServer())
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: testUser.password,
        newPassword: newPassword,
      })
      .expect(200);

    // Verify can login with new password
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword,
      })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
    
    // Update test user password for subsequent tests
    testUser.password = newPassword;
  });

  it('should return 401 for incorrect current password', async () => {
    await request(app.getHttpServer())
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: 'WrongPassword!',
        newPassword: 'NewPassword789!',
      })
      .expect(401);
  });

  it('should return 400 for weak new password', async () => {
    await request(app.getHttpServer())
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        currentPassword: testUser.password,
        newPassword: 'weak',
      })
      .expect(400);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .patch('/api/auth/change-password')
      .send({
        currentPassword: testUser.password,
        newPassword: 'NewPassword789!',
      })
      .expect(401);
  });
});

describe('POST /auth/forgot-password', () => {
  it('should send reset email for valid user', async () => {
    // Note: In test environment, email won't actually send
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: testUser.email })
      .expect(200);
  });

  it('should return 200 even for non-existent email (security)', async () => {
    // Don't reveal if email exists
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(200);
  });

  it('should return 400 for invalid email format', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: 'invalid-email' })
      .expect(400);
  });
});

describe('POST /auth/reset-password', () => {
  it('should return 400 for invalid reset token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token: 'invalid-token',
        password: 'NewPassword123!',
      })
      .expect(400);
  });

  it('should return 400 for expired reset token', async () => {
    // Test with a known expired token
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token: 'expired-token',
        password: 'NewPassword123!',
      })
      .expect(400);
  });
});
```

---

## Task 6: Logout Tests

```typescript
describe('POST /auth/logout', () => {
  it('should logout and invalidate refresh token', async () => {
    // First, get a fresh token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    const logoutRefreshToken = loginResponse.body.refreshToken;

    // Logout
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({ refreshToken: logoutRefreshToken })
      .expect(200);

    // Verify refresh token is invalidated
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: logoutRefreshToken })
      .expect(401);
  });

  it('should return 401 without authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .send({ refreshToken: 'some-token' })
      .expect(401);
  });
});
```

---

## Task 7: Security Tests

```typescript
describe('Security', () => {
  it('should rate limit login attempts', async () => {
    // Make multiple failed login attempts
    const attempts = [];
    for (let i = 0; i < 10; i++) {
      attempts.push(
        request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword!',
          })
      );
    }

    const responses = await Promise.all(attempts);
    const rateLimited = responses.some(r => r.status === 429);
    
    // At least one should be rate limited
    expect(rateLimited).toBe(true);
  });

  it('should not expose sensitive error details', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'TestPassword123!',
      })
      .expect(401);

    // Should not reveal if user exists
    expect(response.body.message).not.toContain('user not found');
    expect(response.body.message).not.toContain('email does not exist');
  });

  it('should validate JWT signature', async () => {
    // Tampered token
    const tamperedToken = accessToken.slice(0, -5) + 'XXXXX';
    
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });

  it('should reject tokens from different tenant', async () => {
    // This test requires multi-tenant setup
    // Token from tenant A should not work for tenant B resources
  });
});
```

---

## Completion Checklist

- [ ] Registration tests (5 cases)
- [ ] Login tests (6 cases)
- [ ] Token refresh tests (4 cases)
- [ ] Current user tests (4 cases)
- [ ] Change password tests (4 cases)
- [ ] Forgot/reset password tests (5 cases)
- [ ] Logout tests (2 cases)
- [ ] Security tests (4 cases)
- [ ] All tests pass
- [ ] No sensitive data exposed in responses

---

## Running Auth Tests

```bash
# Run only auth tests
pnpm run test:e2e -- --grep "Auth"

# Run with verbose output
pnpm run test:e2e -- --grep "Auth" --verbose

# Run with coverage
pnpm run test:e2e:cov -- --grep "Auth"
```

---

## Expected Test Count

| Category | Tests |
|----------|-------|
| Registration | 5 |
| Login | 6 |
| Token Refresh | 4 |
| Current User | 4 |
| Change Password | 4 |
| Forgot/Reset Password | 5 |
| Logout | 2 |
| Security | 4 |
| **Total** | **34** |
