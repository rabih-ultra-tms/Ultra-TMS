import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listTenants() {
  try {
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            User: true,
          },
        },
      },
    });

    console.log(`\n📋 All Tenants:\n`);
    console.log('─'.repeat(80));
    console.log('Tenant ID'.padEnd(40) + 'Name'.padEnd(30) + 'Users');
    console.log('─'.repeat(80));

    tenants.forEach(tenant => {
      console.log(
        tenant.id.padEnd(40) +
        tenant.name.padEnd(30) +
        tenant._count.User
      );
    });

    console.log('─'.repeat(80));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listTenants();
