# 66 - Type Safety Standards

**TypeScript patterns for NestJS + React in the 3PL Platform**

---

## âš ï¸ CLAUDE CODE: Type Safety Rules

1. **NEVER use `any`** without documented exception
2. **Types MUST match actual runtime data** - Log API responses during development
3. **Interfaces at API boundaries** - Define types for ALL request/response shapes
4. **Shared types in packages/shared-types** - Single source of truth

---

## The Cardinal Rules

### 1. Never Use `any` Without Reason

```typescript
// âŒ WRONG - Using any
function processData(data: any) { ... }
let result: any = fetchData();

// âœ… CORRECT - Proper types
function processData(data: CarrierData) { ... }
let result: ApiResponse<Carrier> = fetchData();

// If you MUST use any, document WHY
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseExternalData(data: any): Carrier {
  // External API returns untyped data that varies by provider
  return transformToCarrier(data);
}
```

### 2. Types MUST Match Runtime Data

```typescript
// If API returns this:
{
  "data": {
    "id": "123",
    "first_name": "John",  // snake_case from DB
    "last_name": "Doe",
    "is_active": true
  }
}

// Your interface MUST match:
interface UserResponse {
  data: {
    id: string;
    first_name: string;   // NOT firstName
    last_name: string;    // NOT lastName
    is_active: boolean;   // NOT isActive
  };
}

// If you need different names internally, transform explicitly:
interface User {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

function toUser(response: UserResponse): User {
  const { data } = response;
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    isActive: data.is_active,
  };
}
```

### 3. Handle Nullability Explicitly

```typescript
interface Carrier {
  id: string;
  name: string;
  address: Address | null; // Might not exist
  contacts: Contact[]; // Always exists (may be empty array)
  insuranceExpiry?: Date; // Optional field
}

// Safe access patterns
const addressCity = carrier.address?.city ?? 'No address';
const primaryContact = carrier.contacts[0]?.name ?? 'No contact';
const expiryDate = carrier.insuranceExpiry
  ? formatDate(carrier.insuranceExpiry)
  : 'Not set';
```

---

## Shared Types Package

### Structure

```
packages/shared-types/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ response.ts        # API response wrappers
â”‚   â”‚   â”œâ”€â”€ pagination.ts      # Pagination types
â”‚   â”‚   â””â”€â”€ error.ts           # Error types
â”‚   â”‚
â”‚   â”œâ”€â”€ entities/
â”‚   â”‚   â”œâ”€â”€ carrier.ts
â”‚   â”‚   â”œâ”€â”€ load.ts
â”‚   â”‚   â”œâ”€â”€ user.ts
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ enums/
â”‚   â”‚   â”œâ”€â”€ carrier-status.ts
â”‚   â”‚   â”œâ”€â”€ load-status.ts
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â””â”€â”€ index.ts               # Barrel export
â”‚
â”œâ”€â”€ package.json
â””â”€â”€ tsconfig.json
```

### API Response Types

```typescript
// packages/shared-types/src/api/response.ts

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Helper type for API calls
export type ApiResult<T> = ApiResponse<T> | ApiError;
```

### Entity Types

```typescript
// packages/shared-types/src/entities/carrier.ts

import { CarrierStatus, CarrierType } from '../enums';

export interface Carrier {
  id: string;
  name: string;
  legalName: string | null;
  mcNumber: string;
  dotNumber: string;
  scac: string | null;
  type: CarrierType;
  status: CarrierStatus;
  email: string | null;
  phone: string | null;
  address: Address | null;
  createdAt: string; // ISO date string from API
  updatedAt: string;
}

export interface CarrierWithRelations extends Carrier {
  contacts: CarrierContact[];
  equipment: CarrierEquipment[];
  insurance: CarrierInsurance[];
  loads: LoadSummary[];
}

export interface CreateCarrierDto {
  name: string;
  mcNumber: string;
  dotNumber: string;
  type?: CarrierType;
  email?: string;
  phone?: string;
  address?: CreateAddressDto;
}

export interface UpdateCarrierDto extends Partial<CreateCarrierDto> {}

// Query params
export interface CarrierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CarrierStatus;
  type?: CarrierType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Enum Types

```typescript
// packages/shared-types/src/enums/carrier-status.ts

export const CarrierStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  BLACKLISTED: 'BLACKLISTED',
} as const;

export type CarrierStatus = (typeof CarrierStatus)[keyof typeof CarrierStatus];

// This allows:
// - Type safety: status: CarrierStatus
// - Runtime values: CarrierStatus.ACTIVE
// - Iteration: Object.values(CarrierStatus)
```

---

## NestJS Type Patterns

### DTOs with class-validator

```typescript
// apps/api/src/modules/carrier/dto/create-carrier.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierType } from '@shared-types/enums';

export class CreateCarrierDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'MC Number' })
  @IsString()
  @IsNotEmpty()
  mcNumber: string;

  @ApiProperty({ description: 'DOT Number' })
  @IsString()
  @IsNotEmpty()
  dotNumber: string;

  @ApiPropertyOptional({ enum: CarrierType })
  @IsEnum(CarrierType)
  @IsOptional()
  type?: CarrierType;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}
```

### Service Return Types

```typescript
// apps/api/src/modules/carrier/carrier.service.ts

import { Carrier, CarrierWithRelations, Pagination } from '@shared-types';

@Injectable()
export class CarrierService {
  async findAll(
    query: CarrierQueryDto,
    tenantId: string
  ): Promise<{ data: Carrier[]; total: number }> {
    // ...
  }

  async findOne(id: string, tenantId: string): Promise<CarrierWithRelations> {
    // ...
  }

  async create(
    dto: CreateCarrierDto,
    tenantId: string,
    userId: string
  ): Promise<Carrier> {
    // ...
  }
}
```

### Controller Response Types

```typescript
// apps/api/src/modules/carrier/carrier.controller.ts

import { ApiResponse, PaginatedResponse, Carrier } from '@shared-types';

@Controller('api/v1/carriers')
export class CarrierController {
  @Get()
  async findAll(
    @Query() query: CarrierQueryDto
  ): Promise<PaginatedResponse<Carrier>> {
    const { data, total } = await this.service.findAll(query, tenantId);
    return paginated(data, total, query.page, query.limit);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string
  ): Promise<ApiResponse<CarrierWithRelations>> {
    const carrier = await this.service.findOne(id, tenantId);
    return ok(carrier);
  }
}
```

---

## React Type Patterns

### Component Props

```typescript
// components/carriers/carrier-card.tsx

import { Carrier, CarrierStatus } from '@shared-types';

interface CarrierCardProps {
  carrier: Carrier;
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrier: Carrier) => void;
  isLoading?: boolean;
}

export function CarrierCard({
  carrier,
  onEdit,
  onDelete,
  isLoading = false,
}: CarrierCardProps) {
  // ...
}
```

### Hook Types

```typescript
// hooks/use-carriers.ts

import { Carrier, Pagination, CarrierQueryParams } from '@shared-types';

interface UseCarriersResult {
  carriers: Carrier[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCarriers(
  params: CarrierQueryParams = {}
): UseCarriersResult {
  // ...
}
```

### API Response Handling

```typescript
// lib/api-client.ts

import { ApiResponse, PaginatedResponse, ApiError } from '@shared-types';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    const error = result as ApiError;
    throw new Error(error.error || 'Request failed');
  }

  return result as T;
}

// Usage with proper typing
const result = await fetchApi<PaginatedResponse<Carrier>>('/api/v1/carriers');
const carriers = result.data; // Carrier[]
const total = result.pagination.total; // number

const single = await fetchApi<ApiResponse<Carrier>>(`/api/v1/carriers/${id}`);
const carrier = single.data; // Carrier
```

---

## Form Type Patterns

### Zod Schema + Inferred Types

```typescript
// Use Zod for runtime validation AND type inference

import { z } from 'zod';

// Define schema
const carrierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mcNumber: z.string().min(1, 'MC Number is required'),
  dotNumber: z.string().min(1, 'DOT Number is required'),
  type: z.enum(['TRUCKLOAD', 'LTL', 'INTERMODAL', 'DRAYAGE']).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z
    .object({
      street1: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(5, 'Zip code is required'),
    })
    .optional(),
});

// Infer type from schema
type CarrierFormData = z.infer<typeof carrierFormSchema>;

// Use in form
const form = useForm<CarrierFormData>({
  resolver: zodResolver(carrierFormSchema),
  defaultValues: {
    name: '',
    mcNumber: '',
    dotNumber: '',
    type: 'TRUCKLOAD',
  },
});
```

---

## Error Handling Types

```typescript
// Type-safe error handling

interface FormError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  error: string;
  code: string;
  details?: {
    errors?: FormError[];
    [key: string]: unknown;
  };
}

function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiErrorResponse;
    if (apiError.error) {
      return apiError.error;
    }
  }

  return 'An unexpected error occurred';
}

// Type guard for API errors
function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiErrorResponse).error === 'string'
  );
}
```

---

## Common Type Mistakes

### 1. Not Matching API Response

```typescript
// API returns: { data: { first_name: "John" } }

// âŒ WRONG - Assumes camelCase
interface User {
  firstName: string; // Will be undefined!
}

// âœ… CORRECT - Match actual response
interface UserApiResponse {
  data: {
    first_name: string;
  };
}
```

### 2. Missing Null Handling

```typescript
// âŒ WRONG - Assumes address always exists
<p>{carrier.address.city}</p>  // Crashes if null!

// âœ… CORRECT - Handle null
<p>{carrier.address?.city ?? 'No address'}</p>
```

### 3. Assuming Array Items Exist

```typescript
// âŒ WRONG - Assumes array has items
const firstContact = carrier.contacts[0].name; // Crashes if empty!

// âœ… CORRECT - Safe access
const firstContact = carrier.contacts[0]?.name ?? 'No contacts';
```

### 4. Not Typing Event Handlers

```typescript
// âŒ WRONG - Untyped event
const handleChange = (e) => {
  setValue(e.target.value);
};

// âœ… CORRECT - Typed event
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

---

## Type Safety Checklist

### Before Committing

- [ ] No `any` types (or documented exceptions)
- [ ] All API responses have matching types
- [ ] All nullable fields use optional chaining
- [ ] All form data has Zod schemas
- [ ] All props interfaces defined
- [ ] Types from shared-types package used consistently

### During Code Review

- [ ] Types match actual runtime data
- [ ] No type assertions (`as`) without justification
- [ ] Error responses properly typed
- [ ] Array access is safe
- [ ] Optional fields handled

---

## Navigation

- **Previous:** [UI Component Standards](./65-ui-component-standards.md)
- **Next:** [Auth & Authorization Standards](./67-auth-authorization-standards.md)
