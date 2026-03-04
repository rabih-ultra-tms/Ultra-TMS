# UI Design Overhaul — Phase 0 Audit Report

**Date:** 2026-02-17
**Project:** Ultra TMS
**Auditor:** Claude Code (Opus 4.6)

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16 |
| **UI Library** | React | 19 |
| **CSS** | Tailwind CSS | 4 |
| **Component Library** | shadcn/ui (Radix + CVA) | Latest |
| **Color Space** | OKLch (perceptually uniform) | — |
| **State Management** | React Query (TanStack Query) | v5 |
| **Forms** | React Hook Form + Zod | — |
| **API Layer** | REST (fetch-based, NestJS backend) | — |
| **Database** | PostgreSQL + Prisma | — |
| **Monorepo** | pnpm + Turborepo | — |
| **Icons** | Lucide React | — |
| **Fonts** | Inter (sans), Geist Mono (mono) | — |
| **Storybook** | @storybook/react-vite v8 | Port 6006 |

---

## 2. Page Inventory (119 routes)

| Section | Pages | Key Routes |
|---------|-------|-----------|
| **Auth** | 7 | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa`, `/superadmin/login` |
| **Dashboard Core** | 4 | `/dashboard`, `/profile`, `/profile/security`, `/activities` |
| **Admin** | 12 | `/admin/users/*`, `/admin/roles/*`, `/admin/settings`, `/admin/audit-logs`, `/admin/permissions`, `/admin/tenants/*` |
| **CRM — Companies** | 6 | `/companies`, `/companies/new`, `/companies/[id]`, `/companies/[id]/edit`, `/companies/[id]/contacts`, `/companies/[id]/activities` |
| **CRM — Contacts** | 4 | `/contacts`, `/contacts/new`, `/contacts/[id]`, `/contacts/[id]/edit` |
| **CRM — Leads** | 5 | `/leads`, `/leads/new`, `/leads/[id]`, `/leads/[id]/activities`, `/leads/[id]/contacts` |
| **Sales — Quotes** | 4 | `/quotes`, `/quotes/new`, `/quotes/[id]`, `/quotes/[id]/edit` |
| **Sales — Load Planner** | 2 | `/load-planner/[id]/edit` (PROTECTED), `/load-planner/history` |
| **Operations** | 7 | `/operations`, `/operations/dispatch`, `/operations/loads/*`, `/operations/tracking` |
| **Orders** | 4 | `/operations/orders`, `/operations/orders/new`, `/operations/orders/[id]`, `/operations/orders/[id]/edit` |
| **Carriers** | 3 | `/carriers`, `/carriers/[id]`, `/carriers/[id]/edit` |
| **Fleet** | 1 | `/truck-types` (PROTECTED) |
| **Accounting** | 10 | `/accounting`, `/accounting/invoices/*`, `/accounting/payments/*`, `/accounting/payables`, `/accounting/settlements/*`, `/accounting/reports/aging` |
| **Commissions** | 11 | `/commissions`, `/commissions/reps/*`, `/commissions/plans/*`, `/commissions/payouts/*`, `/commissions/transactions`, `/commissions/reports` |
| **Historical** | 3 | `/load-history`, `/load-history/[id]`, `/quote-history` |
| **Super Admin** | 1 | `/superadmin/tenant-services` |
| **Redirects** | 6 | `/customers/*` → `/companies/*` |
| **Public** | 2 | `/` (→ login), `/track/[trackingCode]` |
| **Rate Con** | 1 | `/operations/loads/[id]/rate-con` |

**Total: 93 unique pages + 6 redirects + 1 root = ~100 functional pages**

---

## 3. Component Inventory (285 files)

| Category | Count | Location |
|----------|-------|----------|
| **UI Primitives (shadcn)** | 35 | `components/ui/` |
| **Shared/Utility** | 12 | `components/shared/` |
| **Layout & Navigation** | 9 | `components/layout/` |
| **Auth** | 10 | `components/auth/` |
| **TMS Core** | 102 | `components/tms/` (20 subdirs) |
| **CRM** | 25 | `components/crm/` |
| **Admin** | 23 | `components/admin/` |
| **Accounting** | 18 | `components/accounting/` |
| **Commissions** | 10 | `components/commissions/` |
| **Sales/Quotes** | 10 | `components/sales/` |
| **Load Planner** | 13 | `components/load-planner/` |
| **Carriers** | 5 | `components/carriers/` |
| **Profile** | 5 | `components/profile/` |
| **Tracking (Public)** | 3 | `components/tracking/` |
| **Page Patterns** | 3 | `components/patterns/` |
| **Loads (Legacy)** | 2 | `components/loads/` |

---

## 4. Current Design System State

### Already Defined (Excellent Foundation)

The project has a **production-grade, 3-layer token architecture** already in place:

| Layer | What | Where |
|-------|------|-------|
| **Brand Tokens** | `--brand-hue: 222`, `--brand-chroma`, font families | `globals.css :root` |
| **Semantic Tokens** | 106 CSS custom properties (colors, shadows, transitions) | `globals.css :root` + `.dark` |
| **Tailwind Registration** | `@theme inline` mapping all tokens to Tailwind utilities | `globals.css` bottom |

### Token Categories (106 total)

| Category | Count | Examples |
|----------|-------|---------|
| Brand | 4 | `--brand-hue`, `--brand-chroma`, `--brand-l-light`, `--brand-l-dark` |
| Fonts | 2 | `--font-sans`, `--font-mono` |
| Core | 6 | `--background`, `--foreground`, `--card`, `--popover` |
| Primary | 5 | `--primary`, `--primary-hover`, `--primary-light`, `--primary-border` |
| Secondary/Muted | 4 | `--secondary`, `--muted` + foregrounds |
| Accent/Destructive | 4 | `--accent`, `--destructive` + foregrounds |
| Surfaces | 4 | `--surface`, `--surface-hover`, `--surface-selected`, `--surface-filter` |
| Text | 3 | `--text-primary`, `--text-secondary`, `--text-muted` |
| Borders | 4 | `--border`, `--border-soft`, `--input`, `--ring` |
| Status (6×3) | 18 | `--status-transit`, `-bg`, `-border` × 6 statuses |
| Intent (4×3) | 12 | `--intent-success`, `-bg`, `-border` × 4 intents |
| Shadows | 4 | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-drawer` |
| Transitions | 3 | `--transition-fast`, `--transition-base`, `--transition-slow` |
| Charts | 5 | `--chart-1` through `--chart-5` |
| Sidebar | 8 | `--sidebar`, `--sidebar-foreground`, etc. |
| Radius | 1 | `--radius: 0.375rem` |

### Design Approval Status
- **Rabih V1** design: ✅ APPROVED (Feb 12, 2026)
- Navy accent, Inter font, warm tan/beige borders, dot-label status badges
- Dark sidebar (`oklch(0.18 0.03 264)` — near black-navy)
- Full light + dark mode token support

### Storybook Coverage
- **26 story files** in `apps/web/stories/` — all building clean
- Covers: primitives, filters, stats, tables, panels, cards, timeline, finance, documents, alerts, layout

---

## 5. Existing Design Documentation

### Extremely Comprehensive (500+ files)

| Location | Files | Content |
|----------|-------|---------|
| `dev_docs_v2/00-foundations/design-system.md` | 1 | Current approved design reference |
| `dev_docs_v2/00-foundations/design-toolkit-guide.md` | 1 | Component decision tree |
| `dev_docs_v2/02-components/_index.md` | 1 | 117 components cataloged |
| `dev_docs/12-Rabih-design-Process/` | 89+ | Full-detail screen specs (15-section format) |
| `dev_docs/12-Rabih-design-Process/00-global/` | 17 | Design system, status colors, user journeys, accessibility |
| `memory/design-system.md` | 1 | 7-session build log |
| `apps/web/stories/` | 26 | Storybook visual stories |
| **Total design docs** | **135+** | |

### What's Already Defined vs Missing

| Aspect | Status |
|--------|--------|
| Color system (6 statuses + 4 intents) | ✅ Fully defined |
| Typography scale | ✅ Defined |
| Spacing system | ✅ Uses Tailwind scale |
| Border radius | ✅ Defined (`--radius: 0.375rem`) |
| Shadows | ✅ 4 levels defined |
| Dark mode tokens | ✅ Defined (not fully tested at scale) |
| Component tokens | ✅ 106 CSS custom properties |
| Animation/transitions | ✅ 3 speed levels |
| 89 screen wireframes | ✅ Full ASCII wireframe specs |
| Mobile responsiveness | ❓ Specs exist, not tested |
| Print stylesheets | ❓ Specs exist, not implemented |

---

## 6. Hardcoded Pattern Audit

### Summary

| Pattern Type | Violations | Files Affected |
|-------------|-----------|----------------|
| **Hardcoded color classes** | 1,008 | 137 |
| **Hardcoded shadow classes** | 68 | 47 |
| **Raw HTML elements** | 117 | 32 |
| **TOTAL** | **1,193** | **~150 files** |

### Top Color Families

| Family | Count | % |
|--------|-------|---|
| `text-gray-*` | 215 | 21.3% |
| `text-red-*` | 152 | 15.1% |
| `text-blue-*` | 121 | 12.0% |
| `text-slate-*` | 115 | 11.4% |
| `text-green-*` | 86 | 8.5% |
| `bg-gray-*` | 86 | 8.5% |
| `bg-blue-*` | 80 | 7.9% |
| `bg-red-*` | 70 | 6.9% |
| Other | 83 | 8.3% |

### Worst Offenders (Top 20 files)

| # | File | Colors | Shadows | Raw HTML |
|---|------|--------|---------|----------|
| 1 | `load-planner/[id]/edit/page.tsx` | 145 | 5 | 15 |
| 2 | `load-planner/RouteIntelligence.tsx` | 76 | 0 | 3 |
| 3 | `load-planner/ExtractedItemsList.tsx` | 58 | 0 | 2 |
| 4 | `tms/tracking/tracking-map.tsx` | 53 | 3 | 2 |
| 5 | `tms/stops/stop-card.tsx` | 46 | 1 | 0 |
| 6 | `load-planner/TruckSelector.tsx` | 45 | 0 | 11 |
| 7 | `load-planner/PlanComparisonPanel.tsx` | 42 | 0 | 0 |
| 8 | `load-planner/LoadPlanVisualizer.tsx` | 36 | 0 | 0 |
| 9 | `load-planner/RouteComparisonTab.tsx` | 30 | 0 | 0 |
| 10 | `load-planner/PermitSummaryCard.tsx` | 24 | 0 | 0 |
| 11 | `tms/tracking/tracking-sidebar.tsx` | 22 | 0 | 0 |
| 12 | `load-planner/TrailerDiagram.tsx` | 19 | 0 | 3 |
| 13 | `quote-history/page.tsx` | 19 | 0 | 0 |
| 14 | `tms/loads/load-status-badge.tsx` | 15 | 0 | 0 |
| 15 | `tms/dashboard/ops-needs-attention.tsx` | 14 | 0 | 9 |
| 16 | `tms/checkcalls/check-call-timeline.tsx` | 13 | 0 | 0 |
| 17 | `tms/tracking/tracking-pin-popup.tsx` | 12 | 0 | 2 |
| 18 | `tms/shared/status-badge.tsx` | 12 | 0 | 0 |
| 19 | `tms/dashboard/ops-alerts-panel.tsx` | 12 | 0 | 6 |
| 20 | `load-planner/history/page.tsx` | 12 | 0 | 0 |

### Critical Insight
**Load Planner components** (rows 1-2-3-6-7-8-9-10-12) account for **523 violations (51.8%)** — but are PROTECTED (production-ready, 1,825 LOC). Token migration is acceptable but must not break functionality.

### By Section

| Section | Color | Shadow | HTML | Total |
|---------|-------|--------|------|-------|
| **Load Planner** (PROTECTED) | 409 | 5 | 38 | 452 |
| **TMS Core** | 312 | 18 | 20 | 350 |
| **Pages (app/)** | 127 | 8 | 7 | 142 |
| **Sales/Quotes** | 30 | 2 | 0 | 32 |
| **Accounting** | 20 | 0 | 2 | 22 |
| **Carriers** | 17 | 0 | 2 | 19 |
| **UI Primitives** | 0 | 15 | 5 | 20 |
| **CRM** | 3 | 0 | 5 | 8 |
| **Commissions** | 6 | 0 | 0 | 6 |
| **Other** | 84 | 20 | 38 | 142 |

---

## 7. API Coverage & Mock Data

### Data Source Analysis

Most pages use **real API calls** via custom hooks (`useApi`, `useFetch`) to the NestJS backend. However, several pages contain mock/hardcoded data for:

| Page | Type | Issue |
|------|------|-------|
| Dashboard KPI cards | Mock | Hardcoded stats values |
| Dispatch board | Partial mock | Some static demo loads |
| Operations hub | Mock | Hardcoded navigation cards |
| Commission dashboard | Mock | Hardcoded stats |
| Accounting dashboard | Mock | Hardcoded recent invoices |

### Backend API Status
- **43 NestJS modules** with **150+ endpoints**
- **75% MVP-ready** (per backend audit)
- Backend is ahead of frontend — wire up, don't rebuild

---

## 8. PROTECT LIST

These pages/components must NOT have their functionality modified during the design overhaul:

| Item | Route | Quality | LOC |
|------|-------|---------|-----|
| **Load Planner** | `/load-planner/[id]/edit` | Production-ready | 1,825 |
| **Truck Types** | `/truck-types` | 8/10 | ~400 |
| **Login** | `/login` | 8/10 | ~200 |

Token migration (color class → semantic token) is acceptable for protected items, but zero functionality changes.

---

## 9. Design Inconsistencies Found

1. **Token adoption gap**: 106 semantic tokens defined but only ~30% adopted — 1,008 hardcoded color classes remain
2. **Shadow inconsistency**: 68 hardcoded shadow classes despite `--shadow-sm/md/lg/drawer` being defined
3. **Status badge fragmentation**: 3 separate status badge components (`tms/shared/status-badge.tsx`, `tms/loads/load-status-badge.tsx`, `shared/status-badge.tsx`) with different implementations
4. **Background inconsistency**: Some pages use `bg-white`, others use `bg-background` (should all use semantic)
5. **Text color inconsistency**: Mix of `text-gray-500/600/700` vs `text-muted-foreground` / `text-text-secondary`
6. **Border warmth**: Design specifies warm beige borders (`hue 35`) but many components use `border-gray-200` (cool gray)

---

## 10. Recommendations for Phase 1

Given the **existing excellent token foundation**, this project does NOT need a design direction from scratch. Instead:

1. **Skip Step 1.2** (Design Direction Options) — Rabih V1 is already approved
2. **Focus Phase 1** on identifying specific improvements to the approved design
3. **Phase 3** should focus on increasing token adoption (30% → 95%) rather than creating new tokens
4. **Phase 4-5** should prioritize the shell/navigation polish and key page refinement
5. **Phase 7** migration docs are the highest-value deliverable — enabling future sessions to systematically fix all 1,193 violations

---

*Generated by Phase 0 Discovery & Audit — UI Design Overhaul Process*
