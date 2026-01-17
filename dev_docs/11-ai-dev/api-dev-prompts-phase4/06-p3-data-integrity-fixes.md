# P3: Data Integrity Fixes

## Priority: P3 - LOW (Post-MVP)
## Estimated Time: 0.5 days
## Dependencies: None

---

## Overview

The codebase has inconsistent soft delete patterns. Some services use `deletedAt` timestamp, others use `isDeleted` boolean, and some have neither. This causes data integrity issues when querying.

---

## Current State Analysis

### Services with `deletedAt` pattern (Correct)
- ✅ TMS Core (Loads)
- ✅ CRM (Companies, Contacts)
- ✅ Carrier

### Services with `isDeleted` pattern (Needs Migration)
- ⚠️ Documents
- ⚠️ Contracts

### Services with NO soft delete
- ❌ Commission (hard deletes)
- ❌ Load Board (hard deletes)
- ❌ Integration Hub (hard deletes)

---

## Task 1: Standardize to `deletedAt` Pattern

### Prisma Schema Updates

**File:** `apps/api/prisma/schema.prisma`

Add `deletedAt` field to all relevant models:

```prisma
// Documents module
model Document {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Commission module  
model CommissionRule {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model CommissionPayment {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Load Board module
model LoadPosting {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model LoadBid {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Integration Hub module
model Integration {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Webhook {
  id          String    @id @default(uuid())
  // ... existing fields
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// Contracts module - MIGRATE from isDeleted
model Contract {
  id          String    @id @default(uuid())
  // ... existing fields
  // isDeleted   Boolean   @default(false)  // REMOVE
  deletedAt   DateTime? // ADD THIS
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## Task 2: Create Base Repository with Soft Delete

**File:** `apps/api/src/common/repositories/base.repository.ts`

```typescript
import { PrismaService } from '../../prisma/prisma.service';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Find all non-deleted records
   */
  async findAll(where: any = {}): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  /**
   * Find one non-deleted record
   */
  async findOne(where: any): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  /**
   * Find by ID (non-deleted)
   */
  async findById(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Soft delete a record
   */
  async softDelete(id: string): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id: string): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Hard delete (use sparingly, mainly for tests)
   */
  async hardDelete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }

  /**
   * Find including soft-deleted (for admin/audit)
   */
  async findAllWithDeleted(where: any = {}): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      where,
    });
  }
}
```

---

## Task 3: Update Service Delete Methods

### Commission Service

**File:** `apps/api/src/commission/commission-rules/commission-rules.service.ts`

```typescript
// BEFORE
async remove(id: string): Promise<void> {
  await this.prisma.commissionRule.delete({
    where: { id },
  });
}

// AFTER
async remove(id: string): Promise<CommissionRule> {
  return this.prisma.commissionRule.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

### Load Board Service

**File:** `apps/api/src/load-board/postings/postings.service.ts`

```typescript
// BEFORE
async remove(id: string): Promise<void> {
  await this.prisma.loadPosting.delete({
    where: { id },
  });
}

// AFTER
async remove(id: string): Promise<LoadPosting> {
  return this.prisma.loadPosting.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

### Integration Hub Service

**File:** `apps/api/src/integration-hub/integrations/integrations.service.ts`

```typescript
// BEFORE
async remove(id: string): Promise<void> {
  await this.prisma.integration.delete({
    where: { id },
  });
}

// AFTER
async remove(id: string): Promise<Integration> {
  return this.prisma.integration.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

---

## Task 4: Update All Query Methods

Each service must filter out soft-deleted records:

```typescript
// BEFORE - Returns deleted records
async findAll(tenantId: string): Promise<CommissionRule[]> {
  return this.prisma.commissionRule.findMany({
    where: { tenantId },
  });
}

// AFTER - Excludes deleted records
async findAll(tenantId: string): Promise<CommissionRule[]> {
  return this.prisma.commissionRule.findMany({
    where: { 
      tenantId,
      deletedAt: null,  // ADD THIS
    },
  });
}
```

---

## Task 5: Migrate `isDeleted` to `deletedAt`

### Migration Script

**File:** `apps/api/prisma/migrations/YYYYMMDD_migrate_soft_delete/migration.sql`

```sql
-- Add deletedAt column to tables still using isDeleted
ALTER TABLE "Contract" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Migrate existing soft-deleted records
UPDATE "Contract" 
SET "deletedAt" = "updatedAt" 
WHERE "isDeleted" = true;

-- Drop the isDeleted column (after verification)
-- ALTER TABLE "Contract" DROP COLUMN "isDeleted";
```

### Service Update

```typescript
// BEFORE
async findAll(tenantId: string): Promise<Contract[]> {
  return this.prisma.contract.findMany({
    where: { 
      tenantId,
      isDeleted: false,
    },
  });
}

// AFTER
async findAll(tenantId: string): Promise<Contract[]> {
  return this.prisma.contract.findMany({
    where: { 
      tenantId,
      deletedAt: null,
    },
  });
}
```

---

## Task 6: Add Prisma Middleware for Global Soft Delete

**File:** `apps/api/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    
    // Global soft delete middleware
    this.$use(async (params, next) => {
      // Models that support soft delete
      const softDeleteModels = [
        'Company',
        'Contact',
        'Location',
        'Load',
        'Carrier',
        'Document',
        'CommissionRule',
        'CommissionPayment',
        'LoadPosting',
        'LoadBid',
        'Integration',
        'Webhook',
        'Contract',
      ];

      if (softDeleteModels.includes(params.model)) {
        // Filter out soft-deleted records on find operations
        if (params.action === 'findMany' || params.action === 'findFirst') {
          params.args = params.args || {};
          params.args.where = params.args.where || {};
          
          // Only add filter if not explicitly including deleted
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        }

        // Convert delete to soft delete
        if (params.action === 'delete') {
          params.action = 'update';
          params.args.data = { deletedAt: new Date() };
        }

        // Convert deleteMany to soft delete
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          params.args.data = { deletedAt: new Date() };
        }
      }

      return next(params);
    });
  }
}
```

---

## Completion Checklist

### Schema Updates
- [ ] Add `deletedAt` to Document model
- [ ] Add `deletedAt` to CommissionRule model
- [ ] Add `deletedAt` to CommissionPayment model
- [ ] Add `deletedAt` to LoadPosting model
- [ ] Add `deletedAt` to LoadBid model
- [ ] Add `deletedAt` to Integration model
- [ ] Add `deletedAt` to Webhook model
- [ ] Migrate Contract from `isDeleted` to `deletedAt`

### Service Updates
- [ ] Commission service - soft delete
- [ ] Load Board service - soft delete
- [ ] Integration Hub service - soft delete
- [ ] Documents service - update to `deletedAt`
- [ ] Contracts service - update to `deletedAt`

### Query Updates
- [ ] All findAll methods exclude deleted
- [ ] All findOne methods exclude deleted
- [ ] Prisma middleware implemented

### Testing
- [ ] Verify deleted records don't appear in lists
- [ ] Verify deleted records return 404
- [ ] Verify restore functionality works

---

## Validation Steps

1. Run migration: `pnpm prisma migrate dev`
2. Test each affected endpoint
3. Verify no soft-deleted records appear in GET requests
4. Verify DELETE endpoints soft delete (not hard delete)
5. Check audit logs capture delete operations
