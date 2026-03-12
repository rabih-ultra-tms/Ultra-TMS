-- Add tenantId column to FuelSurchargeTier for defense-in-depth tenant isolation
-- MP-01-017: FuelSurchargeTier was missing tenantId, relying only on parent table ownership

-- Step 1: Add nullable tenantId column
ALTER TABLE "FuelSurchargeTier" ADD COLUMN "tenantId" TEXT;

-- Step 2: Backfill tenantId from parent FuelSurchargeTable
UPDATE "FuelSurchargeTier" AS tier
SET "tenantId" = tbl."tenantId"
FROM "FuelSurchargeTable" AS tbl
WHERE tier."tableId" = tbl."id";

-- Step 3: Make tenantId NOT NULL after backfill
ALTER TABLE "FuelSurchargeTier" ALTER COLUMN "tenantId" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "FuelSurchargeTier" ADD CONSTRAINT "FuelSurchargeTier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Add index for tenant isolation queries
CREATE INDEX "FuelSurchargeTier_tenantId_idx" ON "FuelSurchargeTier"("tenantId");
