import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export async function seedAuth(prisma: any, tenantIds: string[]): Promise<void> {
  // System Roles (shared across all tenants)
  const systemRoles = [
    {
      name: 'SUPER_ADMIN',
      description: 'Full system access',
      permissions: ['*'],
      isSystem: true,
    },
    {
      name: 'ADMIN',
      description: 'Tenant administrator',
      permissions: ['users.*', 'roles.*', 'tenant.*', 'crm.*', 'sales.*', 'tms.*', 'carriers.*', 'accounting.*', 'reports.*'],
      isSystem: true,
    },
    {
      name: 'OPERATIONS_MANAGER',
      description: 'Operations oversight',
      permissions: ['tms.*', 'carriers.*', 'loadboard.*', 'claims.*', 'documents.view', 'reports.operations'],
      isSystem: true,
    },
    {
      name: 'DISPATCHER',
      description: 'Dispatch operations',
      permissions: ['tms.orders.view', 'tms.loads.*', 'tms.tracking.*', 'carriers.view', 'loadboard.view', 'loadboard.post'],
      isSystem: true,
    },
    {
      name: 'SALES_REP',
      description: 'Sales operations',
      permissions: ['crm.*', 'sales.*', 'tms.orders.view', 'tms.orders.create', 'reports.sales', 'commission.view'],
      isSystem: true,
    },
    {
      name: 'ACCOUNTING',
      description: 'Financial operations',
      permissions: ['accounting.*', 'tms.orders.view', 'tms.loads.view', 'carriers.view', 'commission.*', 'reports.financial'],
      isSystem: true,
    },
    {
      name: 'CUSTOMER_SERVICE',
      description: 'Support operations',
      permissions: ['tms.orders.view', 'tms.loads.view', 'tms.tracking.view', 'crm.view', 'claims.view', 'claims.create'],
      isSystem: true,
    },
    {
      name: 'READ_ONLY',
      description: 'View-only access',
      permissions: ['*.view'],
      isSystem: true,
    },
    {
      name: 'CLAIMS_MANAGER',
      description: 'Claims department lead',
      permissions: ['claims.*'],
      isSystem: true,
    },
    {
      name: 'CLAIMS_ADJUSTER',
      description: 'Process claims',
      permissions: ['claims.view', 'claims.create', 'claims.update'],
      isSystem: true,
    },
    {
      name: 'CLAIMS_VIEWER',
      description: 'Claims read-only access',
      permissions: ['claims.view'],
      isSystem: true,
    },
    {
      name: 'CONTRACTS_MANAGER',
      description: 'Manage contracts',
      permissions: ['contracts.*'],
      isSystem: true,
    },
    {
      name: 'CONTRACTS_VIEWER',
      description: 'Contracts read-only access',
      permissions: ['contracts.view'],
      isSystem: true,
    },
    {
      name: 'AGENT_MANAGER',
      description: 'Manage agent relationships',
      permissions: ['agents.*', 'commission.view'],
      isSystem: true,
    },
    {
      name: 'AGENT',
      description: 'Agent portal user',
      permissions: ['agents.view', 'commission.view'],
      isSystem: true,
    },
    {
      name: 'CREDIT_ANALYST',
      description: 'Process credit applications',
      permissions: ['credit.*'],
      isSystem: true,
    },
    {
      name: 'CREDIT_VIEWER',
      description: 'Credit read-only access',
      permissions: ['credit.view'],
      isSystem: true,
    },
  ];

  const roleMap: Record<string, string> = {};

  for (const roleData of systemRoles) {
    // Check if role already exists
    const existing = await prisma.role.findFirst({
      where: {
        name: roleData.name,
        isSystem: true,
        tenantId: null,
      },
    });

    if (existing) {
      // Update existing role
      const role = await prisma.role.update({
        where: { id: existing.id },
        data: {
          description: roleData.description,
          permissions: roleData.permissions,
        },
      });
      roleMap[roleData.name] = role.id;
    } else {
      // Create new role
      const role = await prisma.role.create({
        data: {
          ...roleData,
          tenantId: null,
          externalId: `SEED-ROLE-${roleData.name.replace(/\s+/g, '-').toUpperCase()}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      roleMap[roleData.name] = role.id;
    }
  }

  console.log(`   ✓ Created ${systemRoles.length} system roles`);

  // Create users for each tenant
  let totalUsers = 0;
  const passwordHash = await bcrypt.hash('password123', 10);

  for (const tenantId of tenantIds) {
    // Admin user
    const adminEmail = `admin${totalUsers + 1}@tms.local`;
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId, email: adminEmail } },
      update: {},
      create: {
        tenantId,
        email: adminEmail,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        roleId: roleMap['ADMIN'],
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        timezone: 'America/Chicago',
        locale: 'en',
        phone: '555-000-0001',
        avatarUrl: null,
        externalId: `SEED-USER-ADMIN-${totalUsers + 1}`,
        sourceSystem: 'FAKER_SEED',
      },
    });
    totalUsers++;

    // Random users (19 per tenant to reach 100 total)
    for (let i = 0; i < 19; i++) {
      const roles = Object.keys(roleMap).filter(r => r !== 'SUPER_ADMIN');
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const userEmail = `user${totalUsers + i + 1}@tms.local`;
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId, email: userEmail } },
        update: {},
        create: {
          tenantId,
          email: userEmail,
          passwordHash,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          roleId: roleMap[randomRole],
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'INACTIVE']),
          emailVerifiedAt: faker.datatype.boolean() ? faker.date.past() : null,
          timezone: faker.helpers.arrayElement(['America/Chicago', 'America/New_York', 'America/Los_Angeles']),
          locale: 'en',
          phone: faker.helpers.maybe(() => `555-${faker.string.numeric(3)}-${faker.string.numeric(4)}`, { probability: 0.8 }),
          avatarUrl: null,
          externalId: `SEED-USER-${totalUsers + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    totalUsers += 19;
  }

  console.log(`   ✓ Created ${totalUsers} users across ${tenantIds.length} tenants`);
}
