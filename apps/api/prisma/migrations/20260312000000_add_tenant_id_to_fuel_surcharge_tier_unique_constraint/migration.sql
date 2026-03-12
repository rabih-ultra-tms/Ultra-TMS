-- AlterTable: Update FuelSurchargeTier unique constraint to include tenantId
-- This ensures tenants cannot collide on tableId/tierNumber combinations

-- Step 1: Drop existing unique constraint (if it exists)
ALTER TABLE "FuelSurchargeTier" DROP CONSTRAINT IF EXISTS "FuelSurchargeTier_tableId_tierNumber_key";

-- Step 2: Add new tenant-scoped unique constraint
ALTER TABLE "FuelSurchargeTier" ADD CONSTRAINT "FuelSurchargeTier_tenantId_tableId_tierNumber_key" UNIQUE ("tenantId", "tableId", "tierNumber");
