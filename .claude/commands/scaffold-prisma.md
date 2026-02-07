Add a new Prisma model to the database schema and run migration. Entity name and fields: $ARGUMENTS

## Instructions

### Step 1: Understand the Entity

1. **Parse arguments**: Extract entity name (e.g., "Invoice") and optional field hints. If no arguments, ask the user for the entity name and its key fields.

2. **Check if the model already exists** by reading `apps/api/prisma/schema.prisma` and searching for `model {EntityName}`. If it exists, ask the user what fields to add/modify instead.

3. **Check the Screen-API Contract Registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` to find what fields this entity needs based on the screens that use it.

4. **Check design specs** in `dev_docs/12-Rabih-design-Process/` for data field mappings that specify exactly what fields this entity needs.

5. **Look at similar existing models** in the Prisma schema for pattern reference (e.g., if building an Invoice model, look at how Order or Quote models are structured).

### Step 2: Design the Model

6. **Draft the Prisma model** following these MANDATORY conventions:

```prisma
model EntityName {
  // Primary key
  id            String    @id @default(uuid())

  // Multi-tenant (MANDATORY)
  tenantId      String    @map("tenant_id")
  tenant        Tenant    @relation(fields: [tenantId], references: [id])

  // Core fields (from contract registry / design spec)
  // ... entity-specific fields here ...

  // Status (if applicable)
  status        EntityStatus @default(DRAFT)

  // Migration fields (MANDATORY for all entities)
  externalId    String?   @map("external_id")
  sourceSystem  String?   @map("source_system")
  customFields  Json?     @default("{}") @map("custom_fields")

  // Audit fields (MANDATORY)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  createdById   String?   @map("created_by_id")
  updatedById   String?   @map("updated_by_id")

  // Relations
  createdBy     User?     @relation("EntityCreatedBy", fields: [createdById], references: [id])
  updatedBy     User?     @relation("EntityUpdatedBy", fields: [updatedById], references: [id])

  // Indexes (MANDATORY)
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, deletedAt])
  @@index([createdAt])

  // Table mapping (use snake_case)
  @@map("entity_names")
}
```

Key conventions:
- **Field names**: camelCase in Prisma, mapped to snake_case with `@map()`
- **Table names**: plural snake_case with `@@map()`
- **Every model MUST have**: `id`, `tenantId`, `createdAt`, `updatedAt`, `deletedAt`, `externalId`, `sourceSystem`, `customFields`
- **String IDs**: Always `@default(uuid())`
- **Soft deletes**: `deletedAt DateTime?` (nullable = not deleted)
- **Enums**: Define as separate `enum` blocks above the model
- **Relations**: Always define both sides of the relation
- **Indexes**: Always index `tenantId`, `tenantId + status`, `tenantId + deletedAt`

### Step 3: Add Enum (if needed)

7. If the entity has a status field or other enums, add them:

```prisma
enum EntityStatus {
  DRAFT
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### Step 4: Present for Review

8. **Show the complete model to the user** before making any changes. Include:
   - The full Prisma model code
   - Any enums
   - Relation impacts on other models (if any need reverse relations added)
   - Ask: "Does this look correct? Should I add or modify any fields?"

### Step 5: Apply Changes

9. After user approval, **edit the Prisma schema** file at `apps/api/prisma/schema.prisma`:
   - Add the enum (if any) in the enums section
   - Add the model in the appropriate section (group with related models)
   - Add reverse relations to related models if needed

### Step 6: Run Migration

10. Run the Prisma workflow in sequence:
    ```
    pnpm --filter api exec prisma format
    pnpm --filter api exec prisma validate
    pnpm --filter api exec prisma migrate dev --name add_{entity_name_snake_case}_table
    pnpm --filter api exec prisma generate
    ```

11. If any step fails, show the error and help fix it before proceeding.

### Step 7: Verify & Report

12. **Show a summary**:
    - Model name and field count
    - Migration name
    - Any related models modified
    - Remind user to: create DTOs matching these fields, update seed script if needed
    - Suggest next step: "Use `/scaffold-api` to generate the API module for this entity"
