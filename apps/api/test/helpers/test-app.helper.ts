import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
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
  | 'COMPLIANCE'
  | 'CUSTOMER'
  | 'CUSTOMER_SERVICE'
  | 'MARKETING'
  | 'EXECUTIVE'
  | 'OPERATIONS_MANAGER'
  | 'SYSTEM_INTEGRATOR';

export async function createTestApp(
  tenantId: string,
  userId: string,
  email: string,
): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const testUser = {
    id: userId,
    userId,
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
        req.user = resolveTestUser(req);
        req.headers['x-tenant-id'] = tenantId;
        req.tenantId = tenantId;
        return true;
      },
    })
    .overrideProvider(RedisService)
    .useValue({
      ping: async () => 'PONG',
      keys: async () => [],
      deleteByPattern: async () => 0,
      getValue: async () => null,
      setValue: async () => undefined,
      deleteKeys: async () => undefined,
      getJson: async () => null,
      setJson: async () => undefined,
      setWithTTL: async () => undefined,
      storeSession: async () => undefined,
      getSession: async () => null,
      revokeSession: async () => undefined,
      revokeAllUserSessions: async () => undefined,
      getUserSessions: async () => [],
      getUserSessionCount: async () => 0,
      blacklistToken: async () => undefined,
      isTokenBlacklisted: async () => false,
      storePasswordResetToken: async () => undefined,
    })
    .compile();

  const app = moduleRef.createNestApplication();
  app.use((req, _res, next) => {
    req.user = resolveTestUser(req);
    req.headers['x-tenant-id'] = tenantId;
    req.tenantId = tenantId;
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

  const prisma = app.get(PrismaService);

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
  const testUser = {
    id: userId,
    userId,
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
        req.user = resolveTestUser(req);
        req.headers['x-tenant-id'] = tenantId;
        req.tenantId = tenantId;
        return true;
      },
    })
    .overrideProvider(RedisService)
    .useValue({
      ping: async () => 'PONG',
      keys: async () => [],
      deleteByPattern: async () => 0,
      getValue: async () => null,
      setValue: async () => undefined,
      deleteKeys: async () => undefined,
      getJson: async () => null,
      setJson: async () => undefined,
      setWithTTL: async () => undefined,
      storeSession: async () => undefined,
      getSession: async () => null,
      revokeSession: async () => undefined,
      revokeAllUserSessions: async () => undefined,
      getUserSessions: async () => [],
      getUserSessionCount: async () => 0,
      blacklistToken: async () => undefined,
      isTokenBlacklisted: async () => false,
      storePasswordResetToken: async () => undefined,
    })
    .compile();

  const app = moduleRef.createNestApplication();
  app.use((req, _res, next) => {
    req.user = resolveTestUser(req);
    req.headers['x-tenant-id'] = tenantId;
    req.tenantId = tenantId;
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

  const prisma = app.get(PrismaService);

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
