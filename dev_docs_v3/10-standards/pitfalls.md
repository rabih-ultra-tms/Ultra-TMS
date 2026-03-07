# Common Pitfalls & Prevention

> Source: `dev_docs/08-standards/73-common-pitfalls-prevention.md` + `dev_docs_v3/05-audit/recurring-patterns.md`
> READ THIS FIRST before any coding session

## Top 10 Anti-Patterns (from Sonnet Audit)

### 1. Double-unwrapping API responses

```typescript
// WRONG — data is undefined
const carriers = response.data;

// RIGHT — API envelope wraps in { data: T }
const carriers = response.data.data;
```

### 2. Missing tenantId filter

```typescript
// WRONG — data leak across tenants
await prisma.carrier.findMany();

// RIGHT
await prisma.carrier.findMany({ where: { tenantId, deletedAt: null } });
```

### 3. Missing deletedAt filter

```typescript
// WRONG — returns soft-deleted records
await prisma.carrier.findMany({ where: { tenantId } });

// RIGHT
await prisma.carrier.findMany({ where: { tenantId, deletedAt: null } });
```

### 4. Using `any` type

```typescript
// WRONG
const handleSubmit = (data: any) => { ... }

// RIGHT
const handleSubmit = (data: CreateCarrierDto) => { ... }
```

### 5. Empty onClick / TODO handlers

```typescript
// WRONG
<Button onClick={() => {}}>Delete</Button>
<Button onClick={() => { /* TODO */ }}>Export</Button>

// RIGHT — implement or remove the button
<Button onClick={() => mutation.mutate(id)}>Delete</Button>
```

### 6. No loading/error/empty states

```typescript
// WRONG — just renders data, crashes on null
return <DataTable data={data} />;

// RIGHT
if (isLoading) return <PageSkeleton />;
if (error) return <ErrorState message={error.message} />;
if (!data?.length) return <EmptyState title="No carriers found" />;
return <DataTable data={data} />;
```

### 7. Using `window.confirm()` instead of ConfirmDialog

```typescript
// WRONG
if (window.confirm('Delete this carrier?')) { ... }

// RIGHT
<ConfirmDialog
  open={showDelete}
  title="Delete Carrier"
  description="This action cannot be undone."
  onConfirm={handleDelete}
/>
```

### 8. No search debounce

```typescript
// WRONG — fires API call on every keystroke
<Input onChange={(e) => setSearch(e.target.value)} />

// RIGHT — debounce 300ms
const debouncedSearch = useDebouncedValue(search, 300);
useEffect(() => { refetch(); }, [debouncedSearch]);
```

### 9. Hardcoded values instead of tokens

```typescript
// WRONG
<div className="bg-[#1e293b] text-[#3b82f6]">

// RIGHT — use semantic tokens
<div className="bg-slate-900 text-primary">
```

### 10. Console.log in production code

```typescript
// WRONG
console.log('JWT token:', token); // SECURITY RISK

// RIGHT — remove all console.logs before commit
```

## Gotchas Specific to This Codebase

1. **API proxy:** Frontend calls `/api/v1/*`, Next.js rewrites to `:3001`. Don't call `:3001` directly.
2. **ValidationPipe strips unknowns:** Only DTO-declared fields pass through. If your field is being dropped, add it to the DTO.
3. **CORS:** Only `localhost:3000` and `localhost:3002` are allowed origins.
4. **`noUncheckedIndexedAccess`:** `array[0]` is `T | undefined`. Always check.
5. **`exactOptionalPropertyTypes`:** `field?: string` is NOT the same as `field?: string | undefined`.
6. **No `src/` in web app:** Files live in `app/`, `components/`, `lib/` directly under `apps/web/`.
7. **`pnpm --filter`:** Use `pnpm --filter api` or `pnpm --filter web` for app-specific commands.
8. **React 19 + useMemo:** Don't use `useMemo` for side effects — it won't work as expected.

## Pre-Commit Checklist

- [ ] No `any` types
- [ ] No `console.log`
- [ ] No `window.confirm()`
- [ ] No empty `onClick` handlers
- [ ] All API calls unwrap correctly (`response.data.data`)
- [ ] All queries filter `tenantId` + `deletedAt: null`
- [ ] Loading/error/empty states on every page
- [ ] `pnpm check-types` passes
- [ ] `pnpm lint` passes
