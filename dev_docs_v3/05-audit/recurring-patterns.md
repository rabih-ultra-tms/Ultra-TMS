# Recurring Anti-Patterns — Ultra TMS

> These patterns appear repeatedly across the codebase. Each one is now a HARD RULE.
> Source: Sonnet audit (Feb 2026) — 62 bugs identified, 10 root-cause patterns
> Last updated: 2026-03-07

---

## The 10 Patterns

---

### Pattern 1: API Envelope Not Unwrapped

**Frequency:** 14 occurrences
**Symptom:** Data renders as `[object Object]` or lists are always empty
**Root cause:** Backend returns `{ data: T }` (single) or `{ data: T[], pagination: {...} }` (list). React Query stores the Axios response in `response.data`. So actual data is at `response.data.data`, not `response.data`.

**Wrong:**
```typescript
const { data } = useQuery({
  queryFn: () => api.get('/crm/customers'),
});
// data = { data: Customer[], pagination: {...} }
// Renders "[object Object]" if you do data.name
```

**Correct:**
```typescript
const { data } = useQuery({
  queryFn: async () => {
    const response = await api.get('/crm/customers');
    return response.data.data; // ← unwrap the envelope
  },
});
// data = Customer[]
```

**Rule:** ALWAYS call `response.data.data` for lists, `response.data.data` for single items.
Before writing any hook, verify what the backend actually returns by reading the controller's return type.

---

### Pattern 2: Stub Buttons with Empty Handlers

**Frequency:** 11 occurrences
**Symptom:** Buttons render and look correct but nothing happens when clicked
**Root cause:** Rapid code generation creates button components with `onClick={() => {}}` or `onClick={undefined}` placeholders.

**Wrong:**
```tsx
<Button onClick={() => {}}>Delete</Button>
<Button>Edit</Button>  {/* no onClick at all */}
```

**Correct:**
```tsx
<Button onClick={() => handleDelete(item.id)} disabled={isDeleting}>
  {isDeleting ? 'Deleting...' : 'Delete'}
</Button>
```

**Rule:** EVERY button must have a working handler OR be visually disabled with a `disabled` prop. No empty handlers, no missing `onClick`. Verify by clicking in Playwright before marking done.

---

### Pattern 3: Unstable Dependencies in useEffect/useMemo

**Frequency:** 7 occurrences
**Symptom:** Infinite re-render loops, excessive API calls, React 19 console warnings
**Root cause:** Functions defined inside the component are recreated on every render. Including them in `useEffect` deps causes the effect to re-run every render.

**Wrong:**
```typescript
const fetchData = async () => { /* ... */ }; // recreated every render

useEffect(() => {
  fetchData(); // fetchData changes every render → infinite loop
}, [fetchData]);
```

**Correct:**
```typescript
const fetchData = useCallback(async () => { /* ... */ }, [stableId]);

useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData is now stable
```

**Better (React Query pattern):**
```typescript
// Let React Query handle refetching — don't write useEffect for data fetching
const { data } = useQuery({
  queryKey: ['customers', { page, search }],
  queryFn: () => api.get('/crm/customers', { params: { page, search } }),
});
```

**Rule:** Never put unstable function references in `useEffect` deps. Use `useCallback` for function deps. Extract constants outside the component. Prefer React Query over manual `useEffect` for data fetching.

---

### Pattern 4: Mock Data with `enabled: true`

**Frequency:** 8 occurrences
**Symptom:** UI shows mock/test data even in production; API calls never fire
**Root cause:** Development scaffold creates mock queries with `enabled: true` as a placeholder, then nobody wires up the real API call.

**Wrong:**
```typescript
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => mockDashboardData, // ← mock function
  enabled: true, // ← always enabled, even in production
});
```

**Correct:**
```typescript
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => api.get('/operations/dashboard').then(r => r.data.data),
  // enabled: true is default — no need to set it
  // only use enabled: false to disable, or enabled: !!someId to conditionally enable
});
```

**Rule:** `enabled: true` should NEVER appear in production code (it's the default). If you see mock data in a queryFn, replace it with a real API call. Verify API call fires by checking Network tab in Playwright.

---

### Pattern 5: Wrong HTTP Method

**Frequency:** 5 occurrences
**Symptom:** API returns 404 or 405 Method Not Allowed
**Root cause:** Incorrect method assumed without reading the controller.

**Wrong:**
```typescript
// PATCH /orders/:id/status doesn't exist — it's PATCH /orders/:id
await api.patch(`/orders/${id}/status`, { status });
```

**Correct (after reading controller):**
```typescript
await api.patch(`/orders/${id}`, { status });
```

**Rule:** ALWAYS grep the controller before writing a fetch call. `grep -r "'/orders" apps/api/src/modules/orders/` to find exact routes.

---

### Pattern 6: Doubled API Prefix

**Frequency:** 4 occurrences
**Symptom:** API calls return 404, URL shows `/api/v1/api/v1/endpoint`
**Root cause:** The Next.js proxy rewrites `/api/v1/*` to `localhost:3001/api/v1/*`. If the API client also prepends `/api/v1/`, the path is doubled.

**Wrong:**
```typescript
const api = axios.create({ baseURL: '/api/v1' });
await api.get('/api/v1/crm/customers'); // results in /api/v1/api/v1/crm/customers
```

**Correct:**
```typescript
const api = axios.create({ baseURL: '/api/v1' });
await api.get('/crm/customers'); // results in /api/v1/crm/customers (correct)
```

**Rule:** The `baseURL` is already `/api/v1`. Never include `/api/v1` in the path you pass to `api.get()` etc.

---

### Pattern 7: `window.location.reload()` Instead of React Query Refetch

**Frequency:** 5 occurrences
**Symptom:** Page does a full hard reload after form submission; state is lost
**Root cause:** Easy shortcut to "refresh data" that bypasses React Query's cache.

**Wrong:**
```typescript
const handleDelete = async () => {
  await api.delete(`/carriers/${id}`);
  window.location.reload(); // hard reload
};
```

**Correct:**
```typescript
const queryClient = useQueryClient();

const handleDelete = async () => {
  await api.delete(`/carriers/${id}`);
  await queryClient.invalidateQueries({ queryKey: ['carriers'] });
  // React Query automatically refetches — no page reload needed
};
```

**Rule:** NEVER use `window.location.reload()`. Use `queryClient.invalidateQueries()` to refresh data after mutations.

---

### Pattern 8: Missing Loading/Error/Empty States (3-in-1)

**Frequency:** 8 missing loading + 7 missing error + 5 missing empty = 20 total
**Symptom:** Blank white areas when loading; crashes on error; no feedback when list is empty
**Root cause:** Components only handle the "happy path" (data present).

**Wrong:**
```tsx
const { data } = useQuery({ queryKey: ['carriers'], queryFn: fetchCarriers });
return (
  <div>
    {data.map(carrier => <CarrierRow key={carrier.id} carrier={carrier} />)}
  </div>
);
// Crashes if data is undefined (loading), crashes if data is null (error)
// Shows empty div if data is [] (empty list)
```

**Correct:**
```tsx
const { data, isLoading, error } = useQuery({ queryKey: ['carriers'], queryFn: fetchCarriers });

if (isLoading) return <Skeleton />;
if (error) return <ErrorState message="Failed to load carriers" />;
if (!data?.length) return <EmptyState message="No carriers found" action={<Button>Add Carrier</Button>} />;

return (
  <div>
    {data.map(carrier => <CarrierRow key={carrier.id} carrier={carrier} />)}
  </div>
);
```

**Rule:** EVERY component that fetches data must handle all 4 states: loading, error, empty, populated. Use the design system's `Skeleton`, `ErrorState`, and `EmptyState` components from `components/tms/shared/`.

---

### Pattern 9: No TypeScript Types on API Responses

**Frequency:** ~20 occurrences (approximate)
**Symptom:** TypeScript errors OR runtime crashes from unexpected data shape
**Root cause:** Hooks typed as `any` or left untyped, relying on runtime duck-typing.

**Wrong:**
```typescript
const { data } = useQuery({
  queryFn: () => api.get('/carriers').then(r => r.data),
}); // data is typed as 'any'
```

**Correct:**
```typescript
interface CarrierListResponse {
  data: Carrier[];
  pagination: Pagination;
}

const { data } = useQuery<Carrier[]>({
  queryFn: async () => {
    const response = await api.get<CarrierListResponse>('/carriers');
    return response.data.data;
  },
});
```

**Rule:** No `any` types on API responses. Define the response interface. Use the types from the shared types package or define them inline. `pnpm check-types` must pass with 0 errors.

---

### Pattern 10: Backend Endpoint Assumed Without Verification

**Frequency:** 6 occurrences
**Symptom:** Frontend calls an endpoint that doesn't exist → 404 in production
**Root cause:** Endpoint URLs assumed from pattern (`GET /service/:id`) without verifying the controller.

**Examples of wrong assumptions:**
- `GET /accounting/dashboard` — endpoint doesn't exist (QS-003 task)
- `GET /carriers/csa/:id` — endpoint is a stub returning empty data (QS-004 task)
- `WS /dispatch` — namespace not implemented (QS-001 task)
- `PATCH /orders/:id/status` — should be `PATCH /orders/:id`

**Rule:** Before writing ANY frontend code that calls an API:
```bash
# Verify the route exists
grep -r "'/endpoint" apps/api/src/modules/
# or
grep -r "@Get\|@Post\|@Patch\|@Put\|@Delete" apps/api/src/modules/{service}/*.controller.ts
```

If the endpoint doesn't exist in the controller, either build it first or create a task.

---

### Pattern 11: Missing tenantId Filter in Queries

**Frequency:** Systemic risk (801 manual WHERE clauses)
**Symptom:** Tenant A can see Tenant B's data — critical security breach
**Root cause:** Manual `where: { tenantId }` injection is the sole isolation mechanism. Missing it from ANY query leaks data across tenants.
**Source:** Tribunal verdict TRIBUNAL-05 (2026-03-07)

**Wrong:**
```typescript
// DANGEROUS — returns ALL tenants' carriers
const carriers = await this.prisma.carrier.findMany({
  where: { status: 'ACTIVE' },
});
```

**Correct:**
```typescript
// ALWAYS include tenantId
const carriers = await this.prisma.carrier.findMany({
  where: { tenantId, status: 'ACTIVE', deletedAt: null },
});
```

**Better (future — Prisma Client Extension):**
```typescript
// Extension auto-injects tenantId and deletedAt: null
const carriers = await this.prisma.carrier.findMany({
  where: { status: 'ACTIVE' },
}); // tenantId + deletedAt automatically added by extension
```

**Rule:** EVERY Prisma query that touches a tenant-scoped model MUST include `tenantId` in the `where` clause. If you're writing a new service method, search for `tenantId` in the existing service to confirm the pattern. Future: Prisma Client Extension (QS-014) will auto-inject, but until then, manual filtering is required.

---

## Prevention Checklist

Before marking any feature complete, verify:

- [ ] API envelope unwrapped (`response.data.data` not `response.data`)
- [ ] All buttons have working handlers (click in Playwright)
- [ ] No empty `onClick={() => {}}`
- [ ] No mock data with `enabled: true`
- [ ] useEffect deps are stable (no function refs without useCallback)
- [ ] HTTP method verified against actual controller
- [ ] No doubled API prefix in URL
- [ ] No `window.location.reload()` — use `queryClient.invalidateQueries()`
- [ ] Loading state renders Skeleton
- [ ] Error state renders ErrorState component
- [ ] Empty state renders EmptyState component
- [ ] TypeScript types defined for all API responses
- [ ] tenantId included in every Prisma query WHERE clause
- [ ] Endpoint existence verified with grep before writing fetch call
- [ ] `pnpm check-types` passes with 0 errors
- [ ] Playwright screenshot taken of actual running feature
