# Prompt 02: Response Standardization

**Priority:** P0 (Critical)  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  

---

## Objective

Create standardized response helpers and ensure all API endpoints return consistent response formats with proper typing. Currently, controllers return inconsistent structures (some use `items`, others use `data`, pagination formats vary).

---

## Files to Create

| File | Description |
|------|-------------|
| `apps/api/src/common/interfaces/response.interface.ts` | TypeScript interfaces for response types |
| `apps/api/src/common/helpers/response.helper.ts` | Helper functions for consistent responses |

## Files to Modify

| File | Changes |
|------|---------|
| All services in `apps/api/src/modules/*/` | Update return types to use helpers |
| All controllers in `apps/api/src/modules/*/` | Use response helpers |

---

## Implementation Steps

### Step 1: Create Response Interfaces

Create `apps/api/src/common/interfaces/response.interface.ts`:

```typescript
/**
 * Standard API Response Interfaces
 * All API responses should conform to these structures
 */

// Base response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Paginated response for list endpoints
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string; // Only in development
  };
  timestamp: string;
}

// Pagination input parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination result from service
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

### Step 2: Create Response Helpers

Create `apps/api/src/common/helpers/response.helper.ts`:

```typescript
import { ApiResponse, PaginatedResponse, ErrorResponse } from '../interfaces/response.interface';

/**
 * Create a successful response for single resource
 */
export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a paginated response for list endpoints
 */
export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a successful response for resource creation
 */
export function created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
  return ok(data, message);
}

/**
 * Create a successful response for resource update
 */
export function updated<T>(data: T, message = 'Resource updated successfully'): ApiResponse<T> {
  return ok(data, message);
}

/**
 * Create a successful response for resource deletion
 */
export function deleted(message = 'Resource deleted successfully'): ApiResponse<null> {
  return ok(null, message);
}

/**
 * Create an error response
 */
export function error(
  code: string,
  message: string,
  details?: Record<string, any>,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a response for batch operations
 */
export function batch<T>(
  results: { success: T[]; failed: Array<{ item: any; error: string }> },
  message?: string,
): ApiResponse<typeof results> {
  return ok(results, message || `Processed ${results.success.length} items, ${results.failed.length} failed`);
}

/**
 * Transform service pagination result to response
 */
export function fromPaginationResult<T>(result: {
  data: T[];
  total: number;
  page: number;
  limit: number;
}): PaginatedResponse<T> {
  return paginated(result.data, result.total, result.page, result.limit);
}
```

### Step 3: Create Index Export

Create `apps/api/src/common/helpers/index.ts`:

```typescript
export * from './response.helper';
```

Update `apps/api/src/common/interfaces/index.ts`:

```typescript
export * from './response.interface';
```

### Step 4: Fix TMS Service (Priority Fix)

The TMS loads service currently returns `items` instead of `data`. Fix `apps/api/src/modules/tms/loads.service.ts`:

**Before:**
```typescript
return {
  items: loads,  // WRONG - should be 'data'
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};
```

**After:**
```typescript
import { paginated } from '../../common/helpers/response.helper';

// In the findAll method:
return {
  data: loads,
  total,
  page,
  limit,
};

// Or in controller, use helper:
const result = await this.loadsService.findAll(tenantId, query);
return paginated(result.data, result.total, result.page, result.limit);
```

### Step 5: Update Controller Pattern

Apply this pattern to all controllers:

**Before (inconsistent):**
```typescript
@Get()
async findAll(@Query() query: ListDto) {
  return this.service.findAll(query);
}

@Get(':id')
async findOne(@Param('id') id: string) {
  return this.service.findOne(id);
}

@Post()
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}
```

**After (standardized):**
```typescript
import { ok, created, updated, deleted, paginated } from '../../common/helpers/response.helper';

@Get()
async findAll(@Query() query: ListDto) {
  const result = await this.service.findAll(query);
  return paginated(result.data, result.total, query.page || 1, query.limit || 20);
}

@Get(':id')
async findOne(@Param('id') id: string) {
  const result = await this.service.findOne(id);
  return ok(result);
}

@Post()
async create(@Body() dto: CreateDto) {
  const result = await this.service.create(dto);
  return created(result);
}

@Patch(':id')
async update(@Param('id') id: string, @Body() dto: UpdateDto) {
  const result = await this.service.update(id, dto);
  return updated(result);
}

@Delete(':id')
async remove(@Param('id') id: string) {
  await this.service.remove(id);
  return deleted();
}
```

### Step 6: Update Service Return Types

Services should return consistent structures:

```typescript
// For paginated lists
interface ServiceListResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Example service method
async findAll(
  tenantId: string,
  params: PaginationParams,
): Promise<ServiceListResult<Entity>> {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.entity.findMany({
      where: { tenantId, deletedAt: null },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    this.prisma.entity.count({
      where: { tenantId, deletedAt: null },
    }),
  ]);

  return { data, total, page, limit };
}
```

### Step 7: Priority Controllers to Update

Update these controllers first (high-traffic endpoints):

1. `apps/api/src/modules/tms/loads.controller.ts`
2. `apps/api/src/modules/tms/orders.controller.ts`
3. `apps/api/src/modules/carrier/carriers.controller.ts`
4. `apps/api/src/modules/crm/companies.controller.ts`
5. `apps/api/src/modules/accounting/invoices.controller.ts`
6. `apps/api/src/modules/sales/quotes.controller.ts`

---

## Acceptance Criteria

- [ ] Response interfaces defined in `common/interfaces/`
- [ ] Response helpers defined in `common/helpers/`
- [ ] All paginated endpoints return `{ success, data, pagination, timestamp }`
- [ ] All single-resource endpoints return `{ success, data, timestamp }`
- [ ] No endpoints use `items` key (all use `data`)
- [ ] Delete endpoints return `{ success: true, data: null, message }`
- [ ] TypeScript interfaces enforce response structure
- [ ] All services return consistent `{ data, total, page, limit }` for lists

---

## Testing

Verify response format with curl:

```bash
# Paginated response
curl http://localhost:3001/api/v1/loads | jq
# Expected: { success: true, data: [...], pagination: {...}, timestamp: "..." }

# Single resource
curl http://localhost:3001/api/v1/loads/123 | jq
# Expected: { success: true, data: {...}, timestamp: "..." }

# Create resource
curl -X POST http://localhost:3001/api/v1/loads -d '{}' | jq
# Expected: { success: true, data: {...}, message: "Resource created successfully", timestamp: "..." }
```

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 02 row in the status table:
```markdown
| 02 | [Response Standardization](...) | P0 | 2-3h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Update Metrics

```markdown
| Response Consistency | ~60% | 100% | 100% |
```

### 3. Add Changelog Entry

```markdown
### [Date] - Prompt 02: Response Standardization
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Created response helpers (ok, paginated, created, updated, deleted, error)
- Created response interfaces for TypeScript type safety
- Fixed TMS service 'items' to 'data' inconsistency
- Updated [X] controllers to use standardized responses

#### Metrics Updated
- Response Consistency: ~60% → 100%
```

---

## Notes

- Response helpers are pure functions with no side effects
- All responses include `timestamp` for debugging/logging
- Error responses follow same structure (handled by exception filters)
- Consider adding response interceptor for automatic wrapping (optional)
