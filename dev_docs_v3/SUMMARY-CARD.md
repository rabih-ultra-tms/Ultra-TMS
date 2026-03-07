# Ultra TMS — Summary Card

> One-page project snapshot. The "business card" of dev_docs_v3.
> Last updated: 2026-03-07

---

## Project Identity

| Field | Value |
|-------|-------|
| Product | Ultra TMS — 3PL Logistics Platform |
| Type | Multi-tenant SaaS, B2B |
| Stage | Post-initial-build, pre-production (Quality Sprint) |
| Health | C+ (6.2/10) → Target B- (7/10) after Quality Sprint |
| Repo | `rabih-ultra-tms/Ultra-TMS` (GitHub) |
| Contributors | Claude Code, Gemini/Codex (multi-AI team) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind 4 |
| UI | shadcn/ui (Radix UI), 31 TMS design system components |
| State | React Query (server) + Zustand (client) |
| Forms | React Hook Form + Zod |
| Backend | NestJS 10, TypeScript strict |
| Database | PostgreSQL 15, Prisma 6 ORM |
| Cache | Redis 7 |
| Search | Elasticsearch 8.13 |
| Auth | JWT in HttpOnly cookies, RBAC |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest 30 (web), Jest 29 + Supertest (api), Playwright (E2E) |

---

## Codebase Metrics (as of 2026-03-07)

| Metric | Count |
|--------|-------|
| Frontend routes | 98 |
| React components | 304 |
| Custom hooks | 51 |
| Backend modules | 35 active + 5 .bak |
| Prisma models | 260 |
| Prisma enums | 114 |
| DB migrations | 31 |
| Design spec files | 381 |
| Tests | 72 (8.7% coverage) |

---

## All 38 Services

### P0 MVP (9 services)

| # | Service | Backend | Frontend | Status |
|---|---------|---------|----------|--------|
| 01 | Auth & Admin | Production | Partial | C+ |
| 02 | Dashboard (Operations) | Production | Partial | C |
| 03 | CRM / Customers | Production | Partial | B- |
| 04 | Sales / Quotes | Production | Partial | C+ |
| 05 | TMS Core (Orders/Loads/Dispatch) | Production | Unverified | ? |
| 06 | Carrier Management | Production | Partial | D+ |
| 07 | Accounting | Partial | Not Built | D |
| 08 | Commission | Partial | Not Built | D |
| 09 | Load Board | Stub | Not Built | D |

### P1 Post-MVP (6 services)

| # | Service | Backend | Frontend |
|---|---------|---------|----------|
| 10 | Claims | Partial | Not Built |
| 11 | Documents | Partial | Not Built |
| 12 | Communication | Partial | Not Built |
| 13 | Customer Portal | Partial | Not Built |
| 14 | Carrier Portal | Partial | Not Built |
| 15 | Contracts | Partial | Not Built |

### P2 Extended (7 services)

| # | Service | Backend | Frontend |
|---|---------|---------|----------|
| 16 | Agents | Partial | Not Built |
| 17 | Credit | Partial | Not Built |
| 18 | Factoring Internal | Partial | Not Built |
| 19 | Analytics | Partial | Not Built |
| 20 | Workflow | Partial | Not Built |
| 21 | Integration Hub | Partial | Not Built |
| 22 | Search | Partial | Not Built |

### P3 Future (16 services)

HR, Scheduler, Safety, EDI, Help Desk, Feedback, Rate Intelligence, Audit, Config, Cache, Super Admin, Email, Storage, Redis, Operations (misc), Health

---

## Phase Breakdown

| Phase | Focus | Tasks | Est. Hours | Status |
|-------|-------|-------|-----------|--------|
| Quality Sprint | Fix P0 bugs, verify routes, add missing endpoints | 10 (QS-001 to QS-010) | ~42h | **Active** |
| Post-Quality | Build accounting + commission + TMS Core screens | ~20 | ~80h | Queued |
| TMS Core Completion | Verify and wire up TMS frontend | ~5 | ~20h | Blocked (QS-008 first) |
| Testing | E2E tests, unit test coverage | ~6 | ~20h | Queued |
| Infrastructure | CI/CD, logging, monitoring | ~5 | ~15h | Queued |
| Pre-Launch | Security hardening, legal, production deploy | ~10 | ~30h | Deferred |

---

## Active Tasks (Quality Sprint)

1. **QS-001** — WebSocket Gateways (XL, 14h) — P0
2. **QS-002** — Soft Delete Migration (M, 3h) — P1
3. **QS-003** — Accounting Dashboard Endpoint (M, 3h) — P0
4. **QS-004** — CSA Scores Endpoint (S, 2h) — P1
5. **QS-005** — Profile Page (L, 6h) — P1
6. **QS-006** — Check Call Form RHF (M, 3h) — P2
7. **QS-007** — CORS Env Variable (S, 30min) — P1
8. **QS-008** — Runtime Verification (L, 6h) — P0
9. **QS-009** — Delete .bak Dirs (S, 30min) — P3
10. **QS-010** — Triage 339 TODOs (M, 3h) — P2

---

## Protected Files (DO NOT TOUCH)

| File | Quality |
|------|---------|
| `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` | 9/10 |
| `apps/web/app/(dashboard)/truck-types/page.tsx` | 8/10 |
| `apps/web/app/(auth)/login/page.tsx` | 8/10 |

---

## Key Locations

| What | Where |
|------|-------|
| Master dashboard | `dev_docs_v3/STATUS.md` |
| Service hubs | `dev_docs_v3/01-services/p0-mvp/` |
| Active tasks | `dev_docs_v3/03-tasks/sprint-quality/` |
| API catalog | `dev_docs_v3/04-specs/api-catalog.md` |
| Session kickoff | `dev_docs_v3/00-foundations/session-kickoff.md` |
| Anti-patterns | `dev_docs_v3/05-audit/recurring-patterns.md` |
