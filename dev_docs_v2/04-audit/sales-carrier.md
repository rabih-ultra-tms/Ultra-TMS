# Sales & Carrier Module Audit

**Grade:** D+ (4.0/10)
**Date:** February 8, 2026

---

## Summary

Two critical missing detail pages cause 404 errors. One monolithic 1,826-line file needs decomposition. 7 instances of `window.confirm()` should use ConfirmDialog. Truck Types page is gold-standard (8/10). Sales quotes list works but is basic.

---

## Page-by-Page Assessment

### Carrier Module

| Page | Path | Score | Issues |
|------|------|-------|--------|
| Carriers List | `carriers/page.tsx` | 6/10 | Works, pagination, but status colors hardcoded |
| **Carrier Detail** | `carriers/[id]/page.tsx` | **0/10** | **MISSING — 404 error** |
| Carrier Create | `carriers/new/page.tsx` | 5/10 | Basic form, window.confirm on unsaved changes |
| Carrier Edit | `carriers/[id]/edit/page.tsx` | 5/10 | Functional, window.confirm on cancel |

### Sales Module

| Page | Path | Score | Issues |
|------|------|-------|--------|
| Quotes List | `quotes/page.tsx` | 6/10 | Basic table, working pagination |
| Quote Detail | `quotes/[id]/page.tsx` | 5/10 | Shows data, limited actions |
| Quote Create | `quotes/new/page.tsx` | 5/10 | Form works, basic validation |

### Load Planner (Operations)

| Page | Path | Score | Issues |
|------|------|-------|--------|
| Load Planner List | `load-planner/page.tsx` | 6/10 | Table with filters |
| **Load Planner Edit** | `load-planner/[id]/edit/page.tsx` | **3/10** | **1,826 lines — monolithic, needs decomposition** |
| **Load History List** | `load-history/page.tsx` | 5/10 | Basic table |
| **Load History Detail** | `load-history/[id]/page.tsx` | **0/10** | **MISSING — 404 error** |

### Truck Types

| Page | Path | Score | Issues |
|------|------|-------|--------|
| Truck Types | `truck-types/page.tsx` | **8/10** | Gold standard — clean CRUD, inline edit, good UX |

---

## Critical Issues

### SC-001: Carrier Detail Page 404
- **Severity:** P0 Blocker
- **Path:** `/carriers/[id]/page.tsx`
- **Impact:** Users click carrier in list → 404. Cannot view carrier details, documents, insurance, drivers.
- **Backend:** `GET /api/v1/carriers/:id` returns full data with contacts, insurance, documents, drivers.
- **Fix:** Build carrier detail page with tabs (Overview, Contacts, Insurance, Documents, Drivers, Loads).

### SC-002: Load History Detail Page 404
- **Severity:** P0 Blocker
- **Path:** `/load-history/[id]/page.tsx`
- **Impact:** Users click load in history → 404. Cannot view load details, stops, check calls, rate confirmation.
- **Backend:** `GET /api/v1/loads/:id` returns full data with stops, check calls, tracking.
- **Fix:** Build load detail page with tabs (Overview, Stops, Tracking, Documents, Rate Confirmation).

### SC-003: Monolithic Load Planner Edit Page
- **Severity:** P1 Code Quality
- **File:** `load-planner/[id]/edit/page.tsx` — 1,826 lines
- **Impact:** Impossible to maintain. Multiple concerns in one file. Likely causes context rot for AI agents.
- **Fix:** Decompose into ~8 components: form header, customer section, stops section, rate section, documents section, route map, action buttons, validation logic.

### SC-004: window.confirm() × 7
- **Severity:** P1 UX
- **Files:** Multiple carrier and load-planner pages
- **Impact:** Browser native dialog, no styling, no accessibility. Inconsistent with rest of UI.
- **Fix:** Replace with `ConfirmDialog` component (already exists at `shared/confirm-dialog.tsx`).

### SC-005: Missing Search Debounce × 3
- **Severity:** P1 Performance
- **Files:** Carrier list, quotes list, load-planner list search inputs
- **Impact:** Every keystroke fires API request.
- **Fix:** Add `useDebounce` hook (already exists, used in Leads).

### SC-006: Hardcoded Status Colors
- **Severity:** P2 Design
- **Files:** Carrier list, load-planner list
- **Impact:** Inconsistent with design system. Colors don't match `design-system.md` tokens.
- **Fix:** Use StatusBadge component with design token colors.

---

## Truck Types: Gold Standard

`truck-types/page.tsx` scored 8/10 — the best page in Sales & Carrier:
- Clean CRUD with inline editing
- Proper table with pagination
- Good UX flow (create, edit, delete)
- Proper loading/error/empty states
- No console.logs, no `any` types

**Use as reference when building other pages.**

---

## Recommendations

1. **Week 1 (P0):** Build carrier detail page (SC-001) — 4-6 hours
2. **Week 1 (P0):** Build load history detail page (SC-002) — 3-4 hours
3. **Week 2:** Decompose load planner edit (SC-003) — 4-6 hours
4. **Week 1:** Replace window.confirm with ConfirmDialog (SC-004) — 1-2 hours
5. **Week 1:** Add search debounce (SC-005) — 30 min
6. **Week 2:** Standardize status colors (SC-006) — 1-2 hours
