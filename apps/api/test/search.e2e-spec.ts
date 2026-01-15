import request from 'supertest';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RedisService } from '../src/modules/redis/redis.service';
import { ElasticsearchService } from '../src/modules/search/elasticsearch/elasticsearch.service';
import { createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-search';
const TEST_USER = {
  id: 'user-search',
  email: 'user@search.test',
  tenantId: TEST_TENANT,
  roleName: 'admin',
  role: { name: 'admin', permissions: [] },
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
    app.use((req, _res, next) => {
      req.user = {
        id: TEST_USER.id,
        userId: TEST_USER.id,
        email: TEST_USER.email,
        tenantId: TEST_TENANT,
        role: TEST_USER.role,
        roleName: TEST_USER.roleName,
        roles: TEST_USER.roles,
        permissions: [],
      };
      req.headers['x-tenant-id'] = TEST_TENANT;
      req.tenantId = TEST_TENANT;
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.savedSearch.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.searchHistory.deleteMany({ where: { tenantId: TEST_TENANT } });

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
    await prisma.savedSearch.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.searchHistory.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  it('returns recent searches', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/search/recent')
      .expect(200);
  });

  it('performs global search and suggestions', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/search?q=load')
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/search/suggestions?q=loa')
      .expect(200);
  });

  it('manages saved searches', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/searches/saved')
      .send({ name: 'My Loads', entityType: 'LOADS', queryText: 'status:OPEN', isPublic: false })
      .expect(201);

    const savedId = createRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/searches/saved/${savedId}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/searches/saved/${savedId}`)
      .send({ description: 'Open loads' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/searches/saved/${savedId}/execute`)
      .expect(201);

    const managerSetup = await createTestAppWithRole('tenant-search-admin', 'user-search-admin', 'admin@search.test', 'manager');
    const managerApp = managerSetup.app;
    const managerPrisma = managerSetup.prisma;

    const managerSaved = await managerPrisma.savedSearch.create({
      data: {
        tenantId: 'tenant-search-admin',
        userId: 'user-search-admin',
        name: 'Manager Search',
        entityType: 'LOADS',
        isPublic: false,
        query: { queryText: 'status:IN_TRANSIT' },
      },
    });

    await request(managerApp.getHttpServer())
      .delete(`/api/v1/searches/saved/${managerSaved.id}`)
      .expect(200);

    await managerPrisma.savedSearch.deleteMany({ where: { tenantId: 'tenant-search-admin' } });
    await managerApp.close();
  });

  it('restricts index management to admins', async () => {
    const opsSetup = await createTestAppWithRole('tenant-search-rbac', 'user-search-ops', 'ops@search.test', 'OPERATIONS_MANAGER');
    const opsApp = opsSetup.app;

    await request(opsApp.getHttpServer())
      .post('/api/v1/search/indexes/load/reindex')
      .expect(403);

    await opsApp.close();
  });
});
