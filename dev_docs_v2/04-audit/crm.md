# CRM Module Audit

**Grade:** B- (7.1/10)
**Date:** February 8, 2026

---

## Summary

Core CRUD operations work. Backend endpoints exist for all operations. Frontend missing Delete UI on both Contacts and Leads. Leads pipeline (Kanban) is functional with drag-drop. Search exists on Leads but not Contacts. Forms use proper Zod validation. No `any` types found.

---

## Module Scores

| Metric | Contacts | Leads | Overall |
|--------|----------|-------|---------|
| CRUD Completeness | B+ (8/10) | A- (8.5/10) | B+ (8.2/10) |
| Form Validation | A- (8.5/10) | A (9/10) | A- (8.7/10) |
| Search/Filter | C (5/10) | B+ (8/10) | B- (6.5/10) |
| Loading/Error States | A (8.5/10) | A- (8.5/10) | A- (8.5/10) |
| API Integration | B+ (8/10) | A- (8.5/10) | B+ (8.2/10) |
| UX Quality | B (7/10) | B (7/10) | B (7/10) |
| Code Quality | B+ (8/10) | B+ (8/10) | B+ (8/10) |

---

## Contacts Module

**CRUD:** Create, Read (list + detail), Update all work. **Delete UI missing** despite backend `DELETE /crm/contacts/:id` and `useDeleteContact()` hook both existing.

**Search:** No search input field. No filter by company or status. Backend supports these filters but UI doesn't expose them.

**Forms:** Zod schema validates firstName, lastName, email (optional but format-checked), phone, companyId (UUID), department (12 options), isPrimary (boolean). Missing: max length on text fields.

---

## Leads Module

**CRUD:** Create, Read (list + detail + pipeline), Update (including drag-drop stage change) all work. **Delete UI missing.** **Convert-to-customer missing** despite backend `POST /crm/opportunities/:id/convert` existing.

**Pipeline:** Dual view modes (table + Kanban). Drag-drop stage transitions work but have no confirmation dialog and use `console.error` instead of toast on failure.

**Search:** Debounced at 300ms (good). Stage filter works. Owner filter is a text input expecting UUID (should be dropdown).

**Forms:** Zod schema with strict enum validation for stage, probability bounded 0-100, UUID validation for companyId/ownerId.

---

## Critical Issues

### CRM-001: Delete UI Missing (Both Modules)
- **Severity:** P0
- **Files:** `contacts-table.tsx:56-63`, `contact-card.tsx:9-28`, `leads-table.tsx:56-63`, `leads/[id]/page.tsx:37-62`
- **Evidence:** Backend DELETE endpoints exist. `useDeleteContact()` hook defined at `use-contacts.ts:62-75` but never imported.
- **Fix:** Add delete buttons with ConfirmDialog to tables and detail pages.

### CRM-002: Owner Filter is Text Input
- **Severity:** P1
- **File:** `leads/page.tsx:93-98`
- **Detail:** Shows text input expecting UUID. Should be dropdown with user names.
- **Fix:** Replace with Select populated by `useUsers()` hook.

### CRM-003: No Confirmation on Stage Change
- **Severity:** P1
- **File:** `leads-pipeline.tsx:36-47`
- **Detail:** Drag-drop mutates immediately. No toast on success. `console.error` on failure.
- **Fix:** Add confirmation dialog + success/error toasts.

### CRM-004: Convert-to-Customer Not Wired
- **Severity:** P1
- **File:** `leads/[id]/page.tsx`
- **Detail:** Backend has `POST /crm/opportunities/:id/convert`. Hook `useConvertLead()` exists at `use-leads.ts:70-85`. No button in UI.
- **Fix:** Add "Convert to Customer" button in lead detail header.

### CRM-005: No Search on Contacts
- **Severity:** P2
- **File:** `contacts/page.tsx:15`
- **Detail:** `useContacts({ page, limit: 20 })` — no search/filter params exposed.
- **Fix:** Add search input + company/status filter dropdowns.

---

## Data Type Issues

- Contact has both `status` (enum) AND `isActive` (boolean) — inconsistent
- `contact-card.tsx:24` uses fallback: `contact.status || (contact.isActive ? "ACTIVE" : "INACTIVE")`
- Backend should clarify which field is canonical

---

## Customers Module

Redirects to `/companies` (intentional). Not a separate module.

---

## Recommendations

1. **Week 1:** Add delete buttons (CRM-001) — 2-3 hours
2. **Week 1:** Fix owner filter (CRM-002) — 1 hour
3. **Week 1:** Add stage change confirmation (CRM-003) — 1 hour
4. **Week 2:** Wire convert-to-customer (CRM-004) — 1-2 hours
5. **Week 2:** Add contacts search/filters (CRM-005) — 2-3 hours
