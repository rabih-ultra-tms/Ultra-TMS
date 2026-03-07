# Migration Playbook

> Step-by-step guide for Prisma schema changes and database migrations.

---

## When to Use This Playbook

- Adding a new field to an existing model
- Adding a new model
- Changing field types or constraints
- Adding indexes or unique constraints
- Adding soft delete to existing models (QS-002)

## Step 1: Modify the Schema

Edit `apps/api/prisma/schema.prisma`:

```prisma
model MyModel {
  id        String   @id @default(uuid())
  // ... existing fields ...
  newField  String?  @db.VarChar(255)  // Add new field
  deletedAt DateTime? // Add soft delete
  // ... standard fields ...
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
  @@index([deletedAt])  // Index for soft delete queries
}
```

### Mandatory Fields on Every Entity

```prisma
tenantId      String
external_id   String?    // Migration source ID
custom_fields Json?      // Custom attributes
createdAt     DateTime   @default(now())
updatedAt     DateTime   @updatedAt
deletedAt     DateTime?  // Soft delete
```

## Step 2: Generate Migration

```bash
# From project root
pnpm --filter api prisma:migrate --name describe_change_here

# Examples:
pnpm --filter api prisma:migrate --name add_soft_delete_to_invoice
pnpm --filter api prisma:migrate --name add_performance_score_to_carrier
```

This creates a migration file in `apps/api/prisma/migrations/`.

## Step 3: Review the Generated SQL

Open the new migration file and verify:
- No data loss (ALTER TABLE ADD COLUMN, not DROP)
- Default values for non-nullable new fields
- Indexes where needed

## Step 4: Regenerate Prisma Client

```bash
pnpm --filter api prisma:generate
```

This updates the TypeScript types for the Prisma client.

## Step 5: Update DTOs

If the schema change affects API endpoints, update the DTOs:

```typescript
// apps/api/src/modules/{service}/dto/create-{entity}.dto.ts
export class CreateEntityDto {
  @IsString()
  @IsOptional()
  newField?: string;
}

// apps/api/src/modules/{service}/dto/update-{entity}.dto.ts
export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

## Step 6: Update Service Layer

Add the new field to queries and mutations:

```typescript
// Always include tenantId and deletedAt filter
async findAll(tenantId: string, params: ListParams) {
  return this.prisma.entity.findMany({
    where: { tenantId, deletedAt: null, ...filters },
    // ...
  });
}
```

## Step 7: Test the Migration

```bash
# Run migrations on dev database
pnpm --filter api prisma:migrate

# Verify with Prisma Studio
pnpm --filter api prisma:studio

# Run API tests
pnpm --filter api test
```

## Step 8: Seed Data (if needed)

If the new field needs seed data, update the seed script:

```bash
pnpm --filter api prisma:seed
```

## Rollback Strategy

```bash
# If migration fails, rollback
pnpm --filter api prisma migrate resolve --rolled-back {migration_name}

# Or reset (DESTROYS DATA -- dev only)
pnpm --filter api prisma migrate reset
```

## Common Migration Patterns

### Adding Soft Delete (QS-002 Pattern)

```prisma
model Invoice {
  // ... existing fields ...
  deletedAt DateTime?
}
```

```sql
ALTER TABLE "Invoice" ADD COLUMN "deletedAt" TIMESTAMP(3);
```

Then update ALL queries to filter `deletedAt: null`.

### Adding a Relation

```prisma
model Order {
  // ... existing fields ...
  invoiceId String? @unique
  invoice   Invoice? @relation(fields: [invoiceId], references: [id])
}
```

### Adding an Enum

```prisma
enum NewStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

## Current Schema Stats

- 260 models, 114 enums, 31 migrations
- Schema file: `apps/api/prisma/schema.prisma`
