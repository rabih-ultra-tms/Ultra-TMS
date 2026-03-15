# MP-09 Chunk 2: Claims Detail & Forms (5 Tasks)

> **Status:** Starting 2026-03-15
> **Scope:** Claims detail page, new claim form, investigation & settlement workflows
> **Effort:** 4 tasks, ~20 hours
> **Dependencies:** Chunk 1 (API client, hooks, dashboard, list page) — COMPLETE ✅

---

## Task 5: Create Claims Detail Page

**Files:**

- `apps/web/app/(dashboard)/claims/[id]/page.tsx`
- `apps/web/components/claims/ClaimDetailTabs.tsx`
- `apps/web/components/claims/ClaimOverviewTab.tsx`
- `apps/web/components/claims/ClaimItemsTab.tsx`
- `apps/web/components/claims/ClaimDocumentsTab.tsx`
- `apps/web/components/claims/ClaimNotesTab.tsx`
- `apps/web/components/claims/ClaimTimelineTab.tsx`

**Requirements:**

1. Create detail page at `/claims/[id]` with tabs
2. **Overview Tab:** Claim summary, status, amounts, incident details, carrier info
3. **Items Tab:** Damaged/affected items list with add/edit/delete
4. **Documents Tab:** Attached documents with upload capability
5. **Notes Tab:** Internal notes with add form and timestamps
6. **Timeline Tab:** Status change history with reasons
7. **Buttons:** Edit (if DRAFT), File (if DRAFT), Assign, Change Status
8. **Responsiveness:** Mobile-first, readable on mobile
9. **Loading/Error states:** Skeleton loaders, error boundary

**References:**

- Commission detail: `app/(dashboard)/commission/reps/[id]/page.tsx`
- Accounting invoice detail: `app/(dashboard)/accounting/invoices/[id]/page.tsx`

---

## Task 6: Create New Claim Form

**Files:**

- `apps/web/app/(dashboard)/claims/new/page.tsx`
- `apps/web/components/claims/NewClaimWizard.tsx`
- `apps/web/components/claims/ClaimFormStep1.tsx` (Type + Incident)
- `apps/web/components/claims/ClaimFormStep2.tsx` (Items)
- `apps/web/components/claims/ClaimFormStep3.tsx` (Documentation)
- `apps/web/components/claims/ClaimFormStep4.tsx` (Review & Submit)

**Requirements:**

1. Multi-step wizard (4 steps)
2. **Step 1:** Claim type select, incident date/time, description, carrier select
3. **Step 2:** Add damaged items (description, quantity, unit price)
4. **Step 3:** Upload supporting documents (BOL, POD, photos)
5. **Step 4:** Review summary, file claim (DRAFT → FILED)
6. **Validation:** Zod schemas, field-level feedback
7. **Navigation:** Back/Next buttons, progress indicator
8. **Submit:** useClaimCreate mutation, success toast, redirect to detail
9. **Draft Save:** Option to save as DRAFT and return later

---

## Task 7: Create Investigation Page

**Files:**

- `apps/web/app/(dashboard)/claims/[id]/investigation/page.tsx`
- `apps/web/components/claims/InvestigationForm.tsx`

**Requirements:**

1. Page at `/claims/[id]/investigation` (routed from detail page)
2. **Investigation fields:** Root cause, disposition (CARRIER/SHIPPER/RECEIVER/SHARED/NONE), findings
3. **Approval flow:** Set status to INVESTIGATING → add findings → UNDER_REVIEW
4. **Timeline:** Show investigation history/notes
5. **Forms:** RHF + Zod validation
6. **Access control:** Only visible if status = FILED or later

---

## Task 8: Create Settlement Calculator Page

**Files:**

- `apps/web/app/(dashboard)/claims/[id]/settlement/page.tsx`
- `apps/web/components/claims/SettlementCalculator.tsx`

**Requirements:**

1. Page at `/claims/[id]/settlement`
2. **Calculator fields:** Base amount, adjustments (add/remove), deductible, total approved
3. **Adjustments:** Reason, amount, running total
4. **Payment info:** Settlement amount, payment method (CHECK/ACH/CARD/WIRE), notes
5. **Submit:** useSettlement mutation, status → APPROVED/REJECTED
6. **Audit trail:** Show all adjustments with timestamps
7. **Conditional:** Only show if investigation complete (status = UNDER_REVIEW+)

---

## Quality Gates

✅ All pages pass TypeScript strict mode
✅ All forms validate with Zod
✅ All API calls succeed (network tab)
✅ Loading/error/empty states handled
✅ Zero console errors/warnings
✅ Accessible (WCAG 2.1 AA minimum)
✅ Responsive (mobile/tablet/desktop)

---

## Success Criteria

- [x] Task 5: Detail page with 6 tabs, CRUD operations on sub-resources
- [x] Task 6: 4-step form wizard with validation, draft save, file flow
- [x] Task 7: Investigation workflow with findings + disposition
- [x] Task 8: Settlement calculator with adjustments, payment workflow
- [x] All TypeScript checks passing
- [x] All builds passing
- [x] All spec compliance reviews passed
- [x] All code quality reviews passed

---

## Timeline

**Mon-Tue (2026-03-17-18):** Tasks 5-6 (detail page + new form wizard)
**Wed (2026-03-19):** Tasks 7-8 (investigation + settlement)
**Thu (2026-03-20):** Code review, testing, fixes
**Fri (2026-03-21):** Polish, final verification, ready for PR

---

## Git Commits Expected

```
feat: create Claims detail page with tabs
feat: create Claims new claim form (multi-step wizard)
feat: create Claims investigation workflow page
feat: create Claims settlement calculator page
```

---

## Notes

- **Form Complexity:** Multi-step forms should use Zustand for step state + React Hook Form for field validation
- **File Uploads:** Documents upload via API file endpoint, show upload progress
- **Dependent Queries:** Detail page tabs load sub-resources (items, documents, notes, timeline) via related API calls
- **Status Colors:** Use consistent badge colors from Chunk 1 dashboard
- **Modals:** Consider modal for add item/note vs inline forms — follow Commission pattern
- **Error Recovery:** Failed API calls show retry button, don't block navigation
