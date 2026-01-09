/* eslint-disable @typescript-eslint/no-explicit-any, no-undef */
import { PrismaClient } from '@prisma/client';

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
      settings: {
        timezone: 'UTC',
        language: 'en',
      },
    },
  });

  console.log(`✅ Created tenant: ${tenant.name} (${tenant.slug})`);

  // Create admin user
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
      passwordHash: 'hashed_password_placeholder', // In production, use bcrypt
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      custom_fields: {
        department: 'Management',
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);

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
