import { ExecutionContext, INestApplication } from '@nestjs/common';
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

export async function createTestApp(
  tenantId: string,
  userId: string,
  email: string,
): Promise<{ app: INestApplication; prisma: PrismaService }> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = {
          id: userId,
          userId,
          email,
          tenantId,
          role: 'SUPER_ADMIN',
          roleName: 'SUPER_ADMIN',
          roles: ['SUPER_ADMIN'],
          permissions: [],
        };
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
  app.setGlobalPrefix('api/v1');
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
