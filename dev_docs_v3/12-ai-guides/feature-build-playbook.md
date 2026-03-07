# Feature Build Playbook

> Step-by-step guide for building a new screen end-to-end in Ultra TMS.

---

## Phase 1: Discovery (15 min)

### Step 1: Read the Service Hub

```
dev_docs_v3/01-services/p0-mvp/{service}.md
```

Find the screen in the Screens table. Note: status, quality score, known issues.

### Step 2: Read the Design Spec

```
dev_docs/12-Rabih-design-Process/{service-folder}/{screen}.md
```

Each spec has 15 sections: purpose, wireframe, component inventory, data fields, status machine, role matrix, WebSocket events, bulk ops, keyboard shortcuts, empty/error/loading states, print/export, responsive, accessibility, Stitch prompt, implementation notes.

### Step 3: Check Backend Existence

```bash
# Does the API module exist?
ls apps/api/src/modules/{service-name}/

# What methods does the service have?
grep "async " apps/api/src/modules/{service-name}/*.service.ts

# What endpoints does the controller expose?
grep "@(Get|Post|Put|Patch|Delete)" apps/api/src/modules/{service-name}/*.controller.ts
```

**If backend EXISTS:** Wire it up (don't rebuild).
**If backend DOES NOT exist:** Build API first (Phase 2a).

### Step 4: Check for Existing Hooks

```bash
ls apps/web/lib/hooks/{service-name}/
```

---

## Phase 2a: Backend (if needed) (1-2 hours)

1. Verify Prisma model exists in `apps/api/prisma/schema.prisma`
2. Create DTO classes with class-validator decorators
3. Create service with CRUD methods (include `tenantId` filter, `deletedAt: null`)
4. Create controller with REST endpoints + guards
5. Test with Swagger at `localhost:3001/api-docs`

---

## Phase 2b: Frontend Hooks (30 min)

Create hooks in `apps/web/lib/hooks/{service-name}/`:

```typescript
// Pattern for list hook
export function useItems(params?: ListParams) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: async () => {
      const response = await api.get('/api/v1/items', { params });
      return response.data.data; // Envelope unwrap: response.data.data
    },
  });
}

// Pattern for mutation hook
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateItemDto) => {
      const response = await api.post('/api/v1/items', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

**CRITICAL:** Always unwrap with `response.data.data` (not `response.data`).

---

## Phase 3: Page Component (1-3 hours)

### Step 1: Create the Route

```
apps/web/app/(dashboard)/{route}/page.tsx
```

### Step 2: Choose the Right Template

| Page Type | Key Elements |
|-----------|-------------|
| **List** | DataTable, search/filter bar, pagination, row actions |
| **Detail** | Header with actions, tabbed content, related items |
| **Form** | React Hook Form + Zod schema, field groups, submit handler |
| **Dashboard** | KPI cards, charts, recent activity, alerts |

### Step 3: Implement Loading/Error/Empty States

```typescript
if (isLoading) return <PageSkeleton />;
if (error) return <ErrorState message={error.message} retry={refetch} />;
if (!data?.length) return <EmptyState title="No items" action={<CreateButton />} />;
```

### Step 4: Wire Up All Interactive Elements

Every button MUST have a working handler. No `onClick={() => {}}`. No `window.confirm()` -- use `useConfirm()` hook or ConfirmDialog component.

---

## Phase 4: Quality Gates (15 min)

| Gate | Check | Blocking? |
|------|-------|-----------|
| L1: Functional | All buttons work, no empty handlers, no window.confirm | Yes |
| L2: Data | Real API data, loading/error/empty states, pagination | Yes |
| L3: Design | Design tokens (no hardcoded colors), spec layout, responsive | Yes |
| L4: Polish | Animations, keyboard shortcuts, print, a11y | No |

### Verification Commands

```bash
# TypeScript check
pnpm --filter web check-types

# Find anti-patterns
grep -rn "onClick={() => {}}" apps/web/app/ --include="*.tsx"
grep -rn "window.confirm" apps/web/ --include="*.tsx"
grep -rn '"Loading..."' apps/web/ --include="*.tsx"
grep -rn "text-red-\|bg-green-" apps/web/app/ --include="*.tsx"
```

---

## Phase 5: Update Documentation

1. Update screen status in `dev_docs_v3/01-services/p0-mvp/{service}.md`
2. Update `dev_docs_v3/STATUS.md` task status
3. Note any issues found in Known Issues section
