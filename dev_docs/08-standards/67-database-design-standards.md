# 63 - Database Design Standards

**Prisma schema patterns and migration-first architecture for the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Before ANY Schema Change

1. Read the existing schema thoroughly
2. Check if the table already exists
3. Follow naming conventions exactly
4. Include ALL required fields (audit, migration, soft-delete)
5. Run `npx prisma format` before committing
6. Update the seed script for new tables

---

## Migration-First Architecture

This platform uses migration-first architecture as a competitive differentiator. Every table MUST include these fields to support data migration from external systems:

```prisma
model AnyEntity {
  // Standard fields...

  // REQUIRED: Migration support fields
  externalId    String?   // ID from source system
  sourceSystem  String?   // e.g., "MCLEODT", "HUBSPOT", "QUICKBOOKS"
  customFields  Json?     // Flexible field storage for migration

  // REQUIRED: Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // Soft delete
  createdById   String?
  updatedById   String?

  // REQUIRED: Multi-tenancy
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([externalId, sourceSystem])
}
```

---

## Naming Conventions

### Model Names

| Rule        | Good                  | Bad                    |
| ----------- | --------------------- | ---------------------- |
| PascalCase  | `Carrier`, `LoadStop` | `carrier`, `load_stop` |
| Singular    | `Carrier`             | `Carriers`             |
| Descriptive | `CarrierEquipment`    | `CE`, `CarrierEq`      |

### Field Names

| Rule                             | Good                       | Bad                        |
| -------------------------------- | -------------------------- | -------------------------- |
| camelCase                        | `firstName`, `mcNumber`    | `first_name`, `MCNumber`   |
| Foreign keys end with `Id`       | `carrierId`, `tenantId`    | `carrier`, `tenant_fk`     |
| Booleans start with `is/has/can` | `isActive`, `hasInsurance` | `active`, `insured`        |
| Dates end with `At`              | `createdAt`, `scheduledAt` | `created`, `schedule_date` |

### Enum Values

| Rule                 | Good               | Bad                                   |
| -------------------- | ------------------ | ------------------------------------- |
| SCREAMING_SNAKE_CASE | `PENDING_APPROVAL` | `PendingApproval`, `pending-approval` |
| Descriptive          | `EN_ROUTE_PICKUP`  | `ERP`, `ENROUTE`                      |

---

## Standard Patterns

### Base Entity Pattern (REQUIRED for all models)

```prisma
// Every model MUST include these fields

model ExampleEntity {
  id            String    @id @default(cuid())

  // Business fields go here...

  // REQUIRED: Migration support
  externalId    String?
  sourceSystem  String?
  customFields  Json?

  // REQUIRED: Audit trail
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  createdById   String?
  updatedById   String?

  // REQUIRED: Multi-tenancy
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id])

  // REQUIRED: Indexes
  @@index([tenantId])
  @@index([externalId, sourceSystem])
  @@index([createdAt])
}
```

### User & Auth Pattern

```prisma
model User {
  id              String      @id @default(cuid())
  email           String
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  avatarUrl       String?

  // Status
  status          UserStatus  @default(PENDING)
  emailVerified   Boolean     @default(false)
  lastLoginAt     DateTime?

  // Role assignment
  roles           UserRole[]

  // Profile links (one user can be multiple profiles)
  dispatcherProfile   Dispatcher?
  driverProfile       Driver?

  // Migration support
  externalId      String?
  sourceSystem    String?
  customFields    Json?

  // Audit
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?

  // Multi-tenancy
  tenantId        String
  tenant          Tenant      @relation(fields: [tenantId], references: [id])

  @@unique([email, tenantId])
  @@index([tenantId])
  @@index([email])
  @@index([status])
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED
  LOCKED
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
}

model Role {
  id          String       @id @default(cuid())
  name        String       // ADMIN, DISPATCH, OPERATIONS, etc.
  displayName String
  description String?
  permissions Permission[]
  users       UserRole[]

  tenantId    String
  tenant      Tenant       @relation(fields: [tenantId], references: [id])

  @@unique([name, tenantId])
}
```

### Carrier Pattern

```prisma
model Carrier {
  id              String          @id @default(cuid())

  // Identity
  name            String
  legalName       String?
  dba             String?
  mcNumber        String
  dotNumber       String
  scac            String?

  // Classification
  type            CarrierType     @default(TRUCKLOAD)
  status          CarrierStatus   @default(PENDING)

  // Contact
  email           String?
  phone           String?
  fax             String?
  website         String?

  // Compliance
  authorityStatus AuthorityStatus @default(UNKNOWN)
  insuranceStatus InsuranceStatus @default(UNKNOWN)
  safetyRating    SafetyRating?
  csaScore        Int?

  // Preferences
  preferredLanes  Json?           // Array of lane preferences
  equipmentTypes  Json?           // Array of equipment types

  // Relations
  address         Address?        @relation(fields: [addressId], references: [id])
  addressId       String?
  contacts        CarrierContact[]
  equipment       CarrierEquipment[]
  insurance       CarrierInsurance[]
  loads           Load[]

  // Migration support
  externalId      String?
  sourceSystem    String?
  customFields    Json?

  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  deletedAt       DateTime?
  createdById     String?
  updatedById     String?

  // Multi-tenancy
  tenantId        String
  tenant          Tenant          @relation(fields: [tenantId], references: [id])

  @@unique([mcNumber, tenantId])
  @@unique([dotNumber, tenantId])
  @@index([tenantId])
  @@index([status])
  @@index([mcNumber])
  @@index([dotNumber])
  @@index([externalId, sourceSystem])
}

enum CarrierType {
  TRUCKLOAD
  LTL
  INTERMODAL
  DRAYAGE
  EXPEDITED
  FLATBED
  REEFER
  TANKER
  OWNER_OPERATOR
}

enum CarrierStatus {
  ACTIVE
  INACTIVE
  PENDING
  SUSPENDED
  BLACKLISTED
  DO_NOT_USE
}
```

### Load/Order Pattern

```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        // Auto-generated, human-readable

  // Customer
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  customerRefNumber String?

  // Status
  status          OrderStatus   @default(DRAFT)

  // Dates
  orderDate       DateTime      @default(now())
  requiredDate    DateTime?

  // Financials
  totalCharges    Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")

  // Relations
  loads           Load[]
  items           OrderItem[]
  documents       Document[]

  // Migration support
  externalId      String?
  sourceSystem    String?
  customFields    Json?

  // Audit
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  createdById     String?

  // Multi-tenancy
  tenantId        String
  tenant          Tenant        @relation(fields: [tenantId], references: [id])

  @@unique([orderNumber, tenantId])
  @@index([tenantId])
  @@index([customerId])
  @@index([status])
  @@index([orderDate])
}

model Load {
  id              String        @id @default(cuid())
  loadNumber      String        // Auto-generated

  // Parent order
  orderId         String?
  order           Order?        @relation(fields: [orderId], references: [id])

  // Assignment
  carrierId       String?
  carrier         Carrier?      @relation(fields: [carrierId], references: [id])
  driverId        String?
  driver          Driver?       @relation(fields: [driverId], references: [id])

  // Status
  status          LoadStatus    @default(PENDING)

  // Stops
  stops           LoadStop[]

  // Equipment
  equipmentType   EquipmentType?
  trailerNumber   String?

  // Financials
  carrierRate     Decimal?      @db.Decimal(10, 2)
  customerRate    Decimal?      @db.Decimal(10, 2)
  margin          Decimal?      @db.Decimal(10, 2)

  // Tracking
  currentLocation Json?         // { lat, lng, timestamp }
  eta             DateTime?

  // Migration support
  externalId      String?
  sourceSystem    String?
  customFields    Json?

  // Audit
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?
  createdById     String?
  dispatchedAt    DateTime?
  dispatchedById  String?

  // Multi-tenancy
  tenantId        String
  tenant          Tenant        @relation(fields: [tenantId], references: [id])

  @@unique([loadNumber, tenantId])
  @@index([tenantId])
  @@index([status])
  @@index([carrierId])
  @@index([orderId])
}

enum LoadStatus {
  PENDING
  AVAILABLE
  COVERED
  DISPATCHED
  EN_ROUTE_PICKUP
  AT_PICKUP
  LOADED
  EN_ROUTE_DELIVERY
  AT_DELIVERY
  DELIVERED
  COMPLETED
  CANCELLED
  ON_HOLD
  TONU
}

model LoadStop {
  id              String        @id @default(cuid())

  loadId          String
  load            Load          @relation(fields: [loadId], references: [id])

  // Sequence
  stopNumber      Int
  type            StopType

  // Location
  facilityId      String?
  facility        Facility?     @relation(fields: [facilityId], references: [id])
  address         Json?         // Inline address if no facility

  // Scheduling
  scheduledDate   DateTime?
  scheduledTime   String?       // "09:00-12:00"
  appointmentNumber String?

  // Actual times
  arrivedAt       DateTime?
  departedAt      DateTime?

  // Status
  status          StopStatus    @default(PENDING)

  // Notes
  instructions    String?
  notes           String?

  // Migration
  externalId      String?
  customFields    Json?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([loadId])
  @@index([facilityId])
}

enum StopType {
  PICKUP
  DELIVERY
  STOP
}

enum StopStatus {
  PENDING
  EN_ROUTE
  ARRIVED
  LOADING
  UNLOADING
  DEPARTED
  COMPLETED
  SKIPPED
}
```

### Address Pattern

```prisma
model Address {
  id          String    @id @default(cuid())

  street1     String
  street2     String?
  city        String
  state       String
  zipCode     String
  country     String    @default("US")

  // Geocoding
  latitude    Float?
  longitude   Float?
  geocoded    Boolean   @default(false)
  geocodedAt  DateTime?

  // Validation
  validated   Boolean   @default(false)
  validatedAt DateTime?

  // Relations
  carriers    Carrier[]
  facilities  Facility[]
  customers   Customer[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([city, state])
  @@index([zipCode])
}
```

### Audit Log Pattern

```prisma
model AuditLog {
  id          String      @id @default(cuid())

  // Who
  userId      String?
  userName    String?
  userEmail   String?

  // What
  action      AuditAction
  entityType  String      // "Carrier", "Load", "User"
  entityId    String

  // Changes
  oldValues   Json?
  newValues   Json?

  // Context
  ipAddress   String?
  userAgent   String?
  requestId   String?

  // When
  createdAt   DateTime    @default(now())

  // Multi-tenancy
  tenantId    String

  @@index([entityType, entityId])
  @@index([userId])
  @@index([tenantId])
  @@index([createdAt])
  @@index([action])
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  VIEW
  EXPORT
  LOGIN
  LOGOUT
  FAILED_LOGIN
  PASSWORD_CHANGE
  PERMISSION_CHANGE
}
```

---

## Prisma Best Practices

### 1. Always Generate Types After Schema Changes

```bash
# After ANY schema change
npx prisma format        # Format schema
npx prisma validate      # Validate schema
npx prisma generate      # Regenerate client
```

### 2. Use Transactions for Related Operations

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: { email, firstName, lastName, tenantId },
  });

  // Create driver profile
  const driver = await tx.driver.create({
    data: {
      userId: user.id,
      licenseNumber,
      tenantId,
    },
  });

  return { user, driver };
});
```

### 3. Use Select for Performance

```typescript
// âŒ BAD - Fetches all fields including passwordHash
const users = await prisma.user.findMany();

// âœ… GOOD - Only fetches needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    status: true,
  },
});
```

### 4. Always Filter by Tenant

```typescript
// âŒ BAD - Returns all tenants' data
const carriers = await prisma.carrier.findMany();

// âœ… GOOD - Filter by tenant AND exclude soft-deleted
const carriers = await prisma.carrier.findMany({
  where: {
    tenantId,
    deletedAt: null,
  },
});
```

### 5. Include Related Data Explicitly

```typescript
// âŒ BAD - carrier.address is undefined
const carrier = await prisma.carrier.findUnique({
  where: { id },
});

// âœ… GOOD - Include what frontend needs
const carrier = await prisma.carrier.findUnique({
  where: { id },
  include: {
    address: true,
    contacts: true,
    insurance: {
      where: { expiresAt: { gte: new Date() } },
    },
  },
});
```

---

## Migration Strategy

### Development Workflow

```bash
# During development - quick sync (may lose data)
npx prisma db push

# When ready to commit - create migration
npx prisma migrate dev --name add_carrier_insurance_fields

# Production deployment
npx prisma migrate deploy
```

### Migration Naming

```bash
# âœ… GOOD - Descriptive names
npx prisma migrate dev --name add_carrier_insurance_tracking
npx prisma migrate dev --name create_load_stops_table
npx prisma migrate dev --name add_user_mfa_fields

# âŒ BAD - Vague names
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### Breaking Changes (Multi-Step)

```typescript
// Step 1: Add new column as nullable
model User {
  email    String  @unique
  newEmail String? // New nullable column
}

// Step 2: Run data migration script
const users = await prisma.user.findMany();
for (const user of users) {
  await prisma.user.update({
    where: { id: user.id },
    data: { newEmail: transformEmail(user.email) },
  });
}

// Step 3: Make required and drop old
model User {
  newEmail String @unique @map("email")
}
```

---

## Seed Script Requirements

### Minimum Data Requirements

```typescript
// prisma/seed.ts

const SEED_REQUIREMENTS = {
  users: {
    min: 20,
    perRole: {
      SUPER_ADMIN: 1,
      ADMIN: 2,
      DISPATCH: 3,
      OPERATIONS: 2,
      SALES: 3,
      ACCOUNTING: 2,
      CARRIER: 5,
      CUSTOMER: 5,
    },
  },
  carriers: { min: 30 },
  customers: { min: 20 },
  facilities: { min: 15 },
  loads: {
    min: 50,
    perStatus: true, // At least one per status
  },
  orders: { min: 30 },
};
```

### Seed Script Template

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('ðŸŒ± Seeding database...');

  // Create in dependency order
  const tenant = await seedTenant();
  const roles = await seedRoles(tenant.id);
  const users = await seedUsers(tenant.id, roles);
  const carriers = await seedCarriers(tenant.id, users);
  const customers = await seedCustomers(tenant.id);
  const facilities = await seedFacilities(tenant.id);
  const orders = await seedOrders(tenant.id, customers);
  const loads = await seedLoads(tenant.id, orders, carriers);

  console.log('âœ… Seeding complete!');
}

async function seedTenant() {
  return prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'ACTIVE',
    },
  });
}

async function seedUsers(tenantId: string, roles: Role[]) {
  const password = await hash('Password123!', 12);

  const testUsers = [
    {
      email: 'admin@demo.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
    {
      email: 'dispatch@demo.com',
      firstName: 'Dispatch',
      lastName: 'User',
      role: 'DISPATCH',
    },
    {
      email: 'ops@demo.com',
      firstName: 'Operations',
      lastName: 'User',
      role: 'OPERATIONS',
    },
    // ... more users
  ];

  for (const userData of testUsers) {
    await prisma.user.upsert({
      where: { email_tenantId: { email: userData.email, tenantId } },
      update: {},
      create: {
        ...userData,
        passwordHash: password,
        status: 'ACTIVE',
        tenantId,
        roles: {
          create: {
            roleId: roles.find((r) => r.name === userData.role)!.id,
          },
        },
      },
    });
  }
}

// ... more seed functions

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Database Checklist

### Before ANY Schema Change

- [ ] Field names follow conventions (camelCase)
- [ ] All relations defined on both sides
- [ ] Appropriate indexes added
- [ ] Enums used for fixed values
- [ ] Migration fields included (externalId, sourceSystem, customFields)
- [ ] Audit fields included (createdAt, updatedAt, deletedAt, createdById)
- [ ] Multi-tenancy field included (tenantId)
- [ ] Migration has descriptive name

### After Schema Change

- [ ] Run `npx prisma format`
- [ ] Run `npx prisma validate`
- [ ] Run `npx prisma generate`
- [ ] Update seed script for new tables/fields
- [ ] Update TypeScript interfaces in shared-types
- [ ] Update API DTOs
- [ ] Update frontend components
- [ ] Test with fresh database (`npx prisma migrate reset`)

---

## Navigation

- **Previous:** [API Design Standards](./62-api-design-standards.md)
- **Next:** [Frontend Architecture Standards](./64-frontend-architecture-standards.md)
