/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient() as any;

async function createRabihUser() {
  try {
    // 1. List all tenants
    console.log('\n📋 Checking tenants in database...\n');
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (tenants.length === 0) {
      console.log('❌ No tenants found! Run: pnpm prisma db seed');
      return;
    }

    console.log(`Found ${tenants.length} tenants:\n`);
    tenants.forEach((tenant: any, index: any) => {
      console.log(`${index + 1}. ${tenant.name} (${tenant.slug}) - ${tenant.status}`);
      console.log(`   ID: ${tenant.id}\n`);
    });

    // Use the first active tenant (Acme Logistics)
    const targetTenant = tenants.find((t: any) => t.status === 'ACTIVE') || tenants[0];

    if (!targetTenant) {
      console.log('❌ No active tenant found!');
      return;
    }

    console.log(`\n✅ Using tenant: ${targetTenant.name} (${targetTenant.id})\n`);

    // 2. Get ADMIN role
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'ADMIN',
        isSystem: true,
      },
    });

    if (!adminRole) {
      console.log('❌ ADMIN role not found! Run: pnpm prisma db seed');
      return;
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'rabih@chipatech.com',
      },
    });

    if (existingUser) {
      console.log('⚠️  User rabih@chipatech.com already exists!');
      console.log(`   Tenant: ${existingUser.tenantId}`);
      console.log(`   Status: ${existingUser.status}\n`);

      // Update password
      const passwordHash = await bcrypt.hash('Ba2xw22b.123', 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        },
      });
      console.log('✅ Password updated to: Ba2xw22b.123\n');
    } else {
      // 4. Create new user
      const passwordHash = await bcrypt.hash('Ba2xw22b.123', 10);

      const newUser = await prisma.user.create({
        data: {
          tenantId: targetTenant.id,
          email: 'rabih@chipatech.com',
          passwordHash,
          firstName: 'Rabih',
          lastName: 'Chipatech',
          roleId: adminRole.id,
          status: 'ACTIVE' as any,
          emailVerifiedAt: new Date(),
          timezone: 'America/Chicago',
          locale: 'en',
          externalId: 'RABIH-CHIPATECH-USER',
          sourceSystem: 'MANUAL_CREATE',
        },
      });

      console.log('✅ User created successfully!\n');
      console.log('📧 Email: rabih@chipatech.com');
      console.log('🔑 Password: Ba2xw22b.123');
      console.log(`👤 Role: ADMIN`);
      console.log(`🏢 Tenant: ${targetTenant.name}\n`);
    }

    console.log('🎉 Done! You can now login at http://localhost:3000/login\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRabihUser();
