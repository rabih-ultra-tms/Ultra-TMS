import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RedisService } from '../src/modules/redis/redis.service';
import { ElasticsearchService } from '../src/modules/search/elasticsearch/elasticsearch.service';

const TEST_TENANT = 'tenant-search';
const TEST_USER = {
  id: 'user-search',
  email: 'user@search.test',
  tenantId: TEST_TENANT,
  roles: ['admin'],
};

describe('Search API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = {
            id: TEST_USER.id,
            userId: TEST_USER.id,
            email: TEST_USER.email,
            tenantId: TEST_TENANT,
            roles: TEST_USER.roles,
            permissions: [],
          };
          req.headers['x-tenant-id'] = TEST_TENANT;
          req.tenantId = TEST_TENANT;
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
      })
      .overrideProvider(ElasticsearchService)
      .useValue({
        searchGlobal: async () => ({ total: 0, items: [], facets: {} }),
        searchEntity: async () => ({ total: 0, items: [], facets: {} }),
        suggest: async () => ({ suggestions: [] }),
        indexDocument: async () => ({ success: true }),
        deleteDocument: async () => ({ success: true }),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.tenant.upsert({
      where: { slug: TEST_TENANT },
      update: { name: 'Search Tenant' },
      create: { id: TEST_TENANT, slug: TEST_TENANT, name: 'Search Tenant' },
    });

    await prisma.user.upsert({
      where: { id: TEST_USER.id },
      update: {
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Search',
        lastName: 'User',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
      },
      create: {
        id: TEST_USER.id,
        tenantId: TEST_TENANT,
        email: TEST_USER.email,
        firstName: 'Search',
        lastName: 'User',
        passwordHash: 'hashed-password',
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns recent searches', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/search/recent')
      .expect(200);
  });
});
