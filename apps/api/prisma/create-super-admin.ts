import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'rabih@chipatech.com';
  const password = 'ChipaTech@2026!';
  const passwordHash = await bcrypt.hash(password, 10);

  // Get the SUPER_ADMIN role
  const superAdminRole = await prisma.role.findFirst({
    where: {
      name: 'SUPER_ADMIN',
      isSystem: true,
    },
  });

  if (!superAdminRole) {
    console.error('❌ SUPER_ADMIN role not found. Please run the seed first.');
    process.exit(1);
  }

  // Use first available tenant
  const tenantId = 'cmkskmvj50000tyl89iq02id3';
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant) {
    console.error('❌ Tenant not found:', tenantId);
    process.exit(1);
  }

  // Delete existing user with this email (to handle tenant change)
  await prisma.user.deleteMany({ where: { email } });

  // Create the super admin user
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: email,
      passwordHash,
      firstName: 'Rabih',
      lastName: 'Admin',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      timezone: 'America/Chicago',
      locale: 'en',
    },
  });

  console.log('\n✅ Super Admin account created successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     SUPER_ADMIN`);
  console.log(`   Tenant:   ${tenant.name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
