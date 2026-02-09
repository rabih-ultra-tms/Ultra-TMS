# Code Improvement Plan - Ultra TMS (Gemini Review v2)

This document outlines granular, actionable improvements to address the findings in the Audit Report.

---

## 1. Frontend Refactoring Strategy (High Priority)

**Target**: `apps/web/app/(dashboard)/carriers/page.tsx`

### Current State
- **Lines**: ~859
- **Issues**: Monolothic file, hardcoded styles, mixed concerns.

### Refactoring Steps

#### Step 1: Create Shared UI Components
Create the following components in `apps/web/components/shared/`:
- `StatusBadge.tsx`: Replaces hardcoded `bg-green-100` spans. Accepts `status` and `variant` props.
- `DataTable.tsx`: A generic wrapper around the shadcn/tanstack table to handle sorting/pagination logic consistently.

#### Step 2: Extract Feature Components
Break `page.tsx` into:
- `CarrierStats.tsx`: The top row of cards.
- `CarrierFilters.tsx`: The search bar and dropdowns.
- `CarrierTable.tsx`: The desktop table view.
- `CarrierList.tsx`: The mobile card view.
- `CarrierDialog.tsx`: The "Add/Edit Carrier" modal.

#### Step 3: Implement Custom Hooks
Move logic out of the component:
- `useCarrierFilters()`: Manage state for search, status, type filters.
- `useCarrierSelection()`: Manage bulk selection logic.

---

## 2. Design System Implementation

**Target**: `apps/web/lib/design-tokens.ts` (New File)

### Action Items
1.  **Define Tokens**:
    ```typescript
    export const STATUS_COLORS = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      // ...
    } as const;
    ```
2.  **Replace Hardcoded Strings**:
    - Scan codebase for `bg-[color]-100` and replace with `STATUS_COLORS` or semantic aliases like `colors.status.success`.

---

## 3. Backend-Frontend Connection (The "Missing Features" Fix)

**Target**: `apps/web/lib/hooks/tms/` (New Directory)

### Current State
- Backend has `LoadsController` (`/loads`).
- Frontend has no `useLoads` hook.

### Action Items
1.  **Create Hook**: `useLoads.ts`
    ```typescript
    export const useLoads = (params: LoadQueryDto) => {
      return useQuery({
        queryKey: ['loads', params],
        queryFn: () => apiClient.get('/loads', params)
      });
    }
    ```
2.  **Verify Endpoints**:
    - Test `GET /loads` with Postman/cURL to confirm the controller is actually exposed and working.

---

## 4. API Standardization (Medium Priority)

**Target**: `apps/api/src/`

### Issue
- `Carriers` -> `/operations/carriers`
- `Loads` -> `/loads`
- `Orders` -> `/orders` (Assumed)

### Recommendation
Move all TMS core entities under a unified path.
1.  **Option A**: Everything is root (simple but crowded).
    - `/carriers`, `/loads`, `/orders`
2.  **Option B**: Domain-driven (recommended).
    - `/api/tms/loads`
    - `/api/tms/orders`
    - `/api/operations/carriers`

**Action**: Rename specific controllers' `@Controller()` paths to enforce consistency.

---

## 5. Testing Strategy

### Immediate Actions
1.  **Frontend**: Write **One** test for the new `CarrierStats` component.
    - proves the test setup works.
    - verifies that numbers render correctly.
2.  **Backend**: Run existing tests for `LoadsService`.
    - `npm run test -- loads.service.spec.ts`
    - If they fail, fixing them is P0.
