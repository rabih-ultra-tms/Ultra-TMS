# Prompt 11: Swagger Documentation Completion

**Priority:** P3 (Post-Frontend Readiness)  
**Estimated Time:** 6-8 hours  
**Dependencies:** All P0, P1, P2 prompts completed  
**Current Coverage:** ~60% → Target: 100%

---

## Objective

Complete Swagger/OpenAPI documentation coverage from 60% to 100% across all Phase A services. This ensures frontend developers have comprehensive API documentation for every endpoint.

---

## Current State Analysis

### Documentation Coverage by Service

| Service | Controllers | Documented | Coverage | Status |
|---------|-------------|------------|----------|--------|
| Auth | 2 | 2 | 100% | ✅ Complete |
| Users | 1 | 1 | 100% | ✅ Complete |
| Tenants | 1 | 1 | 100% | ✅ Complete |
| Customers | 1 | 0.5 | 50% | ⚠️ Partial |
| Contacts | 1 | 0.5 | 50% | ⚠️ Partial |
| Activities | 1 | 0.3 | 30% | ❌ Minimal |
| Orders | 1 | 0.6 | 60% | ⚠️ Partial |
| Loads | 1 | 0.6 | 60% | ⚠️ Partial |
| Dispatch | 1 | 0.4 | 40% | ❌ Minimal |
| Tracking | 1 | 0.5 | 50% | ⚠️ Partial |
| Carriers | 1 | 0.7 | 70% | ⚠️ Partial |
| Compliance | 1 | 0.4 | 40% | ❌ Minimal |
| Invoices | 1 | 0.5 | 50% | ⚠️ Partial |
| Payments | 1 | 0.5 | 50% | ⚠️ Partial |
| Load Board | 3 | 0.3 | 30% | ❌ Minimal |
| Audit | 1 | 0.8 | 80% | ⚠️ Partial |
| Config | 1 | 0.9 | 90% | ⚠️ Partial |

---

## Implementation Steps

### Step 1: Create Standard Swagger Decorators Library

**File: `apps/api/src/common/swagger/index.ts`**

```typescript
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';

// Standard success response
export function ApiStandardResponse(description: string, type?: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: type ? {
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: `#/components/schemas/${type.name}` },
          meta: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              requestId: { type: 'string' },
            },
          },
        },
      } : undefined,
    }),
  );
}

// Paginated response
export function ApiPaginatedResponse(description: string, type: any) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${type.name}` },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
              hasNextPage: { type: 'boolean' },
              hasPrevPage: { type: 'boolean' },
            },
          },
        },
      },
    }),
  );
}

// Standard error responses
export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation error',
      schema: {
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing token',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource does not exist',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );
}

// CRUD operation decorators
export function ApiCreate(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Create ${entityName}` }),
    ApiBearerAuth(),
    ApiBody({ type: dto }),
    ApiResponse({ status: 201, description: `${entityName} created successfully` }),
    ApiErrorResponses(),
  );
}

export function ApiList(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `List ${entityName}s` }),
    ApiBearerAuth(),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiPaginatedResponse(`List of ${entityName}s`, dto),
    ApiErrorResponses(),
  );
}

export function ApiGetById(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Get ${entityName} by ID` }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiStandardResponse(`${entityName} details`, dto),
    ApiErrorResponses(),
  );
}

export function ApiUpdate(entityName: string, dto?: any) {
  return applyDecorators(
    ApiOperation({ summary: `Update ${entityName}` }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiBody({ type: dto }),
    ApiStandardResponse(`${entityName} updated successfully`, dto),
    ApiErrorResponses(),
  );
}

export function ApiDelete(entityName: string) {
  return applyDecorators(
    ApiOperation({ summary: `Delete ${entityName}` }),
    ApiBearerAuth(),
    ApiParam({ name: 'id', description: `${entityName} ID` }),
    ApiResponse({ status: 200, description: `${entityName} deleted successfully` }),
    ApiErrorResponses(),
  );
}
```

---

### Step 2: Document CRM Module (Customers, Contacts, Activities)

**File: `apps/api/src/modules/crm/customers/customers.controller.ts`**

Add to each endpoint:

```typescript
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ApiList, ApiCreate, ApiGetById, ApiUpdate, ApiDelete, ApiErrorResponses } from '../../../common/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  
  @Get()
  @ApiList('Customer', CustomerResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: CustomerStatus })
  @ApiQuery({ name: 'type', required: false, enum: CustomerType })
  @ApiQuery({ name: 'salesRepId', required: false, type: String })
  async findAll(@CurrentTenant() tenantId: string, @Query() query: CustomerQueryDto) {
    // ...
  }

  @Post()
  @ApiCreate('Customer', CreateCustomerDto)
  async create(@CurrentTenant() tenantId: string, @Body() dto: CreateCustomerDto) {
    // ...
  }

  @Get(':id')
  @ApiGetById('Customer', CustomerResponseDto)
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    // ...
  }

  @Patch(':id')
  @ApiUpdate('Customer', UpdateCustomerDto)
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    // ...
  }

  @Delete(':id')
  @ApiDelete('Customer')
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    // ...
  }

  @Post(':id/convert-to-account')
  @ApiOperation({ summary: 'Convert lead to active customer account' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Customer ID (lead)' })
  @ApiResponse({ status: 200, description: 'Lead converted to customer account' })
  @ApiErrorResponses()
  async convertToAccount(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    // ...
  }
}
```

**Contacts Controller - Add decorators:**

```typescript
@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  
  @Get()
  @ApiList('Contact', ContactResponseDto)
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'isPrimary', required: false, type: Boolean })
  async findAll() {}

  @Post()
  @ApiCreate('Contact', CreateContactDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Contact', ContactResponseDto)
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Contact', UpdateContactDto)
  async update() {}

  @Delete(':id')
  @ApiDelete('Contact')
  async remove() {}

  @Post(':id/set-primary')
  @ApiOperation({ summary: 'Set contact as primary for customer' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact set as primary' })
  async setPrimary() {}
}
```

**Activities Controller - Add decorators:**

```typescript
@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  
  @Get()
  @ApiList('Activity', ActivityResponseDto)
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ActivityType })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date' })
  async findAll() {}

  @Post()
  @ApiCreate('Activity', CreateActivityDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Activity', ActivityResponseDto)
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Activity', UpdateActivityDto)
  async update() {}

  @Delete(':id')
  @ApiDelete('Activity')
  async remove() {}

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark activity as completed' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiBody({ schema: { properties: { notes: { type: 'string' }, outcome: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Activity marked as completed' })
  async complete() {}
}
```

---

### Step 3: Document TMS Core Module (Orders, Loads, Dispatch, Tracking)

**Orders Controller:**

```typescript
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  
  @Get()
  @ApiList('Order', OrderResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date' })
  async findAll() {}

  @Post()
  @ApiCreate('Order', CreateOrderDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Order', OrderResponseDto)
  @ApiQuery({ name: 'include', required: false, description: 'Related data to include (stops,loads,documents)' })
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Order', UpdateOrderDto)
  async update() {}

  @Delete(':id')
  @ApiDelete('Order')
  async remove() {}

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'] }, reason: { type: 'string' } } } })
  async updateStatus() {}

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone an existing order' })
  @ApiParam({ name: 'id', description: 'Order ID to clone' })
  @ApiResponse({ status: 201, description: 'Order cloned successfully' })
  async clone() {}

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get order timeline/history' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async getTimeline() {}

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get order documents' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async getDocuments() {}
}
```

**Loads Controller:**

```typescript
@ApiTags('Loads')
@ApiBearerAuth()
@Controller('loads')
export class LoadsController {
  
  @Get()
  @ApiList('Load', LoadResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: LoadStatus })
  @ApiQuery({ name: 'carrierId', required: false, type: String })
  @ApiQuery({ name: 'driverId', required: false, type: String })
  @ApiQuery({ name: 'dispatcherId', required: false, type: String })
  @ApiQuery({ name: 'pickupDateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'pickupDateTo', required: false, type: String, format: 'date' })
  async findAll() {}

  @Post()
  @ApiCreate('Load', CreateLoadDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Load', LoadResponseDto)
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Load', UpdateLoadDto)
  async update() {}

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign carrier and driver to load' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiBody({
    schema: {
      properties: {
        carrierId: { type: 'string' },
        driverId: { type: 'string' },
        driverPhone: { type: 'string' },
        truckNumber: { type: 'string' },
        trailerNumber: { type: 'string' },
        rate: { type: 'number' },
      },
      required: ['carrierId'],
    },
  })
  async assign() {}

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update load status' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiBody({
    schema: {
      properties: {
        status: { type: 'string', enum: ['PENDING', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'] },
        notes: { type: 'string' },
      },
      required: ['status'],
    },
  })
  async updateStatus() {}

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get load tracking history' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  async getTracking() {}

  @Post(':id/tracking')
  @ApiOperation({ summary: 'Add tracking update' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiBody({
    schema: {
      properties: {
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        city: { type: 'string' },
        state: { type: 'string' },
        notes: { type: 'string' },
        eventType: { type: 'string', enum: ['LOCATION_UPDATE', 'PICKUP', 'DELIVERY', 'DELAY', 'ISSUE'] },
      },
    },
  })
  async addTracking() {}
}
```

**Dispatch Controller:**

```typescript
@ApiTags('Dispatch')
@ApiBearerAuth()
@Controller('dispatch')
export class DispatchController {
  
  @Get('board')
  @ApiOperation({ summary: 'Get dispatch board view' })
  @ApiQuery({ name: 'date', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dispatcherId', required: false, type: String })
  @ApiQuery({ name: 'view', required: false, enum: ['DAY', 'WEEK', 'MONTH'] })
  async getBoard() {}

  @Get('unassigned')
  @ApiOperation({ summary: 'Get unassigned loads requiring dispatch' })
  @ApiQuery({ name: 'urgencyLevel', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  async getUnassigned() {}

  @Post('bulk-assign')
  @ApiOperation({ summary: 'Bulk assign loads to carriers' })
  @ApiBody({
    schema: {
      properties: {
        assignments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              loadId: { type: 'string' },
              carrierId: { type: 'string' },
              driverId: { type: 'string' },
              rate: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async bulkAssign() {}

  @Get('carrier-availability')
  @ApiOperation({ summary: 'Get available carriers for dispatch' })
  @ApiQuery({ name: 'originState', required: false, type: String })
  @ApiQuery({ name: 'equipmentType', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String, format: 'date' })
  async getCarrierAvailability() {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dispatch metrics/KPIs' })
  @ApiQuery({ name: 'dateFrom', required: true, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: true, type: String, format: 'date' })
  async getMetrics() {}
}
```

---

### Step 4: Document Carrier Module

```typescript
@ApiTags('Carriers')
@ApiBearerAuth()
@Controller('carriers')
export class CarriersController {
  
  @Get()
  @ApiList('Carrier', CarrierResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: CarrierStatus })
  @ApiQuery({ name: 'tier', required: false, enum: ['PREFERRED', 'APPROVED', 'STANDARD', 'PROBATION'] })
  @ApiQuery({ name: 'equipmentTypes', required: false, type: [String] })
  @ApiQuery({ name: 'serviceStates', required: false, type: [String] })
  async findAll() {}

  @Post()
  @ApiCreate('Carrier', CreateCarrierDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Carrier', CarrierResponseDto)
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Carrier', UpdateCarrierDto)
  async update() {}

  @Delete(':id')
  @ApiDelete('Carrier')
  async remove() {}

  @Get(':id/compliance')
  @ApiOperation({ summary: 'Get carrier compliance status' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  async getCompliance() {}

  @Post(':id/compliance/documents')
  @ApiOperation({ summary: 'Upload compliance document' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'string', enum: ['INSURANCE_COI', 'W9', 'MC_AUTHORITY', 'OPERATING_AUTHORITY', 'SAFETY_RATING'] },
        expirationDate: { type: 'string', format: 'date' },
      },
    },
  })
  async uploadComplianceDoc() {}

  @Get(':id/scorecard')
  @ApiOperation({ summary: 'Get carrier performance scorecard' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date' })
  async getScorecard() {}

  @Get(':id/loads')
  @ApiOperation({ summary: 'Get carrier load history' })
  @ApiParam({ name: 'id', description: 'Carrier ID' })
  @ApiQuery({ name: 'status', required: false, enum: LoadStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLoads() {}
}
```

---

### Step 5: Document Load Board Module

```typescript
@ApiTags('Load Board')
@ApiBearerAuth()
@Controller('load-board')
export class LoadBoardController {
  
  // Postings
  @Get('postings')
  @ApiOperation({ summary: 'Search load postings' })
  @ApiQuery({ name: 'originState', required: false, type: String })
  @ApiQuery({ name: 'originCity', required: false, type: String })
  @ApiQuery({ name: 'originRadius', required: false, type: Number, description: 'Radius in miles' })
  @ApiQuery({ name: 'destState', required: false, type: String })
  @ApiQuery({ name: 'destCity', required: false, type: String })
  @ApiQuery({ name: 'destRadius', required: false, type: Number, description: 'Radius in miles' })
  @ApiQuery({ name: 'equipmentType', required: false, type: String })
  @ApiQuery({ name: 'pickupDateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'pickupDateTo', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'status', required: false, enum: PostingStatus })
  async searchPostings() {}

  @Post('postings')
  @ApiOperation({ summary: 'Create load posting' })
  @ApiBody({ type: CreateLoadPostingDto })
  async createPosting() {}

  @Get('postings/:id')
  @ApiOperation({ summary: 'Get posting details' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  async getPosting() {}

  @Patch('postings/:id')
  @ApiOperation({ summary: 'Update posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiBody({ type: UpdateLoadPostingDto })
  async updatePosting() {}

  @Delete('postings/:id')
  @ApiOperation({ summary: 'Cancel posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  async cancelPosting() {}

  @Post('postings/:id/refresh')
  @ApiOperation({ summary: 'Refresh posting (extend visibility on external boards)' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  async refreshPosting() {}

  // Bids
  @Get('postings/:id/bids')
  @ApiOperation({ summary: 'List bids on posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  async listBids() {}

  @Post('postings/:id/bids')
  @ApiOperation({ summary: 'Submit bid on posting' })
  @ApiParam({ name: 'id', description: 'Posting ID' })
  @ApiBody({
    schema: {
      properties: {
        bidAmount: { type: 'number' },
        rateType: { type: 'string', enum: ['ALL_IN', 'PER_MILE'] },
        notes: { type: 'string' },
        truckNumber: { type: 'string' },
        driverName: { type: 'string' },
        driverPhone: { type: 'string' },
      },
      required: ['bidAmount'],
    },
  })
  async submitBid() {}

  @Patch('bids/:id/accept')
  @ApiOperation({ summary: 'Accept bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  async acceptBid() {}

  @Patch('bids/:id/reject')
  @ApiOperation({ summary: 'Reject bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  async rejectBid() {}

  @Patch('bids/:id/counter')
  @ApiOperation({ summary: 'Counter offer on bid' })
  @ApiParam({ name: 'id', description: 'Bid ID' })
  @ApiBody({
    schema: {
      properties: {
        counterAmount: { type: 'number' },
        notes: { type: 'string' },
      },
      required: ['counterAmount'],
    },
  })
  async counterBid() {}

  // Capacity Search
  @Post('capacity/search')
  @ApiOperation({ summary: 'Search for available carrier capacity' })
  @ApiBody({ type: CapacitySearchDto })
  async searchCapacity() {}

  @Get('capacity/searches')
  @ApiOperation({ summary: 'List capacity searches' })
  async listCapacitySearches() {}

  @Get('capacity/searches/:id')
  @ApiOperation({ summary: 'Get capacity search results' })
  @ApiParam({ name: 'id', description: 'Search ID' })
  async getCapacitySearchResults() {}
}
```

---

### Step 6: Document Accounting Module

```typescript
@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  
  @Get()
  @ApiList('Invoice', InvoiceResponseDto)
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number })
  async findAll() {}

  @Post()
  @ApiCreate('Invoice', CreateInvoiceDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Invoice', InvoiceResponseDto)
  async findOne() {}

  @Patch(':id')
  @ApiUpdate('Invoice', UpdateInvoiceDto)
  async update() {}

  @Delete(':id')
  @ApiDelete('Invoice')
  async remove() {}

  @Post(':id/send')
  @ApiOperation({ summary: 'Send invoice to customer' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({
    schema: {
      properties: {
        emails: { type: 'array', items: { type: 'string', format: 'email' } },
        subject: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async send() {}

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate invoice PDF' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiProduces('application/pdf')
  async getPdf() {}

  @Post(':id/void')
  @ApiOperation({ summary: 'Void invoice' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string', required: true } } } })
  async void() {}

  @Post('batch')
  @ApiOperation({ summary: 'Create batch of invoices for completed loads' })
  @ApiBody({
    schema: {
      properties: {
        loadIds: { type: 'array', items: { type: 'string' } },
        invoiceDate: { type: 'string', format: 'date' },
        dueDate: { type: 'string', format: 'date' },
      },
    },
  })
  async createBatch() {}
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  
  @Get()
  @ApiList('Payment', PaymentResponseDto)
  @ApiQuery({ name: 'type', required: false, enum: ['RECEIVABLE', 'PAYABLE'] })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date' })
  async findAll() {}

  @Post()
  @ApiCreate('Payment', CreatePaymentDto)
  async create() {}

  @Get(':id')
  @ApiGetById('Payment', PaymentResponseDto)
  async findOne() {}

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply payment to invoices' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({
    schema: {
      properties: {
        applications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              invoiceId: { type: 'string' },
              amount: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async apply() {}

  @Post(':id/void')
  @ApiOperation({ summary: 'Void payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ schema: { properties: { reason: { type: 'string' } } } })
  async void() {}

  @Post('batch')
  @ApiOperation({ summary: 'Process batch payments' })
  @ApiBody({
    schema: {
      properties: {
        payments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              carrierId: { type: 'string' },
              amount: { type: 'number' },
              paymentMethod: { type: 'string' },
              reference: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async processBatch() {}
}
```

---

### Step 7: Add DTO Property Documentation

For all DTOs, add `@ApiProperty()` decorators:

**Example: `CreateCustomerDto`**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Company or customer name',
    example: 'Acme Logistics',
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Doing Business As name',
    example: 'Acme Transport',
  })
  @IsOptional()
  @IsString()
  dbaName?: string;

  @ApiProperty({
    description: 'Customer type',
    enum: CustomerType,
    example: 'SHIPPER',
  })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiPropertyOptional({
    description: 'Customer status',
    enum: CustomerStatus,
    default: 'LEAD',
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({
    description: 'Primary contact email',
    format: 'email',
    example: 'contact@acme.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primary phone number',
    example: '+1-555-123-4567',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Chicago',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'State/Province code',
    example: 'IL',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal/ZIP code',
    example: '60601',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Credit limit for the customer',
    example: 50000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiPropertyOptional({
    description: 'Payment terms in days',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  paymentTerms?: number;
}
```

---

### Step 8: Verification Script

Create a script to verify Swagger coverage:

**File: `apps/api/scripts/check-swagger-coverage.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function checkSwaggerCoverage() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder().setTitle('Ultra TMS').build();
  const document = SwaggerModule.createDocument(app, config);

  const paths = Object.keys(document.paths);
  const operations: Array<{ path: string; method: string; summary: string | undefined; documented: boolean }> = [];

  for (const path of paths) {
    const methods = document.paths[path];
    for (const method of Object.keys(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const op = methods[method];
        operations.push({
          path,
          method: method.toUpperCase(),
          summary: op.summary,
          documented: !!op.summary && !!op.responses,
        });
      }
    }
  }

  const documented = operations.filter((o) => o.documented).length;
  const total = operations.length;
  const coverage = ((documented / total) * 100).toFixed(1);

  console.log(`\nSwagger Documentation Coverage: ${documented}/${total} (${coverage}%)\n`);

  const undocumented = operations.filter((o) => !o.documented);
  if (undocumented.length > 0) {
    console.log('Undocumented endpoints:');
    undocumented.forEach((o) => console.log(`  ${o.method} ${o.path}`));
  }

  await app.close();
}

checkSwaggerCoverage();
```

Add to `package.json`:

```json
{
  "scripts": {
    "swagger:check": "ts-node scripts/check-swagger-coverage.ts"
  }
}
```

---

## Acceptance Criteria

- [ ] All controllers have `@ApiTags()` decorator
- [ ] All endpoints have `@ApiOperation()` with summary
- [ ] All endpoints have `@ApiBearerAuth()` where auth required
- [ ] All query parameters documented with `@ApiQuery()`
- [ ] All path parameters documented with `@ApiParam()`
- [ ] All request bodies documented with `@ApiBody()` or DTO decorators
- [ ] All DTOs have `@ApiProperty()` on every field
- [ ] Response schemas documented for success cases
- [ ] Error responses documented (400, 401, 403, 404, 500)
- [ ] Swagger coverage check reports 100%
- [ ] Swagger UI loads without errors at `/api/docs`

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

```markdown
| 11 | [Swagger Completion](...) | P3 | 6-8h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Swagger Documentation | ~60% | 100% | 100% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 11: Swagger Completion
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Created standard Swagger decorator library
- Documented all CRM module endpoints
- Documented all TMS Core module endpoints  
- Documented all Carrier module endpoints
- Documented all Load Board module endpoints
- Documented all Accounting module endpoints
- Added ApiProperty to all DTOs
- Created coverage verification script
- Swagger coverage now at 100%

#### Metrics Updated
- Swagger Documentation: 60% → 100%
```
