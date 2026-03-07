# BLD-009: Load Edit

**Priority:** P0
**Service:** TMS Core
**Route:** `/operations/loads/[id]/edit`
**Page file:** `apps/web/app/(dashboard)/operations/loads/[id]/edit/page.tsx`

## Current State
Fully built (160 LOC). Uses `FormPage` pattern with `LoadFormSections` in edit mode. Complex stop mapping handles both load stops and order stops (different field naming conventions). Prisma Decimal conversion with `toNum` helper. Carrier info and order info extracted for form context. Customer rate derived from order relationship. Uses `useParams` for route params.

## Requirements
- Verify all form fields populate correctly from load data
- Stop field mapping handles divergent schemas (load: address/zip vs order: addressLine1/postalCode)
- Carrier assignment/change during edit
- Status-dependent field restrictions (e.g., cannot change stops after pickup)

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Form pre-populated with existing load data
- [ ] Carrier info displays correctly in form

## Dependencies
- Backend: `GET /loads/:id`, `PATCH /loads/:id`
- Hook: `apps/web/lib/hooks/tms/use-loads.ts` (useLoad, useUpdateLoad)
- Components: `FormPage`, `LoadFormSections`

## Estimated Effort
M
