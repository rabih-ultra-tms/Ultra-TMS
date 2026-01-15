# Prompt 03: URL Prefix Fix

**Priority:** P0 (Critical)  
**Estimated Time:** 1 hour  
**Dependencies:** None  

---

## Objective

Remove duplicate `/api/v1` prefixes from controller paths. The global prefix is set in `main.ts` via `app.setGlobalPrefix('api/v1')`, but some controllers also include `api/v1` in their `@Controller()` decorator, causing URLs like `/api/v1/api/v1/loads`.

---

## Problem Analysis

**Current State in `main.ts`:**
```typescript
app.setGlobalPrefix('api/v1');
```

This means all routes automatically get `/api/v1` prefixed.

**Affected Controllers (11 files):**

| File | Current Path | Resulting URL (BROKEN) |
|------|--------------|------------------------|
| `modules/tms/loads.controller.ts` | `'api/v1/loads'` | `/api/v1/api/v1/loads` ❌ |
| `modules/tms/orders.controller.ts` | `'api/v1/orders'` | `/api/v1/api/v1/orders` ❌ |
| `modules/tms/stops.controller.ts` | `'api/v1/stops'` | `/api/v1/api/v1/stops` ❌ |
| `modules/load-board/rules.controller.ts` | `'api/v1/load-board/rules'` | ❌ |
| `modules/load-board/analytics.controller.ts` | `'api/v1/load-board/analytics'` | ❌ |
| `modules/load-board/accounts.controller.ts` | `'api/v1/load-board/accounts'` | ❌ |
| `modules/feedback/entries.controller.ts` | `'api/v1/feedback/entries'` | ❌ |
| `modules/feedback/widgets.controller.ts` | `'api/v1/feedback/widgets'` | ❌ |
| `modules/feedback/nps.controller.ts` | `'api/v1/feedback/nps'` | ❌ |
| `modules/feedback/surveys.controller.ts` | `'api/v1/feedback/surveys'` | ❌ |
| `modules/feedback/features.controller.ts` | `'api/v1/feedback/features'` | ❌ |

---

## Implementation Steps

### Step 1: Fix TMS Controllers

**File: `apps/api/src/modules/tms/loads.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/loads')

// AFTER
@Controller('loads')
```

**File: `apps/api/src/modules/tms/orders.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/orders')

// AFTER
@Controller('orders')
```

**File: `apps/api/src/modules/tms/stops.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/stops')

// AFTER
@Controller('stops')
```

### Step 2: Fix Load Board Controllers

**File: `apps/api/src/modules/load-board/rules.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/load-board/rules')

// AFTER
@Controller('load-board/rules')
```

**File: `apps/api/src/modules/load-board/analytics.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/load-board/analytics')

// AFTER
@Controller('load-board/analytics')
```

**File: `apps/api/src/modules/load-board/accounts.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/load-board/accounts')

// AFTER
@Controller('load-board/accounts')
```

### Step 3: Fix Feedback Controllers

**File: `apps/api/src/modules/feedback/entries.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/feedback/entries')

// AFTER
@Controller('feedback/entries')
```

**File: `apps/api/src/modules/feedback/widgets.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/feedback/widgets')

// AFTER
@Controller('feedback/widgets')
```

**File: `apps/api/src/modules/feedback/nps.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/feedback/nps')

// AFTER
@Controller('feedback/nps')
```

**File: `apps/api/src/modules/feedback/surveys.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/feedback/surveys')

// AFTER
@Controller('feedback/surveys')
```

**File: `apps/api/src/modules/feedback/features.controller.ts`**

```typescript
// BEFORE
@Controller('api/v1/feedback/features')

// AFTER
@Controller('feedback/features')
```

### Step 4: Verify No Other Duplicates

Run this command to find any remaining issues:

```bash
cd apps/api
grep -r "@Controller('api/v1" src/modules/
```

**Expected output:** No matches found

### Step 5: Update E2E Tests

Check test files that may reference the broken URLs:

```bash
grep -r "api/v1/api/v1" test/
```

Fix any test files that use the incorrect double-prefix URLs.

---

## Verification

### Test Correct URLs Work

```bash
# Start the server
cd apps/api
pnpm start:dev

# Test corrected endpoints
curl http://localhost:3001/api/v1/loads
curl http://localhost:3001/api/v1/orders
curl http://localhost:3001/api/v1/load-board/rules
curl http://localhost:3001/api/v1/feedback/nps

# All should return 200 or 401 (auth required), NOT 404
```

### Test Old URLs No Longer Work

```bash
# These should return 404
curl http://localhost:3001/api/v1/api/v1/loads
curl http://localhost:3001/api/v1/api/v1/orders

# Expected: {"statusCode":404,"message":"Cannot GET /api/v1/api/v1/loads"}
```

---

## Acceptance Criteria

- [ ] All 11 controllers updated to use relative paths
- [ ] `grep -r "@Controller('api/v1" src/modules/` returns 0 results
- [ ] All API endpoints accessible at correct URLs (`/api/v1/...`)
- [ ] Old broken URLs (`/api/v1/api/v1/...`) return 404
- [ ] E2E tests pass with correct URL paths
- [ ] `pnpm lint` passes
- [ ] `pnpm check-types` passes

---

## Quick Fix Script

If you want to fix all files at once, use this PowerShell script:

```powershell
$files = @(
    "apps/api/src/modules/tms/loads.controller.ts",
    "apps/api/src/modules/tms/orders.controller.ts",
    "apps/api/src/modules/tms/stops.controller.ts",
    "apps/api/src/modules/load-board/rules.controller.ts",
    "apps/api/src/modules/load-board/analytics.controller.ts",
    "apps/api/src/modules/load-board/accounts.controller.ts",
    "apps/api/src/modules/feedback/entries.controller.ts",
    "apps/api/src/modules/feedback/widgets.controller.ts",
    "apps/api/src/modules/feedback/nps.controller.ts",
    "apps/api/src/modules/feedback/surveys.controller.ts",
    "apps/api/src/modules/feedback/features.controller.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) -replace "@Controller\('api/v1/", "@Controller('" | Set-Content $file
        Write-Host "Fixed: $file"
    } else {
        Write-Host "Not found: $file"
    }
}
```

---

## Progress Tracker Update

After completing this prompt, update the **[README.md](README.md)** index file:

### 1. Update Prompt Status

Change prompt 03 row in the status table:
```markdown
| 03 | [URL Prefix Fix](...) | P0 | 1h | ✅ Completed | [Your Name] | [Date] |
```

### 2. Add Changelog Entry

```markdown
### [Date] - Prompt 03: URL Prefix Fix
**Completed by:** [Your Name]
**Time spent:** [X hours]

#### Changes
- Fixed 11 controllers with duplicate api/v1 prefix
- TMS controllers: loads, orders, stops
- Load Board controllers: rules, analytics, accounts
- Feedback controllers: entries, widgets, nps, surveys, features
- All endpoints now accessible at correct /api/v1/... URLs
```

---

## Notes

- This is a breaking change for any clients using the broken URLs
- No frontend code should be affected (frontend hasn't been built yet)
- E2E tests may need updates if they were written with broken URLs
- Always use relative paths in `@Controller()` decorators going forward
