# P4: Load Board Geo-Search Enhancement

## Priority: P4 - VERY LOW (Future Enhancement)
## Estimated Time: 2-3 days
## Dependencies: PostGIS extension or alternative

---

## Overview

The Load Board service lacks geographic search capabilities. Carriers need to find loads within a specific radius of their current location or preferred lanes. This prompt provides implementation options for geo-search functionality.

---

## Current State

- Load postings have `originCity`, `originState`, `destCity`, `destState` fields
- No latitude/longitude coordinates stored
- No geographic index support
- Search is text-based only (city/state name matching)

---

## Option 1: PostGIS Extension (Recommended)

### Step 1: Enable PostGIS

```sql
-- In PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Step 2: Update Schema

**File:** `apps/api/prisma/schema.prisma`

```prisma
model LoadPosting {
  id            String          @id @default(uuid())
  tenantId      String
  loadId        String
  status        PostingStatus
  targetRate    Decimal?
  expiresAt     DateTime
  
  // Origin location
  originCity    String
  originState   String
  originZip     String?
  originLat     Float?
  originLng     Float?
  
  // Destination location
  destCity      String
  destState     String
  destZip       String?
  destLat       Float?
  destLng       Float?
  
  // Distance calculated
  distance      Float?
  
  equipmentType EquipmentType?
  weight        Int?
  
  deletedAt     DateTime?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([tenantId])
  @@index([status])
}
```

### Step 3: Add Geography Column (Raw SQL Migration)

**File:** `apps/api/prisma/migrations/YYYYMMDD_add_geo_columns/migration.sql`

```sql
-- Add geography columns for efficient spatial queries
ALTER TABLE "LoadPosting" 
ADD COLUMN IF NOT EXISTS "originPoint" geography(Point, 4326);

ALTER TABLE "LoadPosting" 
ADD COLUMN IF NOT EXISTS "destPoint" geography(Point, 4326);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_posting_origin_geo 
ON "LoadPosting" USING GIST ("originPoint");

CREATE INDEX IF NOT EXISTS idx_posting_dest_geo 
ON "LoadPosting" USING GIST ("destPoint");

-- Function to update geography points on insert/update
CREATE OR REPLACE FUNCTION update_posting_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."originLat" IS NOT NULL AND NEW."originLng" IS NOT NULL THEN
    NEW."originPoint" = ST_SetSRID(ST_MakePoint(NEW."originLng", NEW."originLat"), 4326)::geography;
  END IF;
  
  IF NEW."destLat" IS NOT NULL AND NEW."destLng" IS NOT NULL THEN
    NEW."destPoint" = ST_SetSRID(ST_MakePoint(NEW."destLng", NEW."destLat"), 4326)::geography;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_posting_geo ON "LoadPosting";
CREATE TRIGGER update_posting_geo
  BEFORE INSERT OR UPDATE ON "LoadPosting"
  FOR EACH ROW
  EXECUTE FUNCTION update_posting_geography();
```

### Step 4: Geo-Search Service

**File:** `apps/api/src/load-board/postings/geo-search.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface GeoSearchParams {
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  originRadius?: number; // miles
  destRadius?: number;   // miles
  equipmentType?: string;
  minWeight?: number;
  maxWeight?: number;
}

@Injectable()
export class GeoSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByRadius(params: GeoSearchParams) {
    const {
      originLat,
      originLng,
      destLat,
      destLng,
      originRadius = 50,
      destRadius = 50,
      equipmentType,
    } = params;

    // Convert miles to meters for PostGIS
    const originRadiusMeters = originRadius * 1609.34;
    const destRadiusMeters = destRadius * 1609.34;

    let whereClause = `
      "status" = 'AVAILABLE' 
      AND "deletedAt" IS NULL 
      AND "expiresAt" > NOW()
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    // Origin radius filter
    if (originLat && originLng) {
      whereClause += `
        AND ST_DWithin(
          "originPoint",
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      queryParams.push(originLng, originLat, originRadiusMeters);
      paramIndex += 3;
    }

    // Destination radius filter
    if (destLat && destLng) {
      whereClause += `
        AND ST_DWithin(
          "destPoint",
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )
      `;
      queryParams.push(destLng, destLat, destRadiusMeters);
      paramIndex += 3;
    }

    // Equipment type filter
    if (equipmentType) {
      whereClause += ` AND "equipmentType" = $${paramIndex}`;
      queryParams.push(equipmentType);
      paramIndex += 1;
    }

    const query = `
      SELECT 
        id,
        "loadId",
        "originCity",
        "originState",
        "originLat",
        "originLng",
        "destCity",
        "destState",
        "destLat",
        "destLng",
        "targetRate",
        "equipmentType",
        weight,
        distance,
        "expiresAt",
        ${originLat && originLng ? `
          ST_Distance(
            "originPoint",
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) / 1609.34 as "originDistance",
        ` : '"originLat" as "originDistance",'}
        ${destLat && destLng ? `
          ST_Distance(
            "destPoint",
            ST_SetSRID(ST_MakePoint($${originLat ? 4 : 1}, $${originLat ? 5 : 2}), 4326)::geography
          ) / 1609.34 as "destDistance"
        ` : '"destLat" as "destDistance"'}
      FROM "LoadPosting"
      WHERE ${whereClause}
      ORDER BY "originDistance" ASC
      LIMIT 100
    `;

    return this.prisma.$queryRawUnsafe(query, ...queryParams);
  }

  /**
   * Search by lane (origin state to destination state)
   */
  async searchByLane(originState: string, destState: string) {
    return this.prisma.loadPosting.findMany({
      where: {
        originState,
        destState,
        status: 'AVAILABLE',
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

---

## Option 2: Application-Level Geo-Search (No PostGIS)

If PostGIS is not available, use application-level calculation:

**File:** `apps/api/src/load-board/postings/geo-search.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GeoSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByRadius(params: GeoSearchParams) {
    const {
      originLat,
      originLng,
      destLat,
      destLng,
      originRadius = 50,
      destRadius = 50,
      equipmentType,
    } = params;

    // Get all available postings with coordinates
    let postings = await this.prisma.loadPosting.findMany({
      where: {
        status: 'AVAILABLE',
        deletedAt: null,
        expiresAt: { gt: new Date() },
        originLat: { not: null },
        originLng: { not: null },
        ...(equipmentType && { equipmentType }),
      },
    });

    // Filter by origin radius
    if (originLat && originLng) {
      postings = postings.filter(posting => {
        const distance = this.calculateDistance(
          originLat,
          originLng,
          posting.originLat!,
          posting.originLng!
        );
        return distance <= originRadius;
      });
    }

    // Filter by destination radius
    if (destLat && destLng) {
      postings = postings.filter(posting => {
        if (!posting.destLat || !posting.destLng) return false;
        const distance = this.calculateDistance(
          destLat,
          destLng,
          posting.destLat,
          posting.destLng
        );
        return distance <= destRadius;
      });
    }

    // Add distance to results
    return postings.map(posting => ({
      ...posting,
      originDistance: originLat && originLng
        ? this.calculateDistance(originLat, originLng, posting.originLat!, posting.originLng!)
        : null,
      destDistance: destLat && destLng && posting.destLat && posting.destLng
        ? this.calculateDistance(destLat, destLng, posting.destLat, posting.destLng)
        : null,
    })).sort((a, b) => (a.originDistance || 0) - (b.originDistance || 0));
  }

  /**
   * Haversine distance calculation
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

---

## Task: Geocoding Service

To convert addresses to coordinates:

**File:** `apps/api/src/common/services/geocoding.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Geocode an address using Google Maps API
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    const apiKey = this.config.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('Google Maps API key not configured');
      return null;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        this.logger.warn(`Geocoding failed for address: ${address}`);
        return null;
      }

      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      this.logger.error(`Geocoding error: ${error.message}`);
      return null;
    }
  }

  /**
   * Geocode using ZIP code center (fallback)
   */
  async geocodeByZip(zip: string): Promise<GeocodingResult | null> {
    // Use a ZIP code database or API
    // This is a simplified example
    return this.geocode(`${zip}, USA`);
  }

  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses: string[]): Promise<Map<string, GeocodingResult>> {
    const results = new Map<string, GeocodingResult>();
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const promises = batch.map(async (address) => {
        const result = await this.geocode(address);
        if (result) {
          results.set(address, result);
        }
      });
      
      await Promise.all(promises);
      
      // Add delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}
```

---

## Task: Update Controller

**File:** `apps/api/src/load-board/postings/postings.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GeoSearchService } from './geo-search.service';

@ApiTags('Load Board')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('postings')
export class PostingsController {
  constructor(private readonly geoSearchService: GeoSearchService) {}

  @ApiOperation({ 
    summary: 'Search available loads by location',
    description: 'Find loads within a radius of specified coordinates'
  })
  @ApiQuery({ name: 'originLat', required: false, type: Number, example: 41.8781 })
  @ApiQuery({ name: 'originLng', required: false, type: Number, example: -87.6298 })
  @ApiQuery({ name: 'destLat', required: false, type: Number })
  @ApiQuery({ name: 'destLng', required: false, type: Number })
  @ApiQuery({ name: 'originRadius', required: false, type: Number, example: 50, description: 'Radius in miles' })
  @ApiQuery({ name: 'destRadius', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'equipmentType', required: false, enum: ['DRY_VAN', 'REEFER', 'FLATBED'] })
  @Roles('CARRIER_MANAGER', 'DRIVER', 'DISPATCHER', 'ADMIN')
  @Get('search/geo')
  async searchByLocation(
    @Query('originLat') originLat?: number,
    @Query('originLng') originLng?: number,
    @Query('destLat') destLat?: number,
    @Query('destLng') destLng?: number,
    @Query('originRadius') originRadius?: number,
    @Query('destRadius') destRadius?: number,
    @Query('equipmentType') equipmentType?: string,
  ) {
    return this.geoSearchService.searchByRadius({
      originLat: originLat ? Number(originLat) : undefined,
      originLng: originLng ? Number(originLng) : undefined,
      destLat: destLat ? Number(destLat) : undefined,
      destLng: destLng ? Number(destLng) : undefined,
      originRadius: originRadius ? Number(originRadius) : 50,
      destRadius: destRadius ? Number(destRadius) : 50,
      equipmentType,
    });
  }

  @ApiOperation({ summary: 'Search loads by lane' })
  @ApiQuery({ name: 'originState', required: true, type: String, example: 'IL' })
  @ApiQuery({ name: 'destState', required: true, type: String, example: 'NY' })
  @Roles('CARRIER_MANAGER', 'DRIVER', 'DISPATCHER', 'ADMIN')
  @Get('search/lane')
  async searchByLane(
    @Query('originState') originState: string,
    @Query('destState') destState: string,
  ) {
    return this.geoSearchService.searchByLane(originState, destState);
  }
}
```

---

## Task: Populate Coordinates for Existing Data

**Migration Script:**

```typescript
// apps/api/src/scripts/populate-coordinates.ts
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from '../common/services/geocoding.service';

async function populateCoordinates() {
  const prisma = new PrismaService();
  const geocoding = new GeocodingService();

  // Get postings without coordinates
  const postings = await prisma.loadPosting.findMany({
    where: {
      OR: [
        { originLat: null },
        { destLat: null },
      ],
    },
  });

  console.log(`Found ${postings.length} postings to geocode`);

  for (const posting of postings) {
    // Geocode origin
    if (!posting.originLat || !posting.originLng) {
      const originAddress = `${posting.originCity}, ${posting.originState}`;
      const originResult = await geocoding.geocode(originAddress);
      
      if (originResult) {
        await prisma.loadPosting.update({
          where: { id: posting.id },
          data: {
            originLat: originResult.lat,
            originLng: originResult.lng,
          },
        });
        console.log(`Updated origin for ${posting.id}`);
      }
    }

    // Geocode destination
    if (!posting.destLat || !posting.destLng) {
      const destAddress = `${posting.destCity}, ${posting.destState}`;
      const destResult = await geocoding.geocode(destAddress);
      
      if (destResult) {
        await prisma.loadPosting.update({
          where: { id: posting.id },
          data: {
            destLat: destResult.lat,
            destLng: destResult.lng,
          },
        });
        console.log(`Updated destination for ${posting.id}`);
      }
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('Geocoding complete');
  await prisma.$disconnect();
}

populateCoordinates();
```

---

## Completion Checklist

### Schema Updates
- [ ] Add lat/lng fields to LoadPosting model
- [ ] Add geography columns (PostGIS)
- [ ] Create spatial indexes

### Services
- [ ] Implement GeoSearchService
- [ ] Implement GeocodingService
- [ ] Add environment config for Google Maps API

### Controller
- [ ] Add /search/geo endpoint
- [ ] Add /search/lane endpoint
- [ ] Document with Swagger

### Data Migration
- [ ] Run coordinate population script
- [ ] Verify all postings have coordinates

### Testing
- [ ] Test radius search
- [ ] Test lane search
- [ ] Test with edge cases (no coordinates, large radius)

---

## Performance Considerations

| Approach | 100 records | 10K records | 100K records |
|----------|-------------|-------------|--------------|
| PostGIS | ~5ms | ~20ms | ~100ms |
| App-level | ~10ms | ~500ms | ~5s |

**Recommendation:** Use PostGIS for production with >1,000 postings.
