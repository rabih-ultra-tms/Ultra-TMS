// Mock common dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Global test utilities
(global as any).createMockTenantId = () => 'test-tenant-id';
(global as any).createMockUserId = () => 'test-user-id';
