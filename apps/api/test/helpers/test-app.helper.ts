import { ExecutionContext, INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { RedisService } from '../../src/modules/redis/redis.service';

export type TestUser = {
  id: string;
  email: string;
  tenantId: string;
};

export type TestRole =
  | 'viewer'
  | 'user'
  | 'manager'
  | 'admin'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CLAIMS_VIEWER'
  | 'CLAIMS_MANAGER'
  | 'CLAIMS_ADJUSTER'
  | 'EDI_MANAGER'
  | 'FACTORING_MANAGER'
  | 'COLLECTIONS_AGENT'
  | 'BILLING'
  | 'LEGAL'
  | 'SALES_REP'
  | 'SALES_MANAGER'
  | 'ACCOUNT_MANAGER'
  | 'DISPATCHER'
  | 'CARRIER_MANAGER'
  | 'OPERATIONS'
  | 'ACCOUNTING'
  | 'PRICING_ANALYST'
  | 'SAFETY_MANAGER'
  | 'CARRIER'
  | 'ACCOUNTING_MANAGER'
  | 'AGENT'
  | 'AGENT_MANAGER'
  | 'CONTRACTS_MANAGER'
  | 'CONTRACTS_VIEWER'
  | 'CREDIT_ANALYST'
  | 'CREDIT_VIEWER'
  | 'COMPLIANCE'
  | 'CUSTOMER'
  | 'CUSTOMER_SERVICE'
  | 'MARKETING'
  | 'EXECUTIVE'
  | 'OPERATIONS_MANAGER'
  | 'SYSTEM_INTEGRATOR';

const createRedisMock = () => {
  const keyValueStore = new Map<string, { value: string; expiresAt?: number }>();
  const sessions = new Map<string, { refreshTokenHash: string; expiresAt?: number }>();
  const loginAttempts = new Map<string, number>();
  const accountLocks = new Map<string, number>();
  const passwordResetTokens = new Map<string, number>();
  const emailVerificationTokens = new Map<string, number>();
  const blacklistedTokens = new Map<string, number>();

  const isExpired = (expiresAt?: number) => expiresAt !== undefined && expiresAt <= Date.now();

  const getSessionKey = (userId: string, sessionId: string) => `${userId}:${sessionId}`;
  const getResetTokenKey = (userId: string, tokenHash: string) => `${userId}:${tokenHash}`;
  const getEmailTokenKey = (userId: string, tokenHash: string) => `${userId}:${tokenHash}`;

  return {
    ping: async () => 'PONG',
    keys: async (pattern: string) => {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return [...keyValueStore.keys()].filter((key) => key.startsWith(prefix));
      }
      return keyValueStore.has(pattern) ? [pattern] : [];
    },
    deleteByPattern: async (pattern: string) => {
      const keys = pattern.endsWith('*')
        ? [...keyValueStore.keys()].filter((key) => key.startsWith(pattern.slice(0, -1)))
        : keyValueStore.has(pattern)
          ? [pattern]
          : [];
      keys.forEach((key) => keyValueStore.delete(key));
      return keys.length;
    },
    getValue: async (key: string) => {
      const entry = keyValueStore.get(key);
      if (!entry) return null;
      if (isExpired(entry.expiresAt)) {
        keyValueStore.delete(key);
        return null;
      }
      return entry.value;
    },
    setValue: async (key: string, value: string, ttlSeconds?: number) => {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      keyValueStore.set(key, { value, expiresAt });
    },
    deleteKeys: async (keys: string[]) => {
      keys.forEach((key) => keyValueStore.delete(key));
    },
    getJson: async (key: string) => {
      const raw = await keyValueStore.get(key)?.value;
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    setJson: async (key: string, value: unknown, ttlSeconds?: number) => {
      const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
      keyValueStore.set(key, { value: JSON.stringify(value), expiresAt });
    },
    setWithTTL: async (key: string, value: string, ttlSeconds: number) => {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      keyValueStore.set(key, { value, expiresAt });
    },
    storeSession: async (userId: string, sessionId: string, refreshTokenHash: string, expiresInSeconds: number) => {
      const key = getSessionKey(userId, sessionId);
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      sessions.set(key, { refreshTokenHash, expiresAt });
    },
    getSession: async (userId: string, sessionId: string) => {
      const key = getSessionKey(userId, sessionId);
      const entry = sessions.get(key);
      if (!entry) return null;
      if (isExpired(entry.expiresAt)) {
        sessions.delete(key);
        return null;
      }
      return { refreshTokenHash: entry.refreshTokenHash, createdAt: new Date().toISOString() };
    },
    revokeSession: async (userId: string, sessionId: string) => {
      sessions.delete(getSessionKey(userId, sessionId));
    },
    revokeAllUserSessions: async (userId: string) => {
      [...sessions.keys()]
        .filter((key) => key.startsWith(`${userId}:`))
        .forEach((key) => sessions.delete(key));
    },
    getUserSessions: async (userId: string) => {
      return [...sessions.keys()]
        .filter((key) => key.startsWith(`${userId}:`))
        .map((key) => key.split(':')[1])
        .filter((id): id is string => id !== undefined);
    },
    getUserSessionCount: async (userId: string) => {
      return [...sessions.keys()].filter((key) => key.startsWith(`${userId}:`)).length;
    },
    blacklistToken: async (jti: string, expiresInSeconds: number) => {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      blacklistedTokens.set(jti, expiresAt);
    },
    isTokenBlacklisted: async (jti: string) => {
      const expiresAt = blacklistedTokens.get(jti);
      if (isExpired(expiresAt)) {
        blacklistedTokens.delete(jti);
        return false;
      }
      return blacklistedTokens.has(jti);
    },
    storePasswordResetToken: async (userId: string, tokenHash: string, expiresInSeconds: number) => {
      const key = getResetTokenKey(userId, tokenHash);
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      passwordResetTokens.set(key, expiresAt);
    },
    consumePasswordResetToken: async (userId: string, tokenHash: string) => {
      const key = getResetTokenKey(userId, tokenHash);
      const expiresAt = passwordResetTokens.get(key);
      if (isExpired(expiresAt)) {
        passwordResetTokens.delete(key);
        return false;
      }
      if (!passwordResetTokens.has(key)) return false;
      passwordResetTokens.delete(key);
      return true;
    },
    incrementLoginAttempts: async (email: string) => {
      const attempts = (loginAttempts.get(email) ?? 0) + 1;
      loginAttempts.set(email, attempts);
      return attempts;
    },
    getLoginAttempts: async (email: string) => {
      return loginAttempts.get(email) ?? 0;
    },
    resetLoginAttempts: async (email: string) => {
      loginAttempts.delete(email);
    },
    lockAccount: async (email: string, durationSeconds: number) => {
      const expiresAt = Date.now() + durationSeconds * 1000;
      accountLocks.set(email, expiresAt);
    },
    isAccountLocked: async (email: string) => {
      const expiresAt = accountLocks.get(email);
      if (isExpired(expiresAt)) {
        accountLocks.delete(email);
        return false;
      }
      return accountLocks.has(email);
    },
    storeEmailVerificationToken: async (userId: string, tokenHash: string, expiresInSeconds: number) => {
      const key = getEmailTokenKey(userId, tokenHash);
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      emailVerificationTokens.set(key, expiresAt);
    },
    consumeEmailVerificationToken: async (userId: string, tokenHash: string) => {
      const key = getEmailTokenKey(userId, tokenHash);
      const expiresAt = emailVerificationTokens.get(key);
      if (isExpired(expiresAt)) {
        emailVerificationTokens.delete(key);
        return false;
      }
      if (!emailVerificationTokens.has(key)) return false;
      emailVerificationTokens.delete(key);
      return true;
    },
  };
};

let prismaSingleton: PrismaService | null = null;
let prismaInitPromise: Promise<void> | null = null;

export const getTestPrisma = async () => {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaService();
    const originalInit = prismaSingleton.onModuleInit.bind(prismaSingleton);
    const originalDestroy = prismaSingleton.onModuleDestroy?.bind(prismaSingleton);
    prismaSingleton.onModuleInit = async () => {
      if (!prismaInitPromise) {
        prismaInitPromise = originalInit();
      }
      await prismaInitPromise;
    };
    prismaSingleton.onModuleDestroy = async () => {
      if (typeof originalDestroy === 'function') {
        await originalDestroy();
      }
      prismaInitPromise = null;
    };
  }

  await prismaSingleton.onModuleInit();
  return prismaSingleton;
};

const isHeaderTruthy = (value: unknown) => {
  if (Array.isArray(value)) {
    value = value[0];
  }
  return value === true || value === 'true' || value === '1';
};

const isHeaderFalsy = (value: unknown) => {
  if (Array.isArray(value)) {
    value = value[0];
  }
  return value === false || value === 'false' || value === '0';
};

const hasTestAuth = (req?: any) => {
  const headers = req?.headers ?? {};
  if (isHeaderTruthy(headers['x-test-unauth']) || isHeaderFalsy(headers['x-test-auth'])) {
    return false;
  }
  return true;
};

export async function createTestApp(
  tenantId: string,
  userId: string,
  email: string,
): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const prisma = await getTestPrisma();
  const testUser = {
    id: userId,
    userId,
    sub: userId,
    email,
    tenantId,
    role: { name: 'SUPER_ADMIN', permissions: [] },
    roleName: 'SUPER_ADMIN',
    roles: ['SUPER_ADMIN'],
    permissions: [],
  };

  const resolveTestUser = (req?: any) => {
    const roleHeader = req?.headers?.['x-test-role'];
    const roleOverride = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    const userIdHeader = req?.headers?.['x-test-user-id'];
    const emailHeader = req?.headers?.['x-test-user-email'];

    const effectiveRole = (roleOverride ?? testUser.roleName ?? testUser.role?.name ?? testUser.role) as string;
    const effectiveUserId = (userIdHeader ?? testUser.id) as string;
    const effectiveEmail = (emailHeader ?? testUser.email) as string;

    return {
      ...testUser,
      id: effectiveUserId,
      userId: effectiveUserId,
      sub: effectiveUserId,
      email: effectiveEmail,
      role: { name: effectiveRole, permissions: [] },
      roleName: effectiveRole,
      roles: [effectiveRole],
    };
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        if (!hasTestAuth(req)) {
          throw new UnauthorizedException();
        }
        req.user = resolveTestUser(req);
        req.headers['x-tenant-id'] = tenantId;
        req.tenantId = tenantId;
        return true;
      },
    })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue(createRedisMock())
    .compile();

  const app = moduleRef.createNestApplication();
  app.use((req, _res, next) => {
    if (hasTestAuth(req)) {
      req.user = resolveTestUser(req);
      req.headers['x-tenant-id'] = tenantId;
      req.tenantId = tenantId;
    }
    next();
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();

  await prisma.tenant.upsert({
    where: { slug: tenantId },
    update: { name: `${tenantId} Tenant` },
    create: { id: tenantId, slug: tenantId, name: `${tenantId} Tenant` },
  });

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      tenantId,
      email,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    },
    create: {
      id: userId,
      tenantId,
      email,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    },
  });

  return { app, prisma };
}

export async function createTestAppWithRole(
  tenantId: string,
  userId: string,
  email: string,
  role: TestRole = 'user',
): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const prisma = await getTestPrisma();
  const testUser = {
    id: userId,
    userId,
    sub: userId,
    email,
    tenantId,
    role: { name: role, permissions: [] },
    roleName: role,
    roles: [role],
    permissions: [],
  };

  const resolveTestUser = (req?: any) => {
    const roleHeader = req?.headers?.['x-test-role'];
    const roleOverride = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    const userIdHeader = req?.headers?.['x-test-user-id'];
    const emailHeader = req?.headers?.['x-test-user-email'];

    const effectiveRole = (roleOverride ?? testUser.roleName ?? testUser.role?.name ?? testUser.role) as string;
    const effectiveUserId = (userIdHeader ?? testUser.id) as string;
    const effectiveEmail = (emailHeader ?? testUser.email) as string;

    return {
      ...testUser,
      id: effectiveUserId,
      userId: effectiveUserId,
      sub: effectiveUserId,
      email: effectiveEmail,
      role: { name: effectiveRole, permissions: [] },
      roleName: effectiveRole,
      roles: [effectiveRole],
    };
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        if (!hasTestAuth(req)) {
          throw new UnauthorizedException();
        }
        req.user = resolveTestUser(req);
        req.headers['x-tenant-id'] = tenantId;
        req.tenantId = tenantId;
        return true;
      },
    })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(RedisService)
    .useValue(createRedisMock())
    .compile();

  const app = moduleRef.createNestApplication();
  app.use((req, _res, next) => {
    if (hasTestAuth(req)) {
      req.user = resolveTestUser(req);
      req.headers['x-tenant-id'] = tenantId;
      req.tenantId = tenantId;
    }
    next();
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();

  await prisma.tenant.upsert({
    where: { slug: tenantId },
    update: { name: `${tenantId} Tenant` },
    create: { id: tenantId, slug: tenantId, name: `${tenantId} Tenant` },
  });

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      tenantId,
      email,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    },
    create: {
      id: userId,
      tenantId,
      email,
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    },
  });

  return { app, prisma };
}
