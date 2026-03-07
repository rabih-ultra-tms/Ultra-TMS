# Bug Fix Playbook

> Step-by-step guide for diagnosing and fixing bugs in Ultra TMS.

---

## Step 1: Understand the Bug (5 min)

1. Read the bug description in `dev_docs_v3/01-services/p0-mvp/{service}.md` (Known Issues section)
2. Or find it in `dev_docs/Claude-review-v1/01-code-review/05-bug-inventory.md` (29 bugs indexed)
3. Note: severity, affected file, expected vs actual behavior

## Step 2: Classify the Bug Type

| Type | Symptoms | Investigation |
|------|----------|---------------|
| **404 Page** | Route returns "Not Found" | Check if `page.tsx` exists at the route path |
| **API Error** | Network request fails (4xx/5xx) | Check backend controller + service logs |
| **UI Broken** | Button doesn't work, wrong display | Check component handlers + props |
| **Data Wrong** | Shows incorrect/stale data | Check hook, API response envelope |
| **Type Error** | Build fails | Check TypeScript types match runtime |
| **Security** | Token exposure, data leak | Check auth guards, tenant filtering |

## Step 3: Locate the Code

```bash
# Find the page file
find apps/web/app -name "page.tsx" | grep "{route}"

# Find the component
grep -rn "ComponentName" apps/web/components/ --include="*.tsx" -l

# Find the hook
grep -rn "useHookName" apps/web/lib/hooks/ --include="*.ts" -l

# Find the API endpoint
grep -rn "/{path}" apps/api/src/modules/ --include="*.controller.ts"
```

## Step 4: Investigate Root Cause

### For frontend bugs:

```bash
# Check for empty handlers
grep -n "onClick={() => {}}" {file}

# Check for window.confirm
grep -n "window.confirm" {file}

# Check for hardcoded colors
grep -n "text-red-\|bg-green-\|text-yellow-" {file}

# Check for wrong envelope unwrapping
grep -n "response\.data[^.]" {file}  # Should be response.data.data
```

### For API bugs:

```bash
# Check tenant filtering
grep -n "tenantId" {service-file}  # Every query must have it

# Check soft delete filtering
grep -n "deletedAt" {service-file}  # Every query must check null

# Check auth guards
grep -n "@UseGuards" {controller-file}
```

## Step 5: Implement the Fix

### Rules:

1. **NEVER modify PROTECTED files** (Load Planner, Truck Types, Login)
2. **Always fix the root cause**, not the symptom
3. **Check for the same bug in similar files** (if window.confirm in one, check all)
4. **Maintain existing patterns** -- match the coding style of surrounding code

### Common Fix Patterns:

```typescript
// Replace window.confirm with useConfirm hook
// BEFORE:
if (window.confirm("Delete?")) { handleDelete(); }

// AFTER:
const { confirm } = useConfirm();
const handleDeleteClick = async () => {
  const ok = await confirm({ title: "Delete?", description: "This cannot be undone." });
  if (ok) handleDelete();
};
```

```typescript
// Fix envelope unwrapping
// BEFORE:
const data = response.data;  // WRONG

// AFTER:
const data = response.data.data;  // CORRECT
```

## Step 6: Verify the Fix

1. Run TypeScript check: `pnpm --filter web check-types`
2. Run tests: `pnpm --filter web test`
3. Test the happy path manually
4. Test edge cases (empty state, error state, concurrent users)
5. Check for regression in related features

## Step 7: Update Documentation

1. Update Known Issues in the service hub file
2. Update STATUS.md task status
3. Note any related issues discovered during investigation

## Common Bug Patterns in This Codebase

| Pattern | Count | Fix |
|---------|-------|-----|
| `window.confirm()` | 7 instances | Replace with `useConfirm()` or ConfirmDialog |
| Missing delete buttons | 4 screens | Add delete column/button + hook wiring |
| No search debounce | 3 lists | Add `useDebounce()` hook on search input |
| Hardcoded colors | Many files | Replace with design token classes |
| Missing 404 pages | 5 sidebar links | Create the page.tsx or fix the route |
| Empty `onClick` handlers | Various | Implement the actual handler logic |
