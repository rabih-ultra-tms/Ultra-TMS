/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { seedComprehensiveData } from './seed-data';

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
      description: 'Full system access - Platform operator with complete control over all features',
      permissions: ['*'], // Wildcard for all permissions
      isSystem: true,
    },
    {
      name: 'Admin',
      description: 'Tenant administrator - Full access to manage users, settings, and view all reports',
      permissions: [
        // User Management
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.invite',
        // Role Management
        'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
        // Tenant Settings
        'tenant.view', 'tenant.edit', 'tenant.settings',
        // CRM
        'crm.companies.view', 'crm.companies.create', 'crm.companies.edit', 'crm.companies.delete',
        'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit', 'crm.contacts.delete',
        'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete',
        'crm.opportunities.view', 'crm.opportunities.create', 'crm.opportunities.edit', 'crm.opportunities.delete',
        'crm.activities.view', 'crm.activities.create', 'crm.activities.edit', 'crm.activities.delete',
        // Sales
        'sales.quotes.view', 'sales.quotes.create', 'sales.quotes.edit', 'sales.quotes.delete',
        'sales.proposals.view', 'sales.proposals.create', 'sales.proposals.edit', 'sales.proposals.delete',
        'sales.rates.view', 'sales.rates.manage',
        // TMS Operations
        'tms.orders.view', 'tms.orders.create', 'tms.orders.edit', 'tms.orders.delete',
        'tms.loads.view', 'tms.loads.create', 'tms.loads.edit', 'tms.loads.delete', 'tms.loads.dispatch',
        'tms.tracking.view', 'tms.tracking.update',
        'tms.appointments.view', 'tms.appointments.manage',
        // Carriers
        'carriers.view', 'carriers.create', 'carriers.edit', 'carriers.delete',
        'carriers.compliance.view', 'carriers.compliance.manage',
        'carriers.scorecards.view', 'carriers.scorecards.manage',
        'carriers.safety.view', 'carriers.safety.manage',
        // Load Board
        'loadboard.view', 'loadboard.post', 'loadboard.manage',
        // Accounting
        'accounting.invoices.view', 'accounting.invoices.create', 'accounting.invoices.edit', 'accounting.invoices.approve',
        'accounting.payments.view', 'accounting.payments.process',
        'accounting.payables.view', 'accounting.payables.process',
        'accounting.settlements.view', 'accounting.settlements.manage',
        'accounting.credit.view', 'accounting.credit.manage',
        // Documents
        'documents.view', 'documents.upload', 'documents.edit', 'documents.delete',
        'documents.templates.view', 'documents.templates.manage',
        // Claims
        'claims.view', 'claims.create', 'claims.edit', 'claims.manage',
        // Commission
        'commission.view', 'commission.manage', 'commission.statements',
        // Reports & Analytics
        'reports.operations', 'reports.sales', 'reports.financial', 'reports.analytics',
        'analytics.view', 'analytics.reports', 'analytics.export',
        // Communication
        'communication.email', 'communication.sms', 'communication.chat',
        // Workflow
        'workflow.view', 'workflow.create', 'workflow.manage',
        // Integrations
        'integrations.view', 'integrations.manage',
        // Audit
        'audit.view',
      ],
      isSystem: true,
    },
    {
      name: 'Operations Manager',
      description: 'Operations oversight - Manage day-to-day operations, orders, carriers, and dispatch teams',
      permissions: [
        // Dashboard
        'dashboard.operations',
        // TMS Operations
        'tms.orders.view', 'tms.orders.create', 'tms.orders.edit', 'tms.orders.delete',
        'tms.loads.view', 'tms.loads.create', 'tms.loads.edit', 'tms.loads.delete', 'tms.loads.dispatch',
        'tms.tracking.view', 'tms.tracking.update',
        'tms.appointments.view', 'tms.appointments.manage',
        // Carriers
        'carriers.view', 'carriers.create', 'carriers.edit',
        'carriers.compliance.view', 'carriers.compliance.manage',
        'carriers.scorecards.view', 'carriers.scorecards.manage',
        'carriers.safety.view', 'carriers.safety.manage',
        // Load Board
        'loadboard.view', 'loadboard.post', 'loadboard.manage',
        // CRM (Read Only)
        'crm.companies.view', 'crm.contacts.view',
        // Documents
        'documents.view', 'documents.upload', 'documents.edit',
        // Claims
        'claims.view', 'claims.create', 'claims.edit', 'claims.manage',
        // Reports
        'reports.operations', 'reports.analytics',
        'analytics.view', 'analytics.reports',
        // Team Management
        'users.view', 'users.edit',
        // Communication
        'communication.email', 'communication.sms', 'communication.chat',
      ],
      isSystem: true,
    },
    {
      name: 'Dispatcher',
      description: 'Dispatch operations - Manage loads, track shipments, coordinate with carriers',
      permissions: [
        // Dashboard
        'dashboard.dispatch',
        // TMS Operations
        'tms.orders.view', 'tms.orders.edit',
        'tms.loads.view', 'tms.loads.create', 'tms.loads.edit', 'tms.loads.dispatch',
        'tms.tracking.view', 'tms.tracking.update',
        'tms.appointments.view', 'tms.appointments.manage',
        // Carriers
        'carriers.view', 'carriers.search',
        'carriers.scorecards.view',
        // Load Board
        'loadboard.view', 'loadboard.post', 'loadboard.search',
        'loadboard.bids.view', 'loadboard.bids.accept',
        // Documents
        'documents.view', 'documents.upload',
        'documents.rate-confirmations', 'documents.pods',
        // Communication
        'communication.email', 'communication.sms', 'communication.chat',
      ],
      isSystem: true,
    },
    {
      name: 'Sales Rep',
      description: 'Sales operations - Manage customers, create quotes, track sales pipeline',
      permissions: [
        // Dashboard
        'dashboard.sales',
        // CRM
        'crm.companies.view', 'crm.companies.create', 'crm.companies.edit',
        'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit',
        'crm.leads.view', 'crm.leads.create', 'crm.leads.edit',
        'crm.opportunities.view', 'crm.opportunities.create', 'crm.opportunities.edit',
        'crm.activities.view', 'crm.activities.create', 'crm.activities.edit',
        // Sales
        'sales.quotes.view', 'sales.quotes.create', 'sales.quotes.edit',
        'sales.proposals.view', 'sales.proposals.create', 'sales.proposals.edit',
        'sales.rates.view',
        // Orders
        'tms.orders.view', 'tms.orders.create',
        // Documents
        'documents.view', 'documents.upload',
        // Reports
        'reports.sales', 'reports.analytics',
        // Commission
        'commission.view', 'commission.statements',
        // Communication
        'communication.email', 'communication.templates',
      ],
      isSystem: true,
    },
    {
      name: 'Accounting',
      description: 'Financial operations - Manage invoices, payments, and financial reporting',
      permissions: [
        // Dashboard
        'dashboard.financial',
        // Accounting
        'accounting.invoices.view', 'accounting.invoices.create', 'accounting.invoices.edit', 'accounting.invoices.approve',
        'accounting.payments.view', 'accounting.payments.process',
        'accounting.payables.view', 'accounting.payables.process',
        'accounting.settlements.view', 'accounting.settlements.manage',
        'accounting.credit.view', 'accounting.credit.manage',
        // Orders & Loads (Read Only)
        'tms.orders.view', 'tms.loads.view',
        // Carriers (Read Only)
        'carriers.view',
        // CRM (Read Only)
        'crm.companies.view',
        // Documents
        'documents.view', 'documents.upload',
        // Commission
        'commission.view', 'commission.manage', 'commission.statements',
        // Reports
        'reports.financial', 'reports.analytics',
        'analytics.view', 'analytics.export',
      ],
      isSystem: true,
    },
    {
      name: 'Customer Service',
      description: 'Support operations - Assist customers with orders, tracking, and general inquiries',
      permissions: [
        // Dashboard
        'dashboard.support',
        // Orders & Tracking
        'tms.orders.view',
        'tms.loads.view',
        'tms.tracking.view',
        // CRM
        'crm.companies.view',
        'crm.contacts.view',
        'crm.activities.view', 'crm.activities.create',
        // Documents
        'documents.view', 'documents.upload',
        // Communication
        'communication.email', 'communication.sms', 'communication.chat',
        // Claims
        'claims.view', 'claims.create',
      ],
      isSystem: true,
    },
    {
      name: 'Read Only',
      description: 'View-only access - Can view most areas but cannot make changes',
      permissions: [
        // Dashboard
        'dashboard.view',
        // View-only across all modules
        'users.view',
        'crm.companies.view', 'crm.contacts.view', 'crm.leads.view', 'crm.opportunities.view',
        'sales.quotes.view', 'sales.proposals.view',
        'tms.orders.view', 'tms.loads.view', 'tms.tracking.view',
        'carriers.view',
        'accounting.invoices.view', 'accounting.payments.view',
        'documents.view',
        'claims.view',
        'reports.operations', 'reports.sales', 'reports.financial',
        'analytics.view',
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

  // Get all roles for creating test users
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin', tenantId: null } });
  const opsManagerRole = await prisma.role.findFirst({ where: { name: 'Operations Manager', tenantId: null } });
  const dispatcherRole = await prisma.role.findFirst({ where: { name: 'Dispatcher', tenantId: null } });
  const salesRole = await prisma.role.findFirst({ where: { name: 'Sales Rep', tenantId: null } });
  const accountingRole = await prisma.role.findFirst({ where: { name: 'Accounting', tenantId: null } });
  const customerServiceRole = await prisma.role.findFirst({ where: { name: 'Customer Service', tenantId: null } });
  const readOnlyRole = await prisma.role.findFirst({ where: { name: 'Read Only', tenantId: null } });

  // Create additional test users
  const testUsers = [
    {
      email: 'john.admin@ultra-tms.local',
      password: 'password123',
      firstName: 'John',
      lastName: 'Anderson',
      roleId: adminRole.id,
      department: 'Management',
    },
    {
      email: 'sarah.ops@ultra-tms.local',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Thompson',
      roleId: opsManagerRole.id,
      department: 'Operations',
    },
    {
      email: 'mike.dispatch@ultra-tms.local',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Roberts',
      roleId: dispatcherRole.id,
      department: 'Operations',
    },
    {
      email: 'lisa.sales@ultra-tms.local',
      password: 'password123',
      firstName: 'Lisa',
      lastName: 'Chen',
      roleId: salesRole.id,
      department: 'Sales',
    },
    {
      email: 'david.sales@ultra-tms.local',
      password: 'password123',
      firstName: 'David',
      lastName: 'Martinez',
      roleId: salesRole.id,
      department: 'Sales',
    },
    {
      email: 'emily.accounting@ultra-tms.local',
      password: 'password123',
      firstName: 'Emily',
      lastName: 'Johnson',
      roleId: accountingRole.id,
      department: 'Accounting',
    },
    {
      email: 'anna.support@ultra-tms.local',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Williams',
      roleId: customerServiceRole.id,
      department: 'Customer Service',
    },
    {
      email: 'james.viewer@ultra-tms.local',
      password: 'password123',
      firstName: 'James',
      lastName: 'Wilson',
      roleId: readOnlyRole.id,
      department: 'Support',
    },
  ];

  const createdUsers = [adminUser];
  
  for (const userData of testUsers) {
    const userPasswordHash = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: userData.email,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        email: userData.email,
        passwordHash: userPasswordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roleId: userData.roleId,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        timezone: 'America/Chicago',
        locale: 'en',
        customFields: {
          department: userData.department,
          isSeeded: true,
        },
      },
    });
    
    createdUsers.push(user);
    console.log(`✅ Created user: ${userData.email} (password: ${userData.password})`);
  }

  // Seed comprehensive demo data
  await seedComprehensiveData(tenant.id, createdUsers);

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📋 Test User Credentials:');
  console.log('   Super Admin: admin@ultra-tms.local / admin123');
  console.log('   Admin: john.admin@ultra-tms.local / password123');
  console.log('   Ops Manager: sarah.ops@ultra-tms.local / password123');
  console.log('   Dispatcher: mike.dispatch@ultra-tms.local / password123');
  console.log('   Sales Rep: lisa.sales@ultra-tms.local / password123');
  console.log('   Sales Rep: david.sales@ultra-tms.local / password123');
  console.log('   Accounting: emily.accounting@ultra-tms.local / password123');
  console.log('   Customer Service: anna.support@ultra-tms.local / password123');
  console.log('   Read Only: james.viewer@ultra-tms.local / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
