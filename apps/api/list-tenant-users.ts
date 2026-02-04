import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const tenantId = '470990ec-ccdf-4639-a94e-398c0f7657e8'; // Acme Logistics
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      console.log('❌ Tenant not found');
      return;
    }
    
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
      orderBy: {
        email: 'asc',
      },
    });

    console.log(`\n📋 Users for Tenant: ${tenant.name} (${tenantId})\n`);
    console.log(`Total Users: ${users.length}\n`);
    console.log('─'.repeat(100));
    console.log(
      'Email'.padEnd(35) + 
      'Name'.padEnd(30) + 
      'Status'.padEnd(12) + 
      'Failed Attempts'.padEnd(16) + 
      'Locked Until'
    );
    console.log('─'.repeat(100));

    users.forEach(user => {
      const name = `${user.firstName} ${user.lastName}`.substring(0, 28);
      const lockedUntil = user.lockedUntil ? user.lockedUntil.toLocaleString() : 'Never';
      console.log(
        user.email.padEnd(35) +
        name.padEnd(30) +
        user.status.padEnd(12) +
        user.failedLoginAttempts.toString().padEnd(16) +
        lockedUntil
      );
    });

    console.log('─'.repeat(100));
    console.log('\n✅ Note: All users have the default password: "password123" (from seed)\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
