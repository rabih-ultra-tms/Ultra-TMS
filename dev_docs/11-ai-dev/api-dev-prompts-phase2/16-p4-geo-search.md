# Prompt 16: Load Board Advanced Geo-Search

> **Priority:** P4 - Enhancement  
> **Estimated Time:** 6-8 hours  
> **Target:** Basic Search → Full Advanced Geo-Search  
> **Prerequisites:** Prompts 01-13 completed (Geo-search infrastructure exists)

---

## Objective

Enhance the Load Board with advanced geographic search capabilities including radius search, route corridor search, deadhead calculation, and proximity-based matching.

---

## Current State Analysis

### What Exists (From Prompt 13)
- Basic geo utilities (`geo.utils.ts`)
- Geocoding service
- Simple radius filtering for load postings
- Internal capacity geo-search with distance sorting

### What's Missing
- Advanced radius search with multiple origins
- Route corridor search (loads along a route)
- Deadhead mile calculation
- Multi-stop route optimization search
- Backhaul matching
- Geofence-based alerts

---

## Implementation Tasks

### Task 1: Advanced Radius Search

Create endpoint for complex radius-based searches:

```typescript
// src/modules/load-board/dto/geo-search.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GeoPointDto {
  @ApiProperty({ example: 41.8781, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: -87.6298, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class RadiusSearchDto {
  @ApiProperty({ description: 'Search origin point(s)', type: [GeoPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  origins: GeoPointDto[];

  @ApiProperty({ example: 150, description: 'Search radius in miles' })
  @IsNumber()
  @Min(1)
  @Max(500)
  radiusMiles: number;

  @ApiPropertyOptional({ description: 'Optional destination filter', type: GeoPointDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoPointDto)
  destination?: GeoPointDto;

  @ApiPropertyOptional({ example: 300, description: 'Max destination radius in miles' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  destinationRadiusMiles?: number;

  @ApiPropertyOptional({ example: ['DRY_VAN', 'REEFER'], description: 'Equipment types' })
  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @ApiPropertyOptional({ example: 40000, description: 'Maximum weight in lbs' })
  @IsOptional()
  @IsNumber()
  maxWeight?: number;
}

export class RadiusSearchResultDto {
  @ApiProperty()
  load: LoadPostingDto;

  @ApiProperty({ example: 45.2, description: 'Distance from nearest origin in miles' })
  distanceFromOrigin: number;

  @ApiProperty({ example: 0, description: 'Index of nearest origin point' })
  nearestOriginIndex: number;

  @ApiProperty({ example: 350.5, description: 'Total route distance in miles' })
  totalRouteDistance: number;

  @ApiProperty({ example: 2.85, description: 'Rate per mile' })
  ratePerMile: number;
}
```

```typescript
// src/modules/load-board/controllers/geo-search.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GeoSearchService } from '../services/geo-search.service';
import { RadiusSearchDto, RadiusSearchResultDto } from '../dto/geo-search.dto';

@ApiTags('Load Board - Geo Search')
@ApiBearerAuth()
@Controller('load-board/search')
export class GeoSearchController {
  constructor(private readonly geoSearchService: GeoSearchService) {}

  @Post('radius')
  @ApiOperation({
    summary: 'Search loads within radius',
    description: 'Find loads with pickup locations within specified radius of one or more origin points',
  })
  @ApiResponse({
    status: 200,
    description: 'Loads within search radius',
    type: [RadiusSearchResultDto],
  })
  async searchByRadius(@Body() dto: RadiusSearchDto): Promise<RadiusSearchResultDto[]> {
    return this.geoSearchService.searchByRadius(dto);
  }

  @Post('corridor')
  @ApiOperation({
    summary: 'Search loads along route corridor',
    description: 'Find loads with pickup/delivery points along a specified route corridor',
  })
  async searchAlongCorridor(@Body() dto: CorridorSearchDto) {
    return this.geoSearchService.searchAlongCorridor(dto);
  }

  @Post('deadhead')
  @ApiOperation({
    summary: 'Calculate deadhead for load',
    description: 'Calculate empty miles from current location to load pickup',
  })
  async calculateDeadhead(@Body() dto: DeadheadCalculationDto) {
    return this.geoSearchService.calculateDeadhead(dto);
  }

  @Post('backhaul')
  @ApiOperation({
    summary: 'Find backhaul opportunities',
    description: 'Find loads that provide return trip from delivery location',
  })
  async findBackhauls(@Body() dto: BackhaulSearchDto) {
    return this.geoSearchService.findBackhauls(dto);
  }
}
```

### Task 2: Route Corridor Search

Search for loads along a specified route:

```typescript
// src/modules/load-board/dto/corridor-search.dto.ts
export class CorridorSearchDto {
  @ApiProperty({ description: 'Route waypoints', type: [GeoPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeoPointDto)
  @ArrayMinSize(2)
  waypoints: GeoPointDto[];

  @ApiProperty({ example: 50, description: 'Corridor width in miles (each side)' })
  @IsNumber()
  @Min(10)
  @Max(150)
  corridorWidthMiles: number;

  @ApiPropertyOptional({ example: true, description: 'Include loads going in same direction' })
  @IsOptional()
  sameDirection?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Max deviation from route in miles' })
  @IsOptional()
  @IsNumber()
  maxDeviationMiles?: number;
}
```

```typescript
// src/modules/load-board/services/geo-search.service.ts
@Injectable()
export class GeoSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  async searchAlongCorridor(dto: CorridorSearchDto) {
    const { waypoints, corridorWidthMiles, maxDeviationMiles = 100 } = dto;
    
    // Get all active load postings
    const postings = await this.prisma.loadPosting.findMany({
      where: { status: 'ACTIVE' },
      include: { load: true },
    });

    const results = [];

    for (const posting of postings) {
      const pickup = { lat: posting.pickupLat, lng: posting.pickupLng };
      const delivery = { lat: posting.deliveryLat, lng: posting.deliveryLng };

      // Check if pickup is within corridor
      const pickupDistance = this.distanceToPolyline(pickup, waypoints);
      if (pickupDistance > corridorWidthMiles) continue;

      // Check if delivery doesn't deviate too much
      const deliveryDistance = this.distanceToPolyline(delivery, waypoints);
      if (deliveryDistance > maxDeviationMiles) continue;

      // Calculate route deviation
      const deviation = this.calculateRouteDeviation(waypoints, pickup, delivery);

      results.push({
        posting,
        pickupDistanceFromRoute: pickupDistance,
        deliveryDistanceFromRoute: deliveryDistance,
        totalDeviation: deviation,
        addedMiles: this.calculateAddedMiles(waypoints, pickup, delivery),
      });
    }

    // Sort by least deviation
    return results.sort((a, b) => a.totalDeviation - b.totalDeviation);
  }

  private distanceToPolyline(point: GeoPoint, polyline: GeoPoint[]): number {
    let minDistance = Infinity;

    for (let i = 0; i < polyline.length - 1; i++) {
      const segmentDistance = this.distanceToSegment(
        point,
        polyline[i],
        polyline[i + 1],
      );
      minDistance = Math.min(minDistance, segmentDistance);
    }

    return minDistance;
  }

  private distanceToSegment(point: GeoPoint, start: GeoPoint, end: GeoPoint): number {
    // Project point onto line segment and calculate distance
    const A = point.lat - start.lat;
    const B = point.lng - start.lng;
    const C = end.lat - start.lat;
    const D = end.lng - start.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let closest: GeoPoint;

    if (param < 0) {
      closest = start;
    } else if (param > 1) {
      closest = end;
    } else {
      closest = {
        lat: start.lat + param * C,
        lng: start.lng + param * D,
      };
    }

    return calculateDistance(point, closest);
  }
}
```

### Task 3: Deadhead Calculation

Calculate empty miles and optimize load selection:

```typescript
// src/modules/load-board/dto/deadhead.dto.ts
export class DeadheadCalculationDto {
  @ApiProperty({ description: 'Current truck location', type: GeoPointDto })
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation: GeoPointDto;

  @ApiProperty({ description: 'Load posting ID' })
  @IsString()
  loadPostingId: string;
}

export class DeadheadResultDto {
  @ApiProperty({ example: 45.2, description: 'Deadhead miles to pickup' })
  deadheadMiles: number;

  @ApiProperty({ example: 350.5, description: 'Loaded miles' })
  loadedMiles: number;

  @ApiProperty({ example: 395.7, description: 'Total trip miles' })
  totalMiles: number;

  @ApiProperty({ example: 0.886, description: 'Loaded ratio (loaded/total)' })
  loadedRatio: number;

  @ApiProperty({ example: 2.53, description: 'Effective rate per mile (rate/total miles)' })
  effectiveRatePerMile: number;

  @ApiProperty({ example: '1h 15m', description: 'Estimated deadhead drive time' })
  estimatedDeadheadTime: string;
}

export class BatchDeadheadDto {
  @ApiProperty({ description: 'Current truck location', type: GeoPointDto })
  @ValidateNested()
  @Type(() => GeoPointDto)
  currentLocation: GeoPointDto;

  @ApiProperty({ description: 'Load posting IDs to evaluate' })
  @IsArray()
  @IsString({ each: true })
  loadPostingIds: string[];
}
```

```typescript
// In geo-search.service.ts
async calculateDeadhead(dto: DeadheadCalculationDto): Promise<DeadheadResultDto> {
  const posting = await this.prisma.loadPosting.findUnique({
    where: { id: dto.loadPostingId },
    include: { load: true },
  });

  if (!posting) {
    throw new NotFoundException('Load posting not found');
  }

  const pickup = { lat: posting.pickupLat, lng: posting.pickupLng };
  const delivery = { lat: posting.deliveryLat, lng: posting.deliveryLng };

  const deadheadMiles = calculateDistance(dto.currentLocation, pickup);
  const loadedMiles = calculateDistance(pickup, delivery);
  const totalMiles = deadheadMiles + loadedMiles;

  const loadedRatio = loadedMiles / totalMiles;
  const effectiveRatePerMile = posting.rate / totalMiles;

  // Estimate drive time (average 50 mph)
  const deadheadHours = deadheadMiles / 50;
  const hours = Math.floor(deadheadHours);
  const minutes = Math.round((deadheadHours - hours) * 60);

  return {
    deadheadMiles: Math.round(deadheadMiles * 10) / 10,
    loadedMiles: Math.round(loadedMiles * 10) / 10,
    totalMiles: Math.round(totalMiles * 10) / 10,
    loadedRatio: Math.round(loadedRatio * 1000) / 1000,
    effectiveRatePerMile: Math.round(effectiveRatePerMile * 100) / 100,
    estimatedDeadheadTime: `${hours}h ${minutes}m`,
  };
}

async calculateBatchDeadhead(dto: BatchDeadheadDto) {
  const results = await Promise.all(
    dto.loadPostingIds.map((id) =>
      this.calculateDeadhead({
        currentLocation: dto.currentLocation,
        loadPostingId: id,
      }).catch(() => null),
    ),
  );

  return results
    .filter((r) => r !== null)
    .sort((a, b) => b.effectiveRatePerMile - a.effectiveRatePerMile);
}
```

### Task 4: Backhaul Matching

Find loads for return trips:

```typescript
// src/modules/load-board/dto/backhaul.dto.ts
export class BackhaulSearchDto {
  @ApiProperty({ description: 'Delivery location (where truck will be after current load)' })
  @ValidateNested()
  @Type(() => GeoPointDto)
  deliveryLocation: GeoPointDto;

  @ApiProperty({ description: 'Home base or next destination' })
  @ValidateNested()
  @Type(() => GeoPointDto)
  targetDestination: GeoPointDto;

  @ApiProperty({ example: 100, description: 'Max pickup radius from delivery in miles' })
  @IsNumber()
  @Min(1)
  @Max(300)
  pickupRadiusMiles: number;

  @ApiProperty({ example: 150, description: 'Max delivery radius from target in miles' })
  @IsNumber()
  @Min(1)
  @Max(500)
  deliveryRadiusMiles: number;

  @ApiPropertyOptional({ description: 'Earliest pickup date/time' })
  @IsOptional()
  @IsDateString()
  earliestPickup?: string;

  @ApiPropertyOptional({ description: 'Latest pickup date/time' })
  @IsOptional()
  @IsDateString()
  latestPickup?: string;

  @ApiPropertyOptional({ example: ['DRY_VAN'], description: 'Equipment types' })
  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];
}

export class BackhaulResultDto {
  @ApiProperty()
  posting: LoadPostingDto;

  @ApiProperty({ example: 35.2, description: 'Miles from delivery to backhaul pickup' })
  pickupDeadhead: number;

  @ApiProperty({ example: 280.5, description: 'Backhaul loaded miles' })
  backhaulMiles: number;

  @ApiProperty({ example: 45.0, description: 'Miles from backhaul delivery to target' })
  remainingToTarget: number;

  @ApiProperty({ example: 360.7, description: 'Total miles for backhaul trip' })
  totalBackhaulMiles: number;

  @ApiProperty({ example: 0.78, description: 'Efficiency ratio' })
  efficiencyRatio: number;

  @ApiProperty({ example: 2.78, description: 'Effective rate per mile' })
  effectiveRatePerMile: number;
}
```

```typescript
// In geo-search.service.ts
async findBackhauls(dto: BackhaulSearchDto): Promise<BackhaulResultDto[]> {
  const { deliveryLocation, targetDestination, pickupRadiusMiles, deliveryRadiusMiles } = dto;

  // Find postings with pickup near delivery location
  const postings = await this.prisma.loadPosting.findMany({
    where: {
      status: 'ACTIVE',
      ...(dto.equipmentTypes && { equipmentType: { in: dto.equipmentTypes } }),
      ...(dto.earliestPickup && { pickupDate: { gte: new Date(dto.earliestPickup) } }),
      ...(dto.latestPickup && { pickupDate: { lte: new Date(dto.latestPickup) } }),
    },
    include: { load: true },
  });

  const results: BackhaulResultDto[] = [];

  for (const posting of postings) {
    const pickup = { lat: posting.pickupLat, lng: posting.pickupLng };
    const delivery = { lat: posting.deliveryLat, lng: posting.deliveryLng };

    // Check pickup is within radius of current delivery
    const pickupDeadhead = calculateDistance(deliveryLocation, pickup);
    if (pickupDeadhead > pickupRadiusMiles) continue;

    // Check delivery is within radius of target destination
    const remainingToTarget = calculateDistance(delivery, targetDestination);
    if (remainingToTarget > deliveryRadiusMiles) continue;

    const backhaulMiles = calculateDistance(pickup, delivery);
    const totalBackhaulMiles = pickupDeadhead + backhaulMiles + remainingToTarget;

    // Calculate what direct trip would be
    const directDistance = calculateDistance(deliveryLocation, targetDestination);
    const addedMiles = totalBackhaulMiles - directDistance;

    // Efficiency: how much of the trip is loaded vs empty
    const efficiencyRatio = backhaulMiles / totalBackhaulMiles;
    const effectiveRatePerMile = posting.rate / totalBackhaulMiles;

    results.push({
      posting,
      pickupDeadhead: Math.round(pickupDeadhead * 10) / 10,
      backhaulMiles: Math.round(backhaulMiles * 10) / 10,
      remainingToTarget: Math.round(remainingToTarget * 10) / 10,
      totalBackhaulMiles: Math.round(totalBackhaulMiles * 10) / 10,
      efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
      effectiveRatePerMile: Math.round(effectiveRatePerMile * 100) / 100,
    });
  }

  // Sort by effective rate per mile
  return results.sort((a, b) => b.effectiveRatePerMile - a.effectiveRatePerMile);
}
```

### Task 5: Geofence Alerts

Create geofence-based notifications for loads:

```typescript
// src/modules/load-board/dto/geofence.dto.ts
export class CreateGeofenceAlertDto {
  @ApiProperty({ description: 'Alert name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Center point for geofence', type: GeoPointDto })
  @ValidateNested()
  @Type(() => GeoPointDto)
  center: GeoPointDto;

  @ApiProperty({ example: 100, description: 'Radius in miles' })
  @IsNumber()
  @Min(10)
  @Max(500)
  radiusMiles: number;

  @ApiProperty({ enum: ['PICKUP', 'DELIVERY', 'BOTH'], description: 'Watch for pickup, delivery, or both' })
  @IsEnum(['PICKUP', 'DELIVERY', 'BOTH'])
  watchType: 'PICKUP' | 'DELIVERY' | 'BOTH';

  @ApiPropertyOptional({ example: ['DRY_VAN'], description: 'Equipment type filter' })
  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @ApiPropertyOptional({ example: 1000, description: 'Minimum rate filter' })
  @IsOptional()
  @IsNumber()
  minRate?: number;

  @ApiProperty({ description: 'Whether alert is active' })
  @IsBoolean()
  isActive: boolean;
}
```

```typescript
// src/modules/load-board/services/geofence-alert.service.ts
@Injectable()
export class GeofenceAlertService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('load-posting.created')
  async checkGeofenceAlerts(posting: LoadPosting) {
    const alerts = await this.prisma.geofenceAlert.findMany({
      where: { isActive: true },
    });

    for (const alert of alerts) {
      const shouldNotify = this.checkPostingMatchesAlert(posting, alert);
      if (shouldNotify) {
        await this.sendAlertNotification(alert, posting);
      }
    }
  }

  private checkPostingMatchesAlert(posting: LoadPosting, alert: GeofenceAlert): boolean {
    const pickup = { lat: posting.pickupLat, lng: posting.pickupLng };
    const delivery = { lat: posting.deliveryLat, lng: posting.deliveryLng };
    const center = { lat: alert.centerLat, lng: alert.centerLng };

    // Check equipment type
    if (alert.equipmentTypes?.length && !alert.equipmentTypes.includes(posting.equipmentType)) {
      return false;
    }

    // Check minimum rate
    if (alert.minRate && posting.rate < alert.minRate) {
      return false;
    }

    // Check location based on watch type
    const pickupInRange = isWithinRadius(center, pickup, alert.radiusMiles);
    const deliveryInRange = isWithinRadius(center, delivery, alert.radiusMiles);

    switch (alert.watchType) {
      case 'PICKUP':
        return pickupInRange;
      case 'DELIVERY':
        return deliveryInRange;
      case 'BOTH':
        return pickupInRange || deliveryInRange;
    }
  }

  private async sendAlertNotification(alert: GeofenceAlert, posting: LoadPosting) {
    await this.notificationService.create({
      userId: alert.userId,
      type: 'GEOFENCE_ALERT',
      title: `New load in ${alert.name} area`,
      message: `${posting.originCity} → ${posting.destinationCity} - $${posting.rate}`,
      data: { alertId: alert.id, postingId: posting.id },
    });
  }
}
```

### Task 6: Update Module Registration

```typescript
// src/modules/load-board/load-board.module.ts
import { Module } from '@nestjs/common';
import { GeoSearchController } from './controllers/geo-search.controller';
import { GeoSearchService } from './services/geo-search.service';
import { GeofenceAlertService } from './services/geofence-alert.service';
import { GeocodingService } from './services/geocoding.service';

@Module({
  controllers: [
    // ... existing controllers
    GeoSearchController,
  ],
  providers: [
    // ... existing providers
    GeoSearchService,
    GeofenceAlertService,
    GeocodingService,
  ],
  exports: [GeoSearchService],
})
export class LoadBoardModule {}
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/load-board/search/radius` | Multi-origin radius search |
| POST | `/load-board/search/corridor` | Route corridor search |
| POST | `/load-board/search/deadhead` | Calculate deadhead for single load |
| POST | `/load-board/search/deadhead/batch` | Calculate deadhead for multiple loads |
| POST | `/load-board/search/backhaul` | Find backhaul opportunities |
| POST | `/load-board/geofence-alerts` | Create geofence alert |
| GET | `/load-board/geofence-alerts` | List user's geofence alerts |
| PATCH | `/load-board/geofence-alerts/:id` | Update geofence alert |
| DELETE | `/load-board/geofence-alerts/:id` | Delete geofence alert |

---

## Verification Checklist

### Functionality
- [ ] Radius search returns accurate results
- [ ] Corridor search filters correctly
- [ ] Deadhead calculations are accurate
- [ ] Backhaul matching works properly
- [ ] Geofence alerts trigger correctly

### Performance
- [ ] Search queries execute < 500ms
- [ ] Batch operations handle 100+ items
- [ ] Geofence checks don't slow posting creation

### Documentation
- [ ] All endpoints have Swagger docs
- [ ] DTOs are fully documented
- [ ] Examples are realistic

---

## Acceptance Criteria

1. **Advanced Radius Search**
   - Multiple origin points supported
   - Destination filtering works
   - Results sorted by distance

2. **Route Corridor Search**
   - Finds loads along specified route
   - Calculates deviation accurately
   - Supports configurable corridor width

3. **Deadhead Calculations**
   - Accurate distance calculations
   - Effective rate per mile computed
   - Batch processing supported

4. **Backhaul Matching**
   - Finds appropriate return loads
   - Efficiency metrics calculated
   - Time window filtering works

5. **Geofence Alerts**
   - CRUD operations for alerts
   - Real-time notifications on match
   - Equipment and rate filtering

---

## Progress Tracker Update

After completing this prompt, update the README.md:

```markdown
| Metric | Before | Current | Target |
|--------|--------|---------|--------|
| Geo-Search | 100% | 100%+ | Advanced |
```

Add changelog entry:
```markdown
### YYYY-MM-DD - Prompt 16: Load Board Geo-Search
**Completed by:** [Name]
**Time spent:** [X hours]

#### Changes
- Added advanced radius search with multiple origins
- Added route corridor search
- Added deadhead calculation endpoints
- Added backhaul matching
- Added geofence alerts

#### Endpoints Added
- POST /load-board/search/radius
- POST /load-board/search/corridor
- POST /load-board/search/deadhead
- POST /load-board/search/backhaul
- CRUD /load-board/geofence-alerts
```
