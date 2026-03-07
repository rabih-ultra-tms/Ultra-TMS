# Commission Plan Detail

**Route:** `/commissions/plans/[id]`
**File:** `apps/web/app/(dashboard)/commissions/plans/[id]/page.tsx`
**LOC:** 338
**Status:** Complete

## Data Flow

- **Hooks:** `usePlan` + `useActivatePlan` + `useDeletePlan` (`lib/hooks/commissions/use-plans`), `useReps` (`lib/hooks/commissions/use-reps`)
- **API calls:** `GET /api/v1/commissions/plans/{id}`, `PATCH /api/v1/commissions/plans/{id}/activate`, `DELETE /api/v1/commissions/plans/{id}`, `GET /api/v1/commissions/reps?limit=100`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** Custom (header with actions + cards for configuration, tiers, assigned reps)
- **Key components:** Card, Badge, Button, Skeleton, ConfirmDialog (`components/shared/confirm-dialog`), Link, inline TierTable component
- **Interactive elements:** "Set as Default" button (conditional on non-default), "Edit" Link button, "Delete" button (opens ConfirmDialog, disabled when reps assigned), back arrow link, rep rows clickable (navigate to rep detail). All wired with proper guards.

## State Management

- **URL params:** `id` from `useParams()` (cast `as string`)
- **React Query keys:** Via `usePlan(planId)`, `useReps({ limit: 100 })`
- **Local state:** `showDeleteDialog` (boolean)

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - `useReps({ limit: 100 })` then client-side filter `rep.planId === planId` -- fetches all reps, filters locally. Won't scale past 100 reps.
- **Anti-patterns:**
  - 338 LOC -- large page file
  - Inline `TierTable` component (lines 61-101) and `PLAN_TYPE_LABELS`/`PLAN_TYPE_ICONS` maps defined in page
  - Client-side rep filtering instead of API param `?planId={id}`
- **Missing:** Loading state via Skeleton (good). Delete has ConfirmDialog (good -- unlike accounting pages). Delete prevented when reps assigned (good business logic guard). No error state shown. Well-structured overall despite inline components.
