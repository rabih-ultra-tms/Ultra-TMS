# P3: Database Performance Indexes

## Priority: P3 - LOW (Post-MVP)
## Estimated Time: 1 day
## Dependencies: None

---

## Overview

Add database indexes to improve query performance for frequently accessed data patterns. This is especially important for:
- Multi-tenant queries (tenantId)
- Status filters
- Date range queries
- Foreign key relationships
- Search operations

---

## Current State

Most tables lack proper indexes beyond primary keys and foreign keys. This will cause performance issues as data grows.

---

## Task 1: Core Entity Indexes

### Prisma Schema Updates

**File:** `apps/api/prisma/schema.prisma`

```prisma
// ========================
// CRM Module
// ========================

model Company {
  id          String      @id @default(uuid())
  tenantId    String
  name        String
  type        CompanyType
  status      Status      @default(ACTIVE)
  email       String?
  mcNumber    String?
  dotNumber   String?
  deletedAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Indexes
  @@index([tenantId])                           // Multi-tenant queries
  @@index([tenantId, status])                   // Active companies per tenant
  @@index([tenantId, type])                     // Companies by type
  @@index([tenantId, deletedAt])                // Soft delete filter
  @@index([mcNumber])                           // MC# lookup
  @@index([dotNumber])                          // DOT# lookup
  @@index([tenantId, name])                     // Name search
  @@index([createdAt])                          // Date range queries
}

model Contact {
  id          String    @id @default(uuid())
  tenantId    String
  companyId   String
  firstName   String
  lastName    String
  email       String?
  isPrimary   Boolean   @default(false)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([companyId])                          // Contacts per company
  @@index([tenantId, email])                    // Email lookup
  @@index([companyId, isPrimary])               // Primary contact lookup
  @@index([tenantId, deletedAt])
}

model Location {
  id          String    @id @default(uuid())
  tenantId    String
  companyId   String?
  name        String
  city        String
  state       String
  zip         String
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([companyId])
  @@index([tenantId, city, state])              // Geographic search
  @@index([tenantId, zip])                      // ZIP code lookup
  @@index([tenantId, deletedAt])
}

// ========================
// TMS Core Module
// ========================

model Load {
  id              String      @id @default(uuid())
  tenantId        String
  loadNumber      String      @unique
  status          LoadStatus
  customerId      String
  carrierId       String?
  dispatcherId    String?
  originId        String
  destinationId   String
  pickupDate      DateTime
  deliveryDate    DateTime?
  totalRate       Decimal?
  deletedAt       DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, status])                   // Status dashboard
  @@index([tenantId, customerId])               // Customer loads
  @@index([tenantId, carrierId])                // Carrier loads
  @@index([tenantId, dispatcherId])             // Dispatcher workload
  @@index([tenantId, pickupDate])               // Date range queries
  @@index([tenantId, deliveryDate])             // Delivery tracking
  @@index([loadNumber])                         // Load number lookup
  @@index([tenantId, status, pickupDate])       // Combined filter
  @@index([tenantId, deletedAt])
  @@index([createdAt])
}

// ========================
// Carrier Module
// ========================

model Carrier {
  id          String        @id @default(uuid())
  tenantId    String
  name        String
  mcNumber    String?
  dotNumber   String?
  status      CarrierStatus @default(PENDING)
  rating      Int?
  deletedAt   DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, status])                   // Active carriers
  @@index([tenantId, rating])                   // Carrier ranking
  @@index([mcNumber])                           // MC# lookup (unique)
  @@index([dotNumber])                          // DOT# lookup
  @@index([tenantId, deletedAt])
}

model Driver {
  id          String    @id @default(uuid())
  tenantId    String
  carrierId   String
  firstName   String
  lastName    String
  licenseNo   String?
  status      Status    @default(ACTIVE)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([carrierId])                          // Drivers per carrier
  @@index([tenantId, status])                   // Active drivers
  @@index([licenseNo])                          // License lookup
  @@index([tenantId, deletedAt])
}

// ========================
// Accounting Module
// ========================

model Invoice {
  id            String        @id @default(uuid())
  tenantId      String
  invoiceNumber String        @unique
  customerId    String
  loadId        String?
  status        InvoiceStatus
  amount        Decimal
  dueDate       DateTime
  sentAt        DateTime?
  paidAt        DateTime?
  deletedAt     DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, status])                   // Status filter
  @@index([tenantId, customerId])               // Customer invoices
  @@index([tenantId, dueDate])                  // Due date tracking
  @@index([tenantId, status, dueDate])          // Overdue query
  @@index([loadId])                             // Invoice per load
  @@index([invoiceNumber])                      // Invoice lookup
  @@index([tenantId, deletedAt])
  @@index([createdAt])
}

model Payment {
  id          String        @id @default(uuid())
  tenantId    String
  invoiceId   String
  amount      Decimal
  method      PaymentMethod
  reference   String?
  paidAt      DateTime
  deletedAt   DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([invoiceId])                          // Payments per invoice
  @@index([tenantId, paidAt])                   // Date range queries
  @@index([tenantId, method])                   // Payment method analysis
  @@index([reference])                          // Reference lookup
  @@index([tenantId, deletedAt])
}

// ========================
// Load Board Module
// ========================

model LoadPosting {
  id            String          @id @default(uuid())
  tenantId      String
  loadId        String
  status        PostingStatus
  targetRate    Decimal?
  expiresAt     DateTime
  originCity    String
  originState   String
  originLat     Float?
  originLng     Float?
  destCity      String
  destState     String
  destLat       Float?
  destLng       Float?
  deletedAt     DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([status])                             // Available postings
  @@index([status, expiresAt])                  // Active, non-expired
  @@index([originState, destState])             // Lane search
  @@index([originCity, originState])            // Origin search
  @@index([destCity, destState])                // Destination search
  @@index([tenantId, deletedAt])
  @@index([createdAt])
  
  // Geospatial index (if using PostGIS extension)
  // @@index([originLat, originLng])
  // @@index([destLat, destLng])
}

model LoadBid {
  id          String    @id @default(uuid())
  tenantId    String
  postingId   String
  carrierId   String
  amount      Decimal
  status      BidStatus
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([postingId])                          // Bids per posting
  @@index([carrierId])                          // Carrier bid history
  @@index([postingId, status])                  // Active bids
  @@index([tenantId, deletedAt])
}

// ========================
// Documents Module
// ========================

model Document {
  id          String       @id @default(uuid())
  tenantId    String
  loadId      String?
  carrierId   String?
  type        DocumentType
  fileName    String
  fileUrl     String
  deletedAt   DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([loadId])                             // Documents per load
  @@index([carrierId])                          // Documents per carrier
  @@index([tenantId, type])                     // Document type filter
  @@index([tenantId, deletedAt])
  @@index([createdAt])
}

// ========================
// Commission Module
// ========================

model CommissionRule {
  id          String    @id @default(uuid())
  tenantId    String
  agentId     String?
  name        String
  type        RuleType
  rate        Decimal
  isActive    Boolean   @default(true)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, isActive])                 // Active rules
  @@index([agentId])                            // Agent rules
  @@index([tenantId, type])                     // Rule type filter
  @@index([tenantId, deletedAt])
}

model CommissionPayment {
  id          String            @id @default(uuid())
  tenantId    String
  agentId     String
  loadId      String?
  amount      Decimal
  status      CommissionStatus
  paidAt      DateTime?
  deletedAt   DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([agentId])                            // Agent payments
  @@index([tenantId, status])                   // Status filter
  @@index([tenantId, paidAt])                   // Date range
  @@index([loadId])                             // Commission per load
  @@index([tenantId, deletedAt])
}

// ========================
// Integration Hub Module
// ========================

model Integration {
  id          String            @id @default(uuid())
  tenantId    String
  name        String
  type        IntegrationType
  status      IntegrationStatus
  deletedAt   DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, status])                   // Active integrations
  @@index([tenantId, type])                     // Integration type
  @@index([tenantId, deletedAt])
}

model Webhook {
  id          String    @id @default(uuid())
  tenantId    String
  url         String
  events      String[]
  isActive    Boolean   @default(true)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indexes
  @@index([tenantId])
  @@index([tenantId, isActive])                 // Active webhooks
  @@index([tenantId, deletedAt])
}

// ========================
// Analytics / Audit
// ========================

model AuditLog {
  id          String    @id @default(uuid())
  tenantId    String
  userId      String?
  action      String
  entity      String
  entityId    String?
  changes     Json?
  ipAddress   String?
  createdAt   DateTime  @default(now())

  // Indexes (critical for audit queries)
  @@index([tenantId])
  @@index([tenantId, entity])                   // Entity audit history
  @@index([tenantId, userId])                   // User activity
  @@index([tenantId, action])                   // Action type
  @@index([entityId])                           // Entity-specific audit
  @@index([tenantId, createdAt])                // Date range queries
  @@index([createdAt])                          // Global date queries
}
```

---

## Task 2: Create Migration

```bash
# Generate migration
pnpm prisma migrate dev --name add_performance_indexes

# For production
pnpm prisma migrate deploy
```

---

## Task 3: Composite Indexes for Common Query Patterns

Based on actual query patterns, add these composite indexes:

```prisma
// For load dashboard: "Get all in-transit loads for dispatcher this week"
model Load {
  @@index([tenantId, dispatcherId, status, pickupDate])
}

// For accounting: "Get unpaid invoices past due"
model Invoice {
  @@index([tenantId, status, dueDate])
}

// For load board: "Find available loads in a state"
model LoadPosting {
  @@index([status, originState, expiresAt])
}

// For carrier portal: "My pending bids"
model LoadBid {
  @@index([carrierId, status])
}
```

---

## Task 4: Full-Text Search Indexes (PostgreSQL)

For search functionality, add full-text indexes:

```sql
-- Create text search index for companies
CREATE INDEX company_search_idx ON "Company" 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(email, '')));

-- Create text search index for loads
CREATE INDEX load_search_idx ON "Load" 
USING GIN (to_tsvector('english', "loadNumber"));

-- Create text search index for carriers
CREATE INDEX carrier_search_idx ON "Carrier" 
USING GIN (to_tsvector('english', name || ' ' || COALESCE("mcNumber", '') || ' ' || COALESCE("dotNumber", '')));
```

---

## Task 5: Partial Indexes for Active Records

For frequently queried active records:

```sql
-- Only index non-deleted companies
CREATE INDEX company_active_idx ON "Company" (tenantId, name) 
WHERE "deletedAt" IS NULL;

-- Only index active loads
CREATE INDEX load_active_status_idx ON "Load" (tenantId, status, "pickupDate") 
WHERE "deletedAt" IS NULL;

-- Only index active postings
CREATE INDEX posting_available_idx ON "LoadPosting" (status, "expiresAt") 
WHERE "deletedAt" IS NULL AND status = 'AVAILABLE';
```

---

## Task 6: Index Maintenance

### Add to scheduled jobs:

```sql
-- Weekly index maintenance
REINDEX INDEX CONCURRENTLY company_search_idx;
REINDEX INDEX CONCURRENTLY load_search_idx;

-- Analyze tables for query planner
ANALYZE "Company";
ANALYZE "Load";
ANALYZE "Invoice";
ANALYZE "LoadPosting";
```

---

## Verification Steps

### 1. Check Index Usage

```sql
-- See if indexes are being used
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 2. Analyze Query Performance

```sql
-- Before: Check query plan without indexes
EXPLAIN ANALYZE
SELECT * FROM "Load" 
WHERE "tenantId" = 'xxx' AND status = 'IN_TRANSIT'
ORDER BY "pickupDate";

-- After: Verify index is used
EXPLAIN ANALYZE
SELECT * FROM "Load" 
WHERE "tenantId" = 'xxx' AND status = 'IN_TRANSIT'
ORDER BY "pickupDate";
```

### 3. Check Index Size

```sql
SELECT
  pg_size_pretty(pg_total_relation_size('"Load"')) as total_size,
  pg_size_pretty(pg_indexes_size('"Load"')) as index_size;
```

---

## Completion Checklist

### Primary Indexes
- [ ] Company indexes (7)
- [ ] Contact indexes (5)
- [ ] Location indexes (5)
- [ ] Load indexes (10)
- [ ] Carrier indexes (5)
- [ ] Driver indexes (5)
- [ ] Invoice indexes (8)
- [ ] Payment indexes (6)
- [ ] LoadPosting indexes (8)
- [ ] LoadBid indexes (5)
- [ ] Document indexes (6)
- [ ] CommissionRule indexes (5)
- [ ] CommissionPayment indexes (6)
- [ ] Integration indexes (4)
- [ ] Webhook indexes (3)
- [ ] AuditLog indexes (7)

### Advanced Indexes
- [ ] Full-text search indexes
- [ ] Partial indexes for active records
- [ ] Composite indexes for common queries

### Maintenance
- [ ] Index maintenance scheduled
- [ ] Query performance verified

---

## Expected Performance Improvement

| Query Type | Before | After |
|------------|--------|-------|
| Tenant filter | Table scan | Index seek |
| Status dashboard | ~500ms | ~10ms |
| Date range | ~1s | ~50ms |
| Load number lookup | ~100ms | ~1ms |
| Full-text search | N/A | ~20ms |
