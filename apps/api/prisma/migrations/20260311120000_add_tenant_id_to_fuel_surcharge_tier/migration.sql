-- AlterTable: Add tenantId to FuelSurchargeTier
-- Backfill from parent FuelSurchargeTable, then make NOT NULL

-- Step 1: Add column as nullable
ALTER TABLE "FuelSurchargeTier" ADD COLUMN "tenantId" TEXT;

-- Step 2: Backfill tenantId from parent FuelSurchargeTable
UPDATE "FuelSurchargeTier" AS tier
SET "tenantId" = tbl."tenantId"
FROM "FuelSurchargeTable" AS tbl
WHERE tier."tableId" = tbl."id";

-- Step 3: Set default for any orphaned rows (shouldn't exist due to FK, but safe)
UPDATE "FuelSurchargeTier"
SET "tenantId" = 'default-tenant'
WHERE "tenantId" IS NULL;

-- Step 4: Make column NOT NULL
ALTER TABLE "FuelSurchargeTier" ALTER COLUMN "tenantId" SET NOT NULL;

-- Step 5: Add foreign key constraint
ALTER TABLE "FuelSurchargeTier" ADD CONSTRAINT "FuelSurchargeTier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Add index for query performance
CREATE INDEX "FuelSurchargeTier_tenantId_idx" ON "FuelSurchargeTier"("tenantId");
