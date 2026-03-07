# Type Safety Standards

> Source: `dev_docs/08-standards/70-type-safety-standards.md`
> TypeScript strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`

## Golden Rule

**No `any` types.** Period. If you're reaching for `any`, you're doing it wrong.

## Strict Mode Settings

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

## API Response Types

```typescript
// Match the API envelope
interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Common Patterns

### Use `satisfies` for type-safe objects

```typescript
const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'green' },
  PENDING: { label: 'Pending', color: 'amber' },
} satisfies Record<string, { label: string; color: string }>;
```

### Discriminated unions for status

```typescript
type LoadStatus = 'PENDING' | 'DISPATCHED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
```

### Type narrowing

```typescript
// Use type guards
function isApiError(error: unknown): error is { error: string; code: string } {
  return typeof error === 'object' && error !== null && 'error' in error;
}
```

### Index access safety

```typescript
// With noUncheckedIndexedAccess, array[0] is T | undefined
const first = items[0];
if (first) {
  // Now safely T
  console.log(first.name);
}
```

## Anti-Patterns (NEVER do these)

```typescript
// BAD: any
const data: any = response.data;

// BAD: type assertion without validation
const carrier = response.data as Carrier;

// BAD: non-null assertion
const name = carrier.contact!.name;

// BAD: ignoring possible undefined
const first = items[0].name; // Might be undefined

// GOOD: proper typing
const data = response.data as ApiResponse<Carrier>;
const name = carrier.contact?.name ?? 'Unknown';
const first = items[0]?.name;
```

## DTO ↔ Frontend Type Alignment

Backend DTOs and frontend types MUST match:

```typescript
// Backend DTO
export class CreateCarrierDto {
  @IsString() legalName: string;
  @IsOptional() @IsString() mcNumber?: string;
}

// Frontend type (must match)
interface CreateCarrierInput {
  legalName: string;
  mcNumber?: string;
}
```
