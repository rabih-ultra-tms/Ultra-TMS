/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

// Configure database connection pooling for tests
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && !databaseUrl.includes('connection_limit=')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  // Increased connection_limit from 1 to 5 to prevent "too many clients" errors
  // pool_timeout prevents hanging on connection pool exhaustion
  process.env.DATABASE_URL = `${databaseUrl}${separator}connection_limit=5&pool_timeout=30`;
}

// Shared Prisma instance for all tests to prevent connection pool exhaustion
let sharedPrisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!sharedPrisma) {
    sharedPrisma = new PrismaClient({
      log: [],
    });
  }
  return sharedPrisma;
}

// Make getPrismaClient globally available in tests
(global as any).getPrismaClient = getPrismaClient;

// Cleanup: disconnect after all tests

afterAll(async () => {
  if (sharedPrisma) {
    await sharedPrisma.$disconnect();
    sharedPrisma = null;
  }
});
