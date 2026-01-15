# Prompt 13: Load Board Geo-Search Implementation

**Priority:** P3 (Post-Frontend Readiness)  
**Estimated Time:** 6-8 hours  
**Dependencies:** All P0, P1, P2 prompts completed  
**Current State:** Basic city/state filtering only → Target: Full geo-search with radius

---

## Objective

Implement comprehensive geographic search capabilities for the Load Board service, enabling users to search for loads and carrier capacity within a specified radius of origin/destination locations. This requires calculating distances between coordinates and filtering results accordingly.

---

## Current State Analysis

### What Exists

```typescript
// Current SearchLoadPostingDto - only basic filtering
export class SearchLoadPostingDto {
  originState?: string;
  originCity?: string;
  destState?: string;
  destCity?: string;
  radiusMiles?: number; // EXISTS but NOT IMPLEMENTED
  // ...
}
```

### What's Missing

1. **No distance calculation** - `radiusMiles` parameter is ignored
2. **No coordinate-based search** - Only exact city/state matching
3. **No PostGIS integration** - Database not optimized for geo queries
4. **No geocoding fallback** - Can't search by ZIP or address
5. **No carrier capacity geo-search** - Only load postings

---

## Implementation Approach

### Option A: PostGIS (Recommended for Production)
- Native PostgreSQL extension for geographic data
- Extremely fast spatial queries
- Proper indexing support
- Best for large datasets

### Option B: Haversine Formula (Simpler, Good for MVP)
- Calculate distance in application code
- No database changes required
- Works with standard lat/lng columns
- Suitable for moderate datasets

**This prompt implements Option B with preparation for Option A upgrade.**

---

## Implementation Steps

### Step 1: Create Geo Utilities

**File: `apps/api/src/common/utils/geo.utils.ts`**

```typescript
/**
 * Geographic utility functions for distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates,
): number {
  const R = 3959; // Earth's radius in miles

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLng = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate bounding box for a radius search
 * Used to pre-filter results before precise distance calculation
 */
export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number,
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latDelta = radiusMiles / 69; // ~69 miles per degree latitude
  const lngDelta = radiusMiles / (69 * Math.cos(toRadians(center.latitude)));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}

/**
 * Check if a point is within radius of a center point
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusMiles: number,
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusMiles;
}

/**
 * Sort points by distance from a center point
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  center: Coordinates,
  points: T[],
): Array<T & { distance: number }> {
  return points
    .map((point) => ({
      ...point,
      distance: calculateDistance(center, {
        latitude: point.latitude,
        longitude: point.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get approximate coordinates for a US city/state
 * Fallback when lat/lng not available
 */
export async function geocodeCity(
  city: string,
  state: string,
): Promise<Coordinates | null> {
  // In production, integrate with geocoding service
  // For now, use a lookup table of major cities
  const key = `${city.toLowerCase()},${state.toLowerCase()}`;
  return US_CITY_COORDINATES[key] || null;
}

// Major US city coordinates (subset for MVP)
const US_CITY_COORDINATES: Record<string, Coordinates> = {
  'chicago,il': { latitude: 41.8781, longitude: -87.6298 },
  'los angeles,ca': { latitude: 34.0522, longitude: -118.2437 },
  'new york,ny': { latitude: 40.7128, longitude: -74.006 },
  'houston,tx': { latitude: 29.7604, longitude: -95.3698 },
  'phoenix,az': { latitude: 33.4484, longitude: -112.074 },
  'philadelphia,pa': { latitude: 39.9526, longitude: -75.1652 },
  'san antonio,tx': { latitude: 29.4241, longitude: -98.4936 },
  'san diego,ca': { latitude: 32.7157, longitude: -117.1611 },
  'dallas,tx': { latitude: 32.7767, longitude: -96.797 },
  'san jose,ca': { latitude: 37.3382, longitude: -121.8863 },
  'austin,tx': { latitude: 30.2672, longitude: -97.7431 },
  'jacksonville,fl': { latitude: 30.3322, longitude: -81.6557 },
  'fort worth,tx': { latitude: 32.7555, longitude: -97.3308 },
  'columbus,oh': { latitude: 39.9612, longitude: -82.9988 },
  'charlotte,nc': { latitude: 35.2271, longitude: -80.8431 },
  'seattle,wa': { latitude: 47.6062, longitude: -122.3321 },
  'denver,co': { latitude: 39.7392, longitude: -104.9903 },
  'detroit,mi': { latitude: 42.3314, longitude: -83.0458 },
  'atlanta,ga': { latitude: 33.749, longitude: -84.388 },
  'memphis,tn': { latitude: 35.1495, longitude: -90.049 },
  'nashville,tn': { latitude: 36.1627, longitude: -86.7816 },
  'indianapolis,in': { latitude: 39.7684, longitude: -86.1581 },
  'kansas city,mo': { latitude: 39.0997, longitude: -94.5786 },
  'miami,fl': { latitude: 25.7617, longitude: -80.1918 },
  'orlando,fl': { latitude: 28.5383, longitude: -81.3792 },
  'st. louis,mo': { latitude: 38.627, longitude: -90.1994 },
  'minneapolis,mn': { latitude: 44.9778, longitude: -93.265 },
  'cleveland,oh': { latitude: 41.4993, longitude: -81.6944 },
  'pittsburgh,pa': { latitude: 40.4406, longitude: -79.9959 },
  'cincinnati,oh': { latitude: 39.1031, longitude: -84.512 },
  'tampa,fl': { latitude: 27.9506, longitude: -82.4572 },
  'baltimore,md': { latitude: 39.2904, longitude: -76.6122 },
  'las vegas,nv': { latitude: 36.1699, longitude: -115.1398 },
  'portland,or': { latitude: 45.5152, longitude: -122.6784 },
  'salt lake city,ut': { latitude: 40.7608, longitude: -111.891 },
  'milwaukee,wi': { latitude: 43.0389, longitude: -87.9065 },
  'louisville,ky': { latitude: 38.2527, longitude: -85.7585 },
  'oklahoma city,ok': { latitude: 35.4676, longitude: -97.5164 },
  'albuquerque,nm': { latitude: 35.0844, longitude: -106.6504 },
  'tucson,az': { latitude: 32.2226, longitude: -110.9747 },
  'fresno,ca': { latitude: 36.7378, longitude: -119.7871 },
  'sacramento,ca': { latitude: 38.5816, longitude: -121.4944 },
  'omaha,ne': { latitude: 41.2565, longitude: -95.9345 },
  'raleigh,nc': { latitude: 35.7796, longitude: -78.6382 },
  'birmingham,al': { latitude: 33.5207, longitude: -86.8025 },
  'new orleans,la': { latitude: 29.9511, longitude: -90.0715 },
};
```

---

### Step 2: Create Geocoding Service

**File: `apps/api/src/modules/load-board/services/geocoding.service.ts`**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma.service';
import { Coordinates, geocodeCity } from '../../../common/utils/geo.utils';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private cache = new Map<string, Coordinates>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get coordinates for a location
   * Tries: cache -> database -> built-in lookup -> external API
   */
  async getCoordinates(
    city: string,
    state: string,
    zip?: string,
  ): Promise<Coordinates | null> {
    const cacheKey = `${city.toLowerCase()},${state.toLowerCase()}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Check if we have coordinates in database (from previous lookups)
    const cached = await this.prisma.geocodeCache?.findFirst({
      where: {
        city: { equals: city, mode: 'insensitive' },
        state: { equals: state, mode: 'insensitive' },
      },
    });

    if (cached?.latitude && cached?.longitude) {
      const coords = { latitude: cached.latitude, longitude: cached.longitude };
      this.cache.set(cacheKey, coords);
      return coords;
    }

    // Try built-in lookup
    const builtin = await geocodeCity(city, state);
    if (builtin) {
      this.cache.set(cacheKey, builtin);
      return builtin;
    }

    // TODO: Integrate external geocoding API (Google, Mapbox, etc.)
    // For MVP, return null if not in built-in list
    this.logger.warn(`No coordinates found for ${city}, ${state}`);
    return null;
  }

  /**
   * Get coordinates from ZIP code
   */
  async getCoordinatesFromZip(zip: string): Promise<Coordinates | null> {
    // Check ZIP code table if exists
    const zipData = await this.prisma.zipCode?.findFirst({
      where: { zip },
    });

    if (zipData?.latitude && zipData?.longitude) {
      return { latitude: zipData.latitude, longitude: zipData.longitude };
    }

    return null;
  }

  /**
   * Batch geocode multiple locations
   */
  async batchGeocode(
    locations: Array<{ city: string; state: string }>,
  ): Promise<Map<string, Coordinates | null>> {
    const results = new Map<string, Coordinates | null>();

    await Promise.all(
      locations.map(async (loc) => {
        const key = `${loc.city},${loc.state}`;
        const coords = await this.getCoordinates(loc.city, loc.state);
        results.set(key, coords);
      }),
    );

    return results;
  }
}
```

---

### Step 3: Update Load Posting Search DTO

**File: `apps/api/src/modules/load-board/dto/search-load-posting.dto.ts`**

```typescript
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeoSearchDto {
  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State code (2-letter)' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Search radius in miles',
    default: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radiusMiles?: number = 50;
}

export enum PostingStatus {
  ACTIVE = 'ACTIVE',
  BOOKED = 'BOOKED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class SearchLoadPostingDto {
  @ApiPropertyOptional({ description: 'Origin location search criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoSearchDto)
  origin?: GeoSearchDto;

  @ApiPropertyOptional({ description: 'Destination location search criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoSearchDto)
  destination?: GeoSearchDto;

  // Legacy flat params (for backward compatibility)
  @ApiPropertyOptional({ description: 'Origin state (legacy, use origin.state)' })
  @IsOptional()
  @IsString()
  originState?: string;

  @ApiPropertyOptional({ description: 'Origin city (legacy, use origin.city)' })
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiPropertyOptional({ description: 'Destination state (legacy, use destination.state)' })
  @IsOptional()
  @IsString()
  destState?: string;

  @ApiPropertyOptional({ description: 'Destination city (legacy, use destination.city)' })
  @IsOptional()
  @IsString()
  destCity?: string;

  @ApiPropertyOptional({
    description: 'Search radius in miles (legacy, use origin.radiusMiles)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radiusMiles?: number;

  @ApiPropertyOptional({ description: 'Equipment type filter' })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({ description: 'Pickup date from' })
  @IsOptional()
  @IsDateString()
  pickupDateFrom?: string;

  @ApiPropertyOptional({ description: 'Pickup date to' })
  @IsOptional()
  @IsDateString()
  pickupDateTo?: string;

  @ApiPropertyOptional({ enum: PostingStatus, description: 'Posting status' })
  @IsOptional()
  @IsEnum(PostingStatus)
  status?: PostingStatus;

  @ApiPropertyOptional({ description: 'Minimum rate' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minRate?: number;

  @ApiPropertyOptional({ description: 'Maximum rate' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxRate?: number;

  @ApiPropertyOptional({ description: 'Include distance in results', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDistance?: boolean;

  @ApiPropertyOptional({ description: 'Sort by distance', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sortByDistance?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;
}
```

---

### Step 4: Update Load Postings Service with Geo Search

**File: `apps/api/src/modules/load-board/services/load-postings.service.ts`**

Update the `findAll` method to support geo search:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { GeocodingService } from './geocoding.service';
import {
  SearchLoadPostingDto,
  PostingStatus,
  GeoSearchDto,
} from '../dto/search-load-posting.dto';
import {
  calculateDistance,
  getBoundingBox,
  isWithinRadius,
  Coordinates,
} from '../../../common/utils/geo.utils';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoadPostingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async findAll(tenantId: string, searchDto: SearchLoadPostingDto) {
    const {
      // New nested params
      origin,
      destination,
      // Legacy flat params
      originState,
      originCity,
      destState,
      destCity,
      radiusMiles: legacyRadius,
      // Other filters
      equipmentType,
      pickupDateFrom,
      pickupDateTo,
      status,
      minRate,
      maxRate,
      includeDistance,
      sortByDistance,
      page = 1,
      limit = 50,
    } = searchDto;

    // Normalize params (support both new and legacy)
    const originSearch: GeoSearchDto = origin || {
      city: originCity,
      state: originState,
      radiusMiles: legacyRadius || 50,
    };

    const destSearch: GeoSearchDto = destination || {
      city: destCity,
      state: destState,
    };

    // Build base where clause
    const where: Prisma.LoadPostingWhereInput = {
      tenantId,
      status: status || PostingStatus.ACTIVE,
      deletedAt: null,
    };

    // Resolve origin coordinates
    let originCoords: Coordinates | null = null;
    if (originSearch.latitude && originSearch.longitude) {
      originCoords = {
        latitude: originSearch.latitude,
        longitude: originSearch.longitude,
      };
    } else if (originSearch.city && originSearch.state) {
      originCoords = await this.geocodingService.getCoordinates(
        originSearch.city,
        originSearch.state,
      );
    } else if (originSearch.zip) {
      originCoords = await this.geocodingService.getCoordinatesFromZip(originSearch.zip);
    }

    // Apply geo filtering for origin
    if (originCoords && originSearch.radiusMiles) {
      const bbox = getBoundingBox(originCoords, originSearch.radiusMiles);
      where.AND = where.AND || [];
      (where.AND as any[]).push({
        originLat: { gte: bbox.minLat, lte: bbox.maxLat },
        originLng: { gte: bbox.minLng, lte: bbox.maxLng },
      });
    } else if (originSearch.state) {
      where.originState = originSearch.state;
      if (originSearch.city) {
        where.originCity = { contains: originSearch.city, mode: 'insensitive' };
      }
    }

    // Resolve destination coordinates
    let destCoords: Coordinates | null = null;
    if (destSearch.latitude && destSearch.longitude) {
      destCoords = {
        latitude: destSearch.latitude,
        longitude: destSearch.longitude,
      };
    } else if (destSearch.city && destSearch.state) {
      destCoords = await this.geocodingService.getCoordinates(
        destSearch.city,
        destSearch.state,
      );
    }

    // Apply geo filtering for destination
    if (destCoords && destSearch.radiusMiles) {
      const bbox = getBoundingBox(destCoords, destSearch.radiusMiles);
      where.AND = where.AND || [];
      (where.AND as any[]).push({
        destLat: { gte: bbox.minLat, lte: bbox.maxLat },
        destLng: { gte: bbox.minLng, lte: bbox.maxLng },
      });
    } else if (destSearch.state) {
      where.destState = destSearch.state;
      if (destSearch.city) {
        where.destCity = { contains: destSearch.city, mode: 'insensitive' };
      }
    }

    // Equipment type filter
    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    // Date filters
    if (pickupDateFrom || pickupDateTo) {
      where.pickupDate = {};
      if (pickupDateFrom) {
        where.pickupDate.gte = new Date(pickupDateFrom);
      }
      if (pickupDateTo) {
        where.pickupDate.lte = new Date(pickupDateTo);
      }
    }

    // Rate filters
    if (minRate !== undefined) {
      where.postedRate = { ...where.postedRate, gte: minRate };
    }
    if (maxRate !== undefined) {
      where.postedRate = { ...where.postedRate, lte: maxRate };
    }

    // Fetch postings with bounding box filter
    let postings = await this.prisma.loadPosting.findMany({
      where,
      include: {
        load: {
          include: {
            order: {
              include: {
                stops: { orderBy: { stopSequence: 'asc' } },
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
            bids: true,
          },
        },
      },
      orderBy: { postedAt: 'desc' },
    });

    // Apply precise radius filtering and calculate distances
    if (originCoords && originSearch.radiusMiles) {
      postings = postings.filter((p) => {
        if (!p.originLat || !p.originLng) return false;
        return isWithinRadius(
          originCoords!,
          { latitude: Number(p.originLat), longitude: Number(p.originLng) },
          originSearch.radiusMiles!,
        );
      });
    }

    if (destCoords && destSearch.radiusMiles) {
      postings = postings.filter((p) => {
        if (!p.destLat || !p.destLng) return false;
        return isWithinRadius(
          destCoords!,
          { latitude: Number(p.destLat), longitude: Number(p.destLng) },
          destSearch.radiusMiles!,
        );
      });
    }

    // Add distance to results
    let results = postings.map((p) => {
      const result: any = { ...p };

      if (includeDistance || sortByDistance) {
        if (originCoords && p.originLat && p.originLng) {
          result.originDistance = calculateDistance(originCoords, {
            latitude: Number(p.originLat),
            longitude: Number(p.originLng),
          });
        }
        if (destCoords && p.destLat && p.destLng) {
          result.destDistance = calculateDistance(destCoords, {
            latitude: Number(p.destLat),
            longitude: Number(p.destLng),
          });
        }
      }

      return result;
    });

    // Sort by distance if requested
    if (sortByDistance && originCoords) {
      results.sort((a, b) => (a.originDistance || 999) - (b.originDistance || 999));
    }

    // Apply pagination after filtering
    const total = results.length;
    const skip = (page - 1) * limit;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        searchCriteria: {
          origin: originCoords ? { ...originCoords, radiusMiles: originSearch.radiusMiles } : null,
          destination: destCoords ? { ...destCoords, radiusMiles: destSearch.radiusMiles } : null,
        },
      },
    };
  }
}
```

---

### Step 5: Update Capacity Search with Geo

**File: `apps/api/src/modules/load-board/capacity/capacity.service.ts`**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { GeocodingService } from '../services/geocoding.service';
import { CapacitySearchDto } from './dto/capacity-search.dto';
import {
  calculateDistance,
  getBoundingBox,
  isWithinRadius,
  Coordinates,
} from '../../../common/utils/geo.utils';

@Injectable()
export class CapacityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async search(tenantId: string, userId: string, dto: CapacitySearchDto) {
    const account = await this.prisma.loadBoardAccount.findFirst({
      where: { id: dto.accountId, tenantId, deletedAt: null },
    });

    if (!account) {
      throw new NotFoundException('Load board account not found');
    }

    // Resolve origin coordinates
    let originCoords: Coordinates | null = null;
    if (dto.originCity && dto.originState) {
      originCoords = await this.geocodingService.getCoordinates(
        dto.originCity,
        dto.originState,
      );
    }

    // Resolve destination coordinates
    let destCoords: Coordinates | null = null;
    if (dto.destinationCity && dto.destinationState) {
      destCoords = await this.geocodingService.getCoordinates(
        dto.destinationCity,
        dto.destinationState,
      );
    }

    // Get equipment type from related load if provided
    let equipmentType = dto.equipmentTypes?.[0];
    if (dto.relatedLoadId && !equipmentType) {
      const load = await this.prisma.load.findFirst({
        where: { id: dto.relatedLoadId, tenantId },
        include: { order: { include: { stops: { orderBy: { stopSequence: 'asc' } } } } },
      });

      if (load) {
        equipmentType = load.equipmentType || undefined;

        // Use load's origin/destination if not provided
        if (!originCoords && load.order?.stops?.length) {
          const pickup = load.order.stops[0];
          if (pickup.latitude && pickup.longitude) {
            originCoords = {
              latitude: Number(pickup.latitude),
              longitude: Number(pickup.longitude),
            };
          } else if (pickup.city && pickup.state) {
            originCoords = await this.geocodingService.getCoordinates(
              pickup.city,
              pickup.state,
            );
          }
        }

        if (!destCoords && load.order?.stops?.length > 1) {
          const delivery = load.order.stops[load.order.stops.length - 1];
          if (delivery.latitude && delivery.longitude) {
            destCoords = {
              latitude: Number(delivery.latitude),
              longitude: Number(delivery.longitude),
            };
          } else if (delivery.city && delivery.state) {
            destCoords = await this.geocodingService.getCoordinates(
              delivery.city,
              delivery.state,
            );
          }
        }
      }
    }

    // Create search record
    const search = await this.prisma.capacitySearch.create({
      data: {
        tenantId,
        accountId: dto.accountId,
        searchNumber: this.generateSearchNumber(),
        originCity: dto.originCity,
        originState: dto.originState,
        originRadius: dto.originRadiusMiles,
        originLat: originCoords?.latitude,
        originLng: originCoords?.longitude,
        destCity: dto.destinationCity,
        destState: dto.destinationState,
        destRadius: dto.destinationRadiusMiles,
        destLat: destCoords?.latitude,
        destLng: destCoords?.longitude,
        equipmentType,
        availableDate: dto.availableDateFrom ?? new Date(),
        customFields: {
          availableDateTo: dto.availableDateTo,
          equipmentTypes: dto.equipmentTypes,
          relatedLoadId: dto.relatedLoadId,
        },
        createdById: userId,
      },
    });

    // In production, this would trigger async search on external load boards
    // For now, search internal carrier capacity

    const internalResults = await this.searchInternalCapacity(
      tenantId,
      originCoords,
      dto.originRadiusMiles || 100,
      destCoords,
      equipmentType,
      dto.availableDateFrom,
    );

    // Update search with results
    await this.prisma.capacitySearch.update({
      where: { id: search.id },
      data: {
        searchStatus: 'COMPLETED',
        resultsCount: internalResults.length,
        searchedAt: new Date(),
      },
    });

    return {
      ...search,
      results: internalResults,
    };
  }

  private async searchInternalCapacity(
    tenantId: string,
    originCoords: Coordinates | null,
    originRadius: number,
    destCoords: Coordinates | null,
    equipmentType?: string,
    availableDate?: Date,
  ) {
    // Build where clause for carrier capacity
    const where: any = {
      tenantId,
      status: 'AVAILABLE',
    };

    if (equipmentType) {
      where.equipmentType = equipmentType;
    }

    if (availableDate) {
      where.availableDate = { lte: availableDate };
    }

    // Apply bounding box if we have origin coordinates
    if (originCoords) {
      const bbox = getBoundingBox(originCoords, originRadius);
      where.currentLat = { gte: bbox.minLat, lte: bbox.maxLat };
      where.currentLng = { gte: bbox.minLng, lte: bbox.maxLng };
    }

    let capacity = await this.prisma.carrierCapacity.findMany({
      where,
      include: {
        carrier: {
          select: {
            id: true,
            legalName: true,
            mcNumber: true,
            dotNumber: true,
            phone: true,
            dispatchPhone: true,
            avgRating: true,
            qualificationTier: true,
          },
        },
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    // Apply precise radius filtering
    if (originCoords) {
      capacity = capacity.filter((c) => {
        if (!c.currentLat || !c.currentLng) return false;
        return isWithinRadius(
          originCoords,
          { latitude: Number(c.currentLat), longitude: Number(c.currentLng) },
          originRadius,
        );
      });
    }

    // Filter by preferred destination states if destination provided
    if (destCoords) {
      // This would need destState derived from coords in production
      // For now, skip destination filtering for internal capacity
    }

    // Add distance to results
    return capacity.map((c) => ({
      ...c,
      distance: originCoords && c.currentLat && c.currentLng
        ? calculateDistance(originCoords, {
            latitude: Number(c.currentLat),
            longitude: Number(c.currentLng),
          })
        : null,
    })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  private generateSearchNumber(): string {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CAP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${random}`;
  }

  // ... rest of existing methods
}
```

---

### Step 6: Add API Endpoints

**File: `apps/api/src/modules/load-board/controllers/load-postings.controller.ts`**

Add new geo-search endpoint:

```typescript
import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { LoadPostingsService } from '../services/load-postings.service';
import { SearchLoadPostingDto, GeoSearchDto } from '../dto/search-load-posting.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Load Board')
@ApiBearerAuth()
@Controller('load-board')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadPostingsController {
  constructor(private readonly loadPostingsService: LoadPostingsService) {}

  @Get('postings')
  @ApiOperation({ summary: 'Search load postings with geo-filtering' })
  @ApiQuery({ name: 'origin.city', required: false, type: String })
  @ApiQuery({ name: 'origin.state', required: false, type: String })
  @ApiQuery({ name: 'origin.latitude', required: false, type: Number })
  @ApiQuery({ name: 'origin.longitude', required: false, type: Number })
  @ApiQuery({ name: 'origin.radiusMiles', required: false, type: Number, description: 'Search radius in miles (1-500)' })
  @ApiQuery({ name: 'destination.city', required: false, type: String })
  @ApiQuery({ name: 'destination.state', required: false, type: String })
  @ApiQuery({ name: 'destination.radiusMiles', required: false, type: Number })
  @ApiQuery({ name: 'equipmentType', required: false, type: String })
  @ApiQuery({ name: 'pickupDateFrom', required: false, type: String })
  @ApiQuery({ name: 'pickupDateTo', required: false, type: String })
  @ApiQuery({ name: 'sortByDistance', required: false, type: Boolean })
  @ApiQuery({ name: 'includeDistance', required: false, type: Boolean })
  async searchPostings(
    @CurrentTenant() tenantId: string,
    @Query() searchDto: SearchLoadPostingDto,
  ) {
    return this.loadPostingsService.findAll(tenantId, searchDto);
  }

  @Post('postings/search-by-location')
  @ApiOperation({ summary: 'Advanced geo-search for load postings' })
  async searchByLocation(
    @CurrentTenant() tenantId: string,
    @Body() searchDto: SearchLoadPostingDto,
  ) {
    return this.loadPostingsService.findAll(tenantId, searchDto);
  }

  @Get('postings/nearby')
  @ApiOperation({ summary: 'Find loads near a specific location' })
  @ApiQuery({ name: 'latitude', required: true, type: Number })
  @ApiQuery({ name: 'longitude', required: true, type: Number })
  @ApiQuery({ name: 'radiusMiles', required: false, type: Number, description: 'Default: 50 miles' })
  @ApiQuery({ name: 'equipmentType', required: false, type: String })
  async findNearby(
    @CurrentTenant() tenantId: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusMiles') radiusMiles?: number,
    @Query('equipmentType') equipmentType?: string,
  ) {
    return this.loadPostingsService.findAll(tenantId, {
      origin: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMiles: radiusMiles ? Number(radiusMiles) : 50,
      },
      equipmentType,
      sortByDistance: true,
      includeDistance: true,
    });
  }
}
```

---

### Step 7: Update Module

**File: `apps/api/src/modules/load-board/load-board.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { LoadPostingsController } from './controllers/load-postings.controller';
import { LoadPostingsService } from './services/load-postings.service';
import { GeocodingService } from './services/geocoding.service';
import { CapacityController } from './capacity/capacity.controller';
import { CapacityService } from './capacity/capacity.service';
import { PrismaService } from '../../prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [LoadPostingsController, CapacityController],
  providers: [
    LoadPostingsService,
    CapacityService,
    GeocodingService,
    PrismaService,
  ],
  exports: [LoadPostingsService, CapacityService, GeocodingService],
})
export class LoadBoardModule {}
```

---

### Step 8: Unit Tests for Geo Utils

**File: `apps/api/src/common/utils/geo.utils.spec.ts`**

```typescript
import {
  calculateDistance,
  getBoundingBox,
  isWithinRadius,
  sortByDistance,
} from './geo.utils';

describe('Geo Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between Chicago and Detroit', () => {
      const chicago = { latitude: 41.8781, longitude: -87.6298 };
      const detroit = { latitude: 42.3314, longitude: -83.0458 };

      const distance = calculateDistance(chicago, detroit);

      // Chicago to Detroit is ~238 miles
      expect(distance).toBeGreaterThan(230);
      expect(distance).toBeLessThan(250);
    });

    it('should return 0 for same location', () => {
      const point = { latitude: 41.8781, longitude: -87.6298 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should handle cross-country distances', () => {
      const la = { latitude: 34.0522, longitude: -118.2437 };
      const ny = { latitude: 40.7128, longitude: -74.006 };

      const distance = calculateDistance(la, ny);

      // LA to NY is ~2,450 miles
      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2500);
    });
  });

  describe('getBoundingBox', () => {
    it('should create bounding box for 50 mile radius', () => {
      const center = { latitude: 41.8781, longitude: -87.6298 }; // Chicago

      const bbox = getBoundingBox(center, 50);

      expect(bbox.minLat).toBeLessThan(center.latitude);
      expect(bbox.maxLat).toBeGreaterThan(center.latitude);
      expect(bbox.minLng).toBeLessThan(center.longitude);
      expect(bbox.maxLng).toBeGreaterThan(center.longitude);

      // ~50 miles is ~0.72 degrees latitude
      expect(bbox.maxLat - bbox.minLat).toBeCloseTo(1.45, 1);
    });
  });

  describe('isWithinRadius', () => {
    it('should return true for point within radius', () => {
      const chicago = { latitude: 41.8781, longitude: -87.6298 };
      const nearby = { latitude: 41.9, longitude: -87.7 }; // ~5 miles

      expect(isWithinRadius(chicago, nearby, 50)).toBe(true);
    });

    it('should return false for point outside radius', () => {
      const chicago = { latitude: 41.8781, longitude: -87.6298 };
      const detroit = { latitude: 42.3314, longitude: -83.0458 }; // ~238 miles

      expect(isWithinRadius(chicago, detroit, 50)).toBe(false);
    });
  });

  describe('sortByDistance', () => {
    it('should sort points by distance from center', () => {
      const chicago = { latitude: 41.8781, longitude: -87.6298 };
      const points = [
        { id: 'detroit', latitude: 42.3314, longitude: -83.0458 }, // ~238 miles
        { id: 'milwaukee', latitude: 43.0389, longitude: -87.9065 }, // ~90 miles
        { id: 'indianapolis', latitude: 39.7684, longitude: -86.1581 }, // ~180 miles
      ];

      const sorted = sortByDistance(chicago, points);

      expect(sorted[0].id).toBe('milwaukee');
      expect(sorted[1].id).toBe('indianapolis');
      expect(sorted[2].id).toBe('detroit');
    });
  });
});
```

---

## Acceptance Criteria

- [ ] `calculateDistance()` function accurately calculates miles between coordinates
- [ ] `getBoundingBox()` creates appropriate bounding boxes for pre-filtering
- [ ] Load posting search supports `origin.radiusMiles` parameter
- [ ] Load posting search supports `destination.radiusMiles` parameter
- [ ] Results include `originDistance` when `includeDistance=true`
- [ ] Results sorted by distance when `sortByDistance=true`
- [ ] Geocoding service resolves city/state to coordinates
- [ ] `/load-board/postings/nearby` endpoint works with lat/lng
- [ ] Capacity search supports geo-filtering
- [ ] Unit tests pass for all geo utility functions
- [ ] Backward compatible with existing city/state filtering

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

```markdown
| 13 | [Geo-Search](...) | P3 | 6-8h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Add Changelog Entry

```markdown
### [Date] - Prompt 13: Load Board Geo-Search
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Created geo utility functions (distance, bounding box, radius check)
- Implemented Geocoding service with city lookup
- Updated Load Posting search with radius filtering
- Added distance calculation to search results
- Updated Capacity search with geo-filtering
- Added /nearby endpoint for location-based search
- Unit tests for all geo functions
- Documented with Swagger annotations

#### Metrics Updated
- Load Board Feature Completeness: 82% → 95%
```

---

## Future Enhancements (Out of Scope)

1. **PostGIS Migration** - Native PostgreSQL geo queries for better performance
2. **External Geocoding API** - Google Maps, Mapbox, or HERE integration
3. **Route Distance** - Calculate actual driving distance, not straight-line
4. **ETA Calculation** - Estimated time of arrival based on route
5. **Lane Recommendations** - ML-based suggestions based on historical lanes
