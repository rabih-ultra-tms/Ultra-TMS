// Deterministic test data for E2E tests
// These IDs and values should match the E2E seed data

export const TEST_TENANT_ID = 'e2e-tenant-001';

export const TEST_USERS = {
  admin: {
    id: 'e2e-user-admin',
    email: 'admin@ultratms.test',
    firstName: 'E2E',
    lastName: 'Admin',
    role: 'ADMIN',
  },
  dispatcher: {
    id: 'e2e-user-dispatcher',
    email: 'dispatcher@ultratms.test',
    firstName: 'E2E',
    lastName: 'Dispatcher',
    role: 'DISPATCHER',
  },
  sales: {
    id: 'e2e-user-sales',
    email: 'sales@ultratms.test',
    firstName: 'E2E',
    lastName: 'Sales',
    role: 'SALES_REP',
  },
} as const;

export const TEST_COMPANY = {
  id: 'e2e-company-001',
  name: 'E2E Test Shipper Inc.',
  email: 'shipper@e2etest.com',
  phone: '555-0100',
};

export const TEST_CARRIER = {
  id: 'e2e-carrier-001',
  name: 'E2E Test Carrier LLC',
  mcNumber: 'MC-999001',
  dotNumber: 'DOT-999001',
};

export const TEST_CONTACT = {
  id: 'e2e-contact-001',
  firstName: 'John',
  lastName: 'E2EContact',
  email: 'john.contact@e2etest.com',
  phone: '555-0101',
};
