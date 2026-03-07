# Codebase Gotchas

> AI Dev Guide | Common mistakes and how to avoid them. Consolidated from CLAUDE.md + audit findings.

---

## Critical Gotchas

### 1. API Envelope Unwrapping

```typescript
// WRONG -- will get the entire response wrapper
const data = response.data;

// CORRECT -- unwrap the envelope
const data = response.data.data;

// For paginated lists:
const items = response.data.data;         // Array of items
const pagination = response.data.pagination; // { page, limit, total, totalPages }
```

This is the #1 recurring bug. Every hook MUST unwrap `response.data.data`.

### 2. Always Filter by tenantId

```typescript
// WRONG -- leaks data across tenants
await prisma.carrier.findMany({ where: { status: 'ACTIVE' } });

// CORRECT -- always include tenantId
await prisma.carrier.findMany({ where: { tenantId, status: 'ACTIVE', deletedAt: null } });
```

Every single database query must include `tenantId`. No exceptions.

### 3. Always Check deletedAt: null

```typescript
// WRONG -- includes soft-deleted records
await prisma.carrier.findMany({ where: { tenantId } });

// CORRECT -- exclude soft-deleted
await prisma.carrier.findMany({ where: { tenantId, deletedAt: null } });
```

### 4. Never Use window.confirm()

```typescript
// WRONG
if (window.confirm("Delete?")) { handleDelete(); }

// CORRECT -- use the useConfirm hook
const { confirm } = useConfirm();
const ok = await confirm({ title: "Delete?", description: "Cannot be undone." });
if (ok) handleDelete();
```

There are currently 7 instances of `window.confirm()` in the codebase that need fixing.

### 5. No Hardcoded Colors

```typescript
// WRONG
<span className="text-red-500">Error</span>
<span className="bg-green-100 text-green-700">Active</span>

// CORRECT -- use design token classes
<span className="text-destructive">Error</span>
<Badge variant="status-active">Active</Badge>
```

### 6. API Proxy -- Don't Call Port 3001 Directly

```typescript
// WRONG -- bypasses proxy, breaks in production
const response = await fetch('http://localhost:3001/api/v1/carriers');

// CORRECT -- use the API proxy
const response = await api.get('/api/v1/carriers');
// Next.js rewrites /api/v1/* to localhost:3001/api/v1/*
```

### 7. TypeScript Strict Mode

The project uses strict TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. This means:

```typescript
// WRONG -- unchecked index access
const item = items[0]; // Type is T | undefined in strict mode
item.name; // Error!

// CORRECT
const item = items[0];
if (item) { item.name; } // OK
```

### 8. No src/ Directory in Web App

```
// WRONG path
apps/web/src/components/...

// CORRECT path
apps/web/components/...
apps/web/app/...
apps/web/lib/...
```

### 9. ValidationPipe Strips Unknown Fields

NestJS ValidationPipe is configured with `whitelist: true, forbidNonWhitelisted: true`. Only DTO-declared fields pass through. Sending extra fields in the request body will either be silently stripped or cause a 400 error.

### 10. CORS Restrictions

Only `localhost:3000` and `localhost:3002` are allowed origins. Adding a new frontend port requires updating CORS config in `apps/api/src/main.ts`.

## Anti-Patterns (from Sonnet Audit)

| # | Anti-Pattern | Fix |
|---|-------------|-----|
| 1 | Using `response.data` instead of `response.data.data` | Unwrap envelope |
| 2 | Missing tenantId in queries | Add tenantId to every WHERE |
| 3 | Missing deletedAt check | Add `deletedAt: null` to every WHERE |
| 4 | window.confirm() | Use useConfirm() hook |
| 5 | Hardcoded colors | Use design tokens |
| 6 | Empty onClick handlers | Implement real handler or remove |
| 7 | Bare "Loading..." text | Use Skeleton or Spinner component |
| 8 | console.log in production code | Remove or use proper logging |
| 9 | Using `any` type | Define proper TypeScript types |
| 10 | Missing error/empty states | Always handle loading, error, empty |

## PROTECTED Files -- NEVER Modify

| File | Quality | Reason |
|------|---------|--------|
| `/load-planner/[id]/edit/page.tsx` | 9/10 | AI cargo + Google Maps, 1825 LOC |
| `/truck-types/page.tsx` | 8/10 | Gold standard CRUD |
| `/login/page.tsx` | 8/10 | Working auth flow |
