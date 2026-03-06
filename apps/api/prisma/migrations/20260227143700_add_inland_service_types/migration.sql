-- CreateTable
CREATE TABLE "inland_service_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "defaultRateCents" INTEGER NOT NULL DEFAULT 0,
    "billingUnit" VARCHAR(50) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "externalId" VARCHAR(255),
    "sourceSystem" VARCHAR(100),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inland_service_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inland_service_types_isActive_idx" ON "inland_service_types"("isActive");

-- CreateIndex
CREATE INDEX "inland_service_types_sortOrder_idx" ON "inland_service_types"("sortOrder");

-- Seed common inland service types
INSERT INTO "inland_service_types" ("id", "name", "description", "defaultRateCents", "billingUnit", "sortOrder", "isActive", "updatedAt") VALUES
  (gen_random_uuid(), 'Line Haul', 'Base transportation charge for origin to destination', 0, 'FLAT', 1, true, NOW()),
  (gen_random_uuid(), 'Fuel Surcharge', 'Fuel cost adjustment based on current rates', 0, 'PERCENTAGE', 2, true, NOW()),
  (gen_random_uuid(), 'Detention', 'Charge for waiting time at pickup or delivery', 7500, 'PER_HOUR', 3, true, NOW()),
  (gen_random_uuid(), 'Layover', 'Charge for overnight wait between pickup and delivery', 35000, 'PER_DAY', 4, true, NOW()),
  (gen_random_uuid(), 'Tarping', 'Charge for covering cargo with tarps', 15000, 'FLAT', 5, true, NOW()),
  (gen_random_uuid(), 'Escort Service', 'Pilot car or escort vehicle for oversize loads', 0, 'PER_MILE', 6, true, NOW()),
  (gen_random_uuid(), 'Permit Fees', 'State and local permit charges for oversize/overweight loads', 0, 'FLAT', 7, true, NOW()),
  (gen_random_uuid(), 'Loading/Unloading', 'Crane, forklift, or rigging services', 0, 'PER_HOUR', 8, true, NOW()),
  (gen_random_uuid(), 'Accessorial - Stop Off', 'Additional stop charge', 25000, 'PER_STOP', 9, true, NOW()),
  (gen_random_uuid(), 'Insurance Surcharge', 'Additional cargo insurance coverage', 0, 'PERCENTAGE', 10, true, NOW()),
  (gen_random_uuid(), 'Hazmat Fee', 'Hazardous materials handling surcharge', 50000, 'FLAT', 11, true, NOW()),
  (gen_random_uuid(), 'Deadhead', 'Empty miles charge for repositioning', 0, 'PER_MILE', 12, true, NOW());
