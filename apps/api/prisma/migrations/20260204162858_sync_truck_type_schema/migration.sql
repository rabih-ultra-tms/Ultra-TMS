-- AlterTable
ALTER TABLE "TruckType" ADD COLUMN     "baseRateCents" INTEGER,
ADD COLUMN     "bestFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "loadingMethod" VARCHAR(50),
ADD COLUMN     "maxLegalCargoHeightFt" DECIMAL(5,2),
ADD COLUMN     "maxLegalCargoWidthFt" DECIMAL(5,2),
ADD COLUMN     "ratePerMileCents" INTEGER,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tareWeightLbs" INTEGER,
ADD COLUMN     "wellHeightFt" DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "TruckType_isActive_idx" ON "TruckType"("isActive");
