# Database Design Standards

> Source: `dev_docs/08-standards/67-database-design-standards.md`
> Stack: PostgreSQL 15 + Prisma 6

## Migration-First Fields (REQUIRED on ALL entities)

```prisma
model AnyEntity {
  // Business fields...

  externalId    String?   @db.VarChar(255)  // ID from source system
  sourceSystem  String?   @db.VarChar(100)  // "MCLEOD", "HUBSPOT", "QUICKBOOKS"
  customFields  Json      @default("{}")    // Flexible field storage

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?                   // Soft delete
  createdById   String?
  updatedById   String?

  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([externalId, sourceSystem])
}
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Models | PascalCase, singular | `Carrier`, `LoadStop` |
| Fields | camelCase | `firstName`, `mcNumber` |
| FKs | end with `Id` | `carrierId`, `tenantId` |
| Booleans | start with `is/has/can` | `isActive`, `hasInsurance` |
| Dates | end with `At` | `createdAt`, `deliveredAt` |
| Enums | SCREAMING_SNAKE_CASE | `PENDING_APPROVAL` |

## Required Indexes

Every model needs at minimum:
- `@@index([tenantId])` — multi-tenant queries
- `@@index([externalId, sourceSystem])` — migration lookups
- Status fields: `@@index([status])`
- Foreign keys: `@@index([carrierId])`, etc.
- Common filters: `@@index([tenantId, deletedAt])`, `@@index([tenantId, status])`

## Soft Delete Pattern

```typescript
// ALWAYS filter in queries
where: { tenantId, deletedAt: null }

// Soft delete implementation
await prisma.carrier.update({
  where: { id },
  data: { deletedAt: new Date(), updatedById: userId }
});
```

**NEVER use hard delete** except for truly ephemeral data (sessions, cache).

## UUID Primary Keys

All models use `@id @default(uuid())`. Never auto-increment.

## Decimal Fields

- Currency: `@db.Decimal(12, 2)` — up to $9,999,999,999.99
- Large currency: `@db.Decimal(14, 2)` — for totals/balances
- Percentages: `@db.Decimal(5, 2)` — up to 999.99%
- Rates: `@db.Decimal(10, 2)`
- Coordinates: `@db.Decimal(10, 7)` — GPS precision

## Schema Changes Workflow

1. Modify `apps/api/prisma/schema.prisma`
2. Run `pnpm --filter api prisma:generate` (Prisma client)
3. Run `pnpm --filter api prisma:migrate` (create migration)
4. Update seed script if needed
5. Test migration up AND down
