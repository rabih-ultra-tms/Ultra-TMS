/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient() as any;

async function main() {
  console.log('🌱 Seeding database...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Tenant',
      slug: 'default',
      domain: 'default.ultra-tms.local',
      settings: {
        timezone: 'America/Chicago',
        language: 'en',
        currency: 'USD',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: true,
      },
      branding: {
        primaryColor: '#3b82f6',
        logo: null,
      },
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created tenant: ${tenant.name} (${tenant.slug})`);

  // Create system roles
  const roles = [
    {
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['*'], // Wildcard for all permissions
      isSystem: true,
    },
    {
      name: 'Admin',
      description: 'Administrative access to manage users, settings, and view all reports',
      permissions: [
        'users.*', 'roles.*', 'tenant.*',
        'crm.*', 'sales.*', 'tms.*', 'carriers.*',
        'accounting.*', 'documents.*', 'reports.*',
        'commission.*',
      ],
      isSystem: true,
    },
    {
      name: 'Operations Manager',
      description: 'Manage day-to-day operations, orders, carriers, and dispatch',
      permissions: [
        'tms.orders.*', 'tms.loads.*',
        'carriers.*',
        'crm.companies.view', 'crm.contacts.view',
        'documents.view', 'documents.upload',
        'reports.operations',
      ],
      isSystem: true,
    },
    {
      name: 'Dispatcher',
      description: 'Dispatch loads and track shipments',
      permissions: [
        'tms.orders.view', 'tms.orders.edit',
        'tms.loads.view', 'tms.loads.edit', 'tms.loads.dispatch',
        'carriers.view',
        'documents.view', 'documents.upload',
      ],
      isSystem: true,
    },
    {
      name: 'Sales Rep',
      description: 'Manage customers, quotes, and sales pipeline',
      permissions: [
        'crm.*',
        'sales.quotes.*',
        'tms.orders.view', 'tms.orders.create',
        'documents.view', 'documents.upload',
        'reports.sales',
        'commission.view',
      ],
      isSystem: true,
    },
    {
      name: 'Accounting',
      description: 'Manage invoices, payments, and financial reports',
      permissions: [
        'accounting.*',
        'tms.orders.view', 'tms.loads.view',
        'carriers.view',
        'crm.companies.view',
        'documents.view', 'documents.upload',
        'reports.financial',
      ],
      isSystem: true,
    },
    {
      name: 'Read Only',
      description: 'View-only access to most areas',
      permissions: [
        '*.view',
        'documents.view',
      ],
      isSystem: true,
    },
  ];

  for (const roleData of roles) {
    // Check if role exists
    const existing = await prisma.role.findFirst({
      where: {
        name: roleData.name,
        isSystem: true,
        tenantId: null,
      },
    });

    if (existing) {
      // Update existing role
      await prisma.role.update({
        where: { id: existing.id },
        data: {
          description: roleData.description,
          permissions: roleData.permissions,
        },
      });
      console.log(`✅ Updated role: ${roleData.name}`);
    } else {
      // Create new role
      const role = await prisma.role.create({
        data: {
          ...roleData,
          tenantId: null,
        },
      });
      console.log(`✅ Created role: ${role.name}`);
    }
  }

  // Get Super Admin role for default user
  const superAdminRole = await prisma.role.findFirst({
    where: { name: 'Super Admin', tenantId: null },
  });

  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 10); // CHANGE IN PRODUCTION!

  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@ultra-tms.local',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@ultra-tms.local',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      timezone: 'America/Chicago',
      locale: 'en',
      customFields: {
        department: 'Management',
        isSeeded: true,
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email} (password: admin123)`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
