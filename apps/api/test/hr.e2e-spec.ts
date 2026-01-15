import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma.service';
import { createTestApp, createTestAppWithRole } from './helpers/test-app.helper';

const TEST_TENANT = 'tenant-hr';
const TEST_USER = 'user-hr';
const TEST_EMAIL = 'user@hr.test';

describe('HR API E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp(TEST_TENANT, TEST_USER, TEST_EMAIL);
    app = setup.app;
    prisma = setup.prisma;

    await prisma.employee.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.department.deleteMany({ where: { tenantId: TEST_TENANT } });
  });

  afterAll(async () => {
    await prisma.employee.deleteMany({ where: { tenantId: TEST_TENANT } });
    await prisma.department.deleteMany({ where: { tenantId: TEST_TENANT } });
    await app.close();
  });

  it('lists departments', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/hr/departments')
      .expect(200);
  });

  it('creates and updates departments', async () => {
    const deptRes = await request(app.getHttpServer())
      .post('/api/v1/hr/departments')
      .send({ name: 'Operations', code: 'OPS' })
      .expect(201);

    const deptId = deptRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/hr/departments/${deptId}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/hr/departments/${deptId}`)
      .send({ description: 'Operations team' })
      .expect(200);
  });

  it('creates employees and terminates', async () => {
    const dept = await prisma.department.create({
      data: { tenantId: TEST_TENANT, name: 'HR', code: 'HR' },
    });

    const empRes = await request(app.getHttpServer())
      .post('/api/v1/hr/employees')
      .send({
        firstName: 'Sam',
        lastName: 'Employee',
        email: 'sam.employee@hr.test',
        employmentType: 'FULL_TIME',
        hireDate: new Date().toISOString(),
        departmentId: dept.id,
      })
      .expect(201);

    const empId = empRes.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/hr/employees/${empId}`)
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/hr/employees/${empId}`)
      .send({ phone: '555-0100' })
      .expect(200);

    const adminSetup = await createTestAppWithRole('tenant-hr-admin', 'user-hr-admin', 'admin@hr.test', 'admin');
    const adminApp = adminSetup.app;
    const adminPrisma = adminSetup.prisma;

    const adminDept = await adminPrisma.department.create({
      data: { tenantId: 'tenant-hr-admin', name: 'Admin HR', code: `AHR-${Date.now()}` },
    });

    const adminEmp = await adminPrisma.employee.create({
      data: {
        tenantId: 'tenant-hr-admin',
        firstName: 'Admin',
        lastName: 'Employee',
        email: 'admin.employee@hr.test',
        employeeNumber: `EMP-${Date.now()}`,
        employmentType: 'FULL_TIME',
        hireDate: new Date(),
        departmentId: adminDept.id,
      },
    });

    await request(adminApp.getHttpServer())
      .post(`/api/v1/hr/employees/${adminEmp.id}/terminate`)
      .send({ terminationDate: new Date().toISOString() })
      .expect(201);

    await adminPrisma.employee.deleteMany({ where: { tenantId: 'tenant-hr-admin' } });
    await adminPrisma.department.deleteMany({ where: { tenantId: 'tenant-hr-admin' } });
    await adminApp.close();
  });
});
