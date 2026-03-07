# BLD-021: Settlement Detail

**Priority:** P0
**Service:** Accounting
**Route:** `/accounting/settlements/[id]`
**Page file:** `apps/web/app/(dashboard)/accounting/settlements/[id]/page.tsx`

## Current State
Fully built (423 LOC). Uses `DetailPage` pattern with tabs: Overview (settlement details, financial summary with gross/deductions/net, timeline with created/approved/processed/paid dates, notes) and Line Items (constituent loads with amounts, gross total, deductions, net payout). Actions: Approve (CREATED status), Process Payout (APPROVED status), Delete (CREATED status only). Full workflow: CREATED -> APPROVED -> PROCESSED.

## Requirements
- Verify params typing for Next.js 16 (uses old `{ params: { id: string } }` pattern)
- Verify approve/process/delete mutations connect to backend
- Ensure financial calculations match backend values
- Add confirmation dialogs for destructive actions

## Acceptance Criteria
- [ ] All interactive elements work (buttons, forms, links)
- [ ] API calls succeed with proper error handling
- [ ] Loading, error, and empty states handled
- [ ] Responsive layout
- [ ] TypeScript strict -- no `any` types
- [ ] Approval workflow works end-to-end
- [ ] Process Payout triggers payment recording
- [ ] Financial summary accurate (gross, deductions, net)

## Dependencies
- Backend: `GET /settlements/:id`, `POST /settlements/:id/approve`, `POST /settlements/:id/process`, `DELETE /settlements/:id`
- Hook: `apps/web/lib/hooks/accounting/use-settlements.ts`
- Components: `DetailPage`, `SettlementStatusBadge`

## Estimated Effort
M
