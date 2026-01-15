# Prompt 05: TMS Core Completion

**Priority:** P1 (High)  
**Estimated Time:** 4-6 hours  
**Dependencies:** P0 prompts completed  
**Current Coverage:** 85% → Target: 100%

---

## Objective

Complete the TMS Core service by implementing remaining order template, check call retrieval, rate confirmation PDF generation, and live tracking endpoints to achieve 100% API coverage for core transportation management functionality.

---

## Missing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orders/from-template/:templateId` | POST | Create order from template |
| `/loads/:id/check-calls` | GET | List check calls for load |
| `/loads/:id/rate-confirmation` | POST | Generate rate confirmation PDF |
| `/tracking/map` | GET | Live tracking map data |
| `/tracking/loads/:id/history` | GET | Location history for load |

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/modules/tms/tracking.controller.ts` | Tracking endpoints |
| `apps/api/src/modules/tms/tracking.service.ts` | Tracking business logic |
| `apps/api/src/modules/tms/dto/tracking.dto.ts` | Tracking DTOs |
| `apps/api/src/modules/tms/dto/rate-confirmation.dto.ts` | Rate confirmation DTOs |

## Files to Modify

| File | Changes |
|------|---------|
| `apps/api/src/modules/tms/orders.controller.ts` | Add template endpoint |
| `apps/api/src/modules/tms/orders.service.ts` | Add template creation logic |
| `apps/api/src/modules/tms/loads.controller.ts` | Add check-calls and rate-confirmation |
| `apps/api/src/modules/tms/loads.service.ts` | Add related service methods |
| `apps/api/src/modules/tms/tms.module.ts` | Register new controller/service |

---

## Implementation Steps

### Step 1: Add Order Template Endpoint

**File: `apps/api/src/modules/tms/dto/create-order-from-template.dto.ts`**

```typescript
import { IsUUID, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderFromTemplateDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopOverrideDto)
  stopOverrides?: StopOverrideDto[];
}

export class StopOverrideDto {
  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  appointmentTime?: string;
}
```

**File: `apps/api/src/modules/tms/orders.controller.ts`** - Add endpoint:

```typescript
@Post('from-template/:templateId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCHER', 'SALES_REP')
async createFromTemplate(
  @Param('templateId') templateId: string,
  @Body() dto: CreateOrderFromTemplateDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: AuthUser,
) {
  const order = await this.ordersService.createFromTemplate(
    tenantId,
    user.id,
    templateId,
    dto,
  );
  return created(order, 'Order created from template');
}
```

**File: `apps/api/src/modules/tms/orders.service.ts`** - Add service method:

```typescript
async createFromTemplate(
  tenantId: string,
  userId: string,
  templateId: string,
  overrides: CreateOrderFromTemplateDto,
): Promise<Order> {
  // 1. Fetch template
  const template = await this.prisma.orderTemplate.findFirst({
    where: { id: templateId, tenantId, deletedAt: null },
    include: { stops: true, items: true },
  });

  if (!template) {
    throw new NotFoundException('Order template not found');
  }

  // 2. Merge template with overrides
  const orderData = {
    tenantId,
    createdById: userId,
    customerId: overrides.customerId || template.customerId,
    poNumber: overrides.poNumber || template.poNumber,
    referenceNumber: overrides.referenceNumber,
    status: 'DRAFT',
    // ... other fields from template
  };

  // 3. Create order with stops
  const order = await this.prisma.order.create({
    data: {
      ...orderData,
      stops: {
        create: template.stops.map((stop, index) => ({
          ...stop,
          id: undefined, // New ID
          orderId: undefined,
          appointmentDate: overrides.stopOverrides?.[index]?.appointmentDate || stop.appointmentDate,
          // Apply other overrides
        })),
      },
    },
    include: { stops: true },
  });

  // 4. Emit event
  this.eventEmitter.emit('order.created', { order, fromTemplate: templateId });

  return order;
}
```

### Step 2: Add Check Calls Endpoint

**File: `apps/api/src/modules/tms/loads.controller.ts`** - Add endpoint:

```typescript
@Get(':id/check-calls')
@UseGuards(JwtAuthGuard)
async getCheckCalls(
  @Param('id') loadId: string,
  @Query() query: PaginationDto,
  @CurrentTenant() tenantId: string,
) {
  const result = await this.loadsService.getCheckCalls(tenantId, loadId, query);
  return paginated(result.data, result.total, query.page || 1, query.limit || 20);
}
```

**File: `apps/api/src/modules/tms/loads.service.ts`** - Add service method:

```typescript
async getCheckCalls(
  tenantId: string,
  loadId: string,
  params: PaginationDto,
): Promise<{ data: CheckCall[]; total: number }> {
  const { page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  // Verify load exists and belongs to tenant
  const load = await this.prisma.load.findFirst({
    where: { id: loadId, tenantId, deletedAt: null },
  });

  if (!load) {
    throw new NotFoundException('Load not found');
  }

  const [data, total] = await Promise.all([
    this.prisma.checkCall.findMany({
      where: { loadId },
      include: {
        driver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.checkCall.count({ where: { loadId } }),
  ]);

  return { data, total };
}
```

### Step 3: Add Rate Confirmation PDF Endpoint

**File: `apps/api/src/modules/tms/dto/rate-confirmation.dto.ts`**

```typescript
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class RateConfirmationOptionsDto {
  @IsOptional()
  @IsBoolean()
  includeAccessorials?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeTerms?: boolean = true;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsBoolean()
  sendToCarrier?: boolean = false;
}
```

**File: `apps/api/src/modules/tms/loads.controller.ts`** - Add endpoint:

```typescript
import { Res } from '@nestjs/common';
import { Response } from 'express';

@Post(':id/rate-confirmation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCHER')
async generateRateConfirmation(
  @Param('id') loadId: string,
  @Body() options: RateConfirmationOptionsDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: AuthUser,
  @Res() res: Response,
) {
  const pdfBuffer = await this.loadsService.generateRateConfirmation(
    tenantId,
    loadId,
    options,
    user.id,
  );

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="rate-confirmation-${loadId}.pdf"`,
    'Content-Length': pdfBuffer.length,
  });

  res.send(pdfBuffer);
}
```

**File: `apps/api/src/modules/tms/loads.service.ts`** - Add service method:

```typescript
async generateRateConfirmation(
  tenantId: string,
  loadId: string,
  options: RateConfirmationOptionsDto,
  userId: string,
): Promise<Buffer> {
  // 1. Fetch load with all related data
  const load = await this.prisma.load.findFirst({
    where: { id: loadId, tenantId, deletedAt: null },
    include: {
      order: {
        include: { customer: true },
      },
      carrier: true,
      stops: { orderBy: { sequence: 'asc' } },
    },
  });

  if (!load) {
    throw new NotFoundException('Load not found');
  }

  if (!load.carrierId) {
    throw new BadRequestException('Load must be assigned to a carrier');
  }

  // 2. Generate PDF (using PDFKit or similar)
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Header
  doc.fontSize(20).text('RATE CONFIRMATION', { align: 'center' });
  doc.moveDown();

  // Load Info
  doc.fontSize(12);
  doc.text(`Load #: ${load.loadNumber}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Carrier Info
  doc.text('CARRIER INFORMATION', { underline: true });
  doc.text(`Company: ${load.carrier?.name}`);
  doc.text(`MC#: ${load.carrier?.mcNumber}`);
  doc.text(`DOT#: ${load.carrier?.dotNumber}`);
  doc.moveDown();

  // Rate Info
  doc.text('RATE DETAILS', { underline: true });
  doc.text(`Line Haul: $${load.carrierRate?.toFixed(2) || '0.00'}`);
  if (options.includeAccessorials) {
    // Add accessorial charges
  }
  doc.moveDown();

  // Stops
  doc.text('STOPS', { underline: true });
  for (const stop of load.stops) {
    doc.text(`${stop.type}: ${stop.facilityName}`);
    doc.text(`  ${stop.address}, ${stop.city}, ${stop.state} ${stop.zip}`);
    doc.text(`  Appointment: ${stop.appointmentDate} ${stop.appointmentTime || ''}`);
    doc.moveDown(0.5);
  }

  if (options.includeTerms) {
    doc.addPage();
    doc.text('TERMS AND CONDITIONS', { underline: true });
    doc.fontSize(10);
    doc.text('Standard carrier terms and conditions apply...');
  }

  // Signature line
  doc.moveDown(2);
  doc.text('_________________________________');
  doc.text('Carrier Signature                Date');

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
```

### Step 4: Create Tracking Controller

**File: `apps/api/src/modules/tms/dto/tracking.dto.ts`**

```typescript
import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, IsArray } from 'class-validator';

export enum TrackingFilterStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  AT_PICKUP = 'AT_PICKUP',
  AT_DELIVERY = 'AT_DELIVERY',
  DELIVERED = 'DELIVERED',
}

export class TrackingMapFilterDto {
  @IsOptional()
  @IsArray()
  @IsEnum(TrackingFilterStatus, { each: true })
  status?: TrackingFilterStatus[];

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class LocationHistoryQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 100;
}

export class TrackingPointDto {
  loadId: string;
  loadNumber: string;
  status: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
  driver?: {
    id: string;
    name: string;
    phone?: string;
  };
  carrier?: {
    id: string;
    name: string;
  };
  eta?: Date;
  nextStop?: {
    type: string;
    city: string;
    state: string;
  };
}

export class LocationHistoryDto {
  timestamp: Date;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  eventType?: string;
  notes?: string;
}
```

**File: `apps/api/src/modules/tms/tracking.controller.ts`**

```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentTenant } from '../../common/decorators';
import { TrackingService } from './tracking.service';
import { TrackingMapFilterDto, LocationHistoryQueryDto } from './dto/tracking.dto';
import { ok, paginated } from '../../common/helpers/response.helper';

@Controller('tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('map')
  async getMapData(
    @Query() filters: TrackingMapFilterDto,
    @CurrentTenant() tenantId: string,
  ) {
    const data = await this.trackingService.getMapData(tenantId, filters);
    return ok(data);
  }

  @Get('loads/:id/history')
  async getLocationHistory(
    @Param('id') loadId: string,
    @Query() query: LocationHistoryQueryDto,
    @CurrentTenant() tenantId: string,
  ) {
    const history = await this.trackingService.getLocationHistory(
      tenantId,
      loadId,
      query,
    );
    return ok(history);
  }
}
```

**File: `apps/api/src/modules/tms/tracking.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TrackingMapFilterDto, LocationHistoryQueryDto, TrackingPointDto, LocationHistoryDto } from './dto/tracking.dto';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getMapData(
    tenantId: string,
    filters: TrackingMapFilterDto,
  ): Promise<TrackingPointDto[]> {
    // Build where clause
    const where: any = {
      tenantId,
      deletedAt: null,
      status: { in: ['IN_TRANSIT', 'AT_PICKUP', 'AT_DELIVERY', 'DISPATCHED'] },
    };

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }
    if (filters.customerId) {
      where.order = { customerId: filters.customerId };
    }
    if (filters.carrierId) {
      where.carrierId = filters.carrierId;
    }

    // Fetch loads with current position
    const loads = await this.prisma.load.findMany({
      where,
      select: {
        id: true,
        loadNumber: true,
        status: true,
        currentLatitude: true,
        currentLongitude: true,
        currentSpeed: true,
        currentHeading: true,
        locationUpdatedAt: true,
        eta: true,
        driver: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        carrier: {
          select: { id: true, name: true },
        },
        stops: {
          where: { status: { in: ['PENDING', 'EN_ROUTE'] } },
          orderBy: { sequence: 'asc' },
          take: 1,
          select: { type: true, city: true, state: true },
        },
      },
    });

    return loads
      .filter(load => load.currentLatitude && load.currentLongitude)
      .map(load => ({
        loadId: load.id,
        loadNumber: load.loadNumber,
        status: load.status,
        latitude: load.currentLatitude!,
        longitude: load.currentLongitude!,
        speed: load.currentSpeed || undefined,
        heading: load.currentHeading || undefined,
        timestamp: load.locationUpdatedAt || new Date(),
        driver: load.driver ? {
          id: load.driver.id,
          name: `${load.driver.firstName} ${load.driver.lastName}`,
          phone: load.driver.phone || undefined,
        } : undefined,
        carrier: load.carrier ? {
          id: load.carrier.id,
          name: load.carrier.name,
        } : undefined,
        eta: load.eta || undefined,
        nextStop: load.stops[0] || undefined,
      }));
  }

  async getLocationHistory(
    tenantId: string,
    loadId: string,
    query: LocationHistoryQueryDto,
  ): Promise<LocationHistoryDto[]> {
    // Verify load exists
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId, deletedAt: null },
    });

    if (!load) {
      throw new NotFoundException('Load not found');
    }

    // Build where clause for check calls (which contain location data)
    const where: any = { loadId };
    
    if (query.fromDate) {
      where.timestamp = { ...where.timestamp, gte: new Date(query.fromDate) };
    }
    if (query.toDate) {
      where.timestamp = { ...where.timestamp, lte: new Date(query.toDate) };
    }

    const checkCalls = await this.prisma.checkCall.findMany({
      where,
      select: {
        timestamp: true,
        latitude: true,
        longitude: true,
        speed: true,
        heading: true,
        callType: true,
        notes: true,
      },
      orderBy: { timestamp: 'asc' },
      take: query.limit || 100,
    });

    return checkCalls
      .filter(cc => cc.latitude && cc.longitude)
      .map(cc => ({
        timestamp: cc.timestamp,
        latitude: cc.latitude!,
        longitude: cc.longitude!,
        speed: cc.speed || undefined,
        heading: cc.heading || undefined,
        eventType: cc.callType,
        notes: cc.notes || undefined,
      }));
  }
}
```

### Step 5: Update TMS Module

**File: `apps/api/src/modules/tms/tms.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { LoadsController } from './loads.controller';
import { LoadsService } from './loads.service';
import { StopsController } from './stops.controller';
import { StopsService } from './stops.service';
import { TrackingController } from './tracking.controller';  // ADD
import { TrackingService } from './tracking.service';        // ADD
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [
    OrdersController,
    LoadsController,
    StopsController,
    TrackingController,  // ADD
  ],
  providers: [
    OrdersService,
    LoadsService,
    StopsService,
    TrackingService,    // ADD
    PrismaService,
  ],
  exports: [OrdersService, LoadsService, StopsService, TrackingService],
})
export class TmsModule {}
```

---

## Acceptance Criteria

- [ ] `POST /orders/from-template/:templateId` creates order with template defaults
- [ ] Template overrides (dates, PO, stops) are properly applied
- [ ] `GET /loads/:id/check-calls` returns paginated check call history
- [ ] `POST /loads/:id/rate-confirmation` generates valid PDF document
- [ ] PDF includes carrier info, rates, stops, terms
- [ ] `GET /tracking/map` returns real-time positions for active loads
- [ ] `GET /tracking/loads/:id/history` returns chronological location data
- [ ] All endpoints have proper authentication and authorization
- [ ] All endpoints include proper input validation
- [ ] E2E tests cover new endpoints

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 05 row in the status table:
```markdown
| 05 | [TMS Core Completion](...) | P1 | 4-6h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Endpoint Coverage | 84.3% | 88% | 95% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 05: TMS Core Completion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Added POST /orders/from-template/:templateId endpoint
- Added GET /loads/:id/check-calls endpoint
- Added POST /loads/:id/rate-confirmation with PDF generation
- Created tracking controller with map and history endpoints
- TMS Core now at 100% endpoint coverage (45/45 endpoints)

#### Metrics Updated
- Endpoint Coverage: 84.3% → 88%
```
