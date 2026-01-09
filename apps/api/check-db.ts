import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const users = await prisma.user.findMany({
    select: {
      email: true,
      status: true,
      firstName: true,
      lastName: true,
    },
  });
  
  console.log('\nUsers in database:');
  if (users.length === 0) {
    console.log('No users found! Database may not be seeded.');
  } else {
    users.forEach((user) => {
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - ${user.status}`);
    });
  }
  
  const tenants = await prisma.tenant.findMany({
    select: { name: true, slug: true },
  });
  
  console.log('\nTenants in database:');
  tenants.forEach((t) => {
    console.log(`  - ${t.name} (${t.slug})`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
