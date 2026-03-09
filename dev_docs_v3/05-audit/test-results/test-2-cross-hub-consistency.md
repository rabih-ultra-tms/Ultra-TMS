# Test 2: Cross-Hub Consistency Report

**Date:** 2026-03-09
**Scope:** All 39 service hubs in `dev_docs_v3/01-services/`
**Method:** Exhaustive extraction of all hub Sections 3, 4, 7 + cross-reference analysis
**Mode:** READ-ONLY audit — no files modified

---

## Overall Assessment

| Check | Status | Score |
|-------|--------|-------|
| A: Dependency Symmetry | **FAIL** — 55% asymmetry rate, 66 one-way refs | 2/5 |
| B: Endpoint Collisions | **WARN** — 9 collisions, 2 critical | 3/5 |
| C: Shared Model Consistency | **WARN** — 2 field count contradictions, 1 ownership conflict | 3/5 |
| D: @Global() Consumer Accuracy | **FAIL** — 0% accuracy for Email & Storage, 33% for Redis | 1/5 |
| E: Frontend Route Ownership | **WARN** — 8 dual-claim conflicts, 2 orphans | 3/5 |

**Overall: 1/5 checks clean. Cross-hub consistency is poor.**

### Root Cause

Hubs were written independently without a cross-reference validation pass. Each hub author documented their own service's view of the world without checking whether referenced services agreed. The per-service tribunal corrected many internal inaccuracies but did NOT perform cross-hub reconciliation.

---

## A: Dependency Symmetry

**Total cross-references checked:** ~120
**Symmetric (both sides agree):** ~54
**Asymmetric (one-way reference):** ~66
**Asymmetry rate: ~55%**

### All Asymmetric References

| # | Claim | Missing Counter-Claim |
|---|-------|-----------------------|
| A-01 | 02→03 (Dashboard depends on CRM) | 03 doesn't list 02 as consumer |
| A-02 | 02→06 (Dashboard depends on Carriers) | 06 doesn't list 02 as consumer |
| A-08 | 04→09 (Sales claims Load Board as consumer) | 09 doesn't list 04 as upstream |
| A-18 | 08→19 (Commission claims Analytics as consumer) | 19 doesn't list 08 as upstream |
| A-19 | 09→06 (Load Board claims Carriers as consumer) | 06 doesn't list 09 as upstream |
| A-20 | 10→07 (Claims claims Accounting as consumer) | 07 doesn't list 10 as upstream |
| A-21 | 10→06 (Claims claims Carriers as consumer) | 06 doesn't list 10 as upstream |
| A-22 | 10→11 (Claims depends on Documents) | 11 doesn't list 10 as consumer |
| A-23 | 10→19 (Claims claims Analytics as consumer) | 19 doesn't list 10 as upstream |
| A-24 | 10→25 (Claims claims Safety as consumer) | 25 doesn't list 10 clearly |
| A-25 | 15→11 (Contracts depends on Documents) | 11 doesn't list 15 as consumer |
| A-26 | 11→16 (Documents claims Agents as consumer) | 16 doesn't list 11 as upstream |
| A-28 | 12→10 (Communication claims Claims as consumer) | 10 doesn't list 12 as upstream |
| A-29 | 13→03 (Customer Portal claims CRM as consumer) | 03 doesn't list 13 |
| A-30 | 13→04 (Customer Portal claims Sales as consumer) | 04 doesn't list 13 |
| A-31 | 14→07 (Carrier Portal claims Accounting as consumer) | 07 doesn't list 14 |
| A-32 | 14→06 (Carrier Portal claims Carriers as consumer) | 06 doesn't list 14 |
| A-33 | 15→16 (Contracts depends on Agents) | 16 doesn't list 15 as consumer |
| A-34 | 15→04 (Contracts claims Sales as consumer) | 04 doesn't list 15 |
| A-35 | 15→08 (Contracts claims Commission as consumer) | 08 doesn't list 15 |
| A-36 | 15→13 (Contracts claims Customer Portal as consumer) | 13 doesn't list 15 |
| A-37 | 15→14 (Contracts claims Carrier Portal as consumer) | 14 doesn't list 15 |
| A-38 | 15→19 (Contracts claims Analytics as consumer) | 19 doesn't list 15 |
| A-39 | 17→03 (Credit claims CRM as consumer) | 03 doesn't list 17 |
| A-40 | 17→04 (Credit claims Sales as consumer) | 04 doesn't list 17 |
| A-41 | 17→05 (Credit claims TMS Core as consumer) | 05 doesn't list 17 |
| A-42 | 17→07 (Credit claims Accounting as consumer) | 07 doesn't list 17 |
| A-43 | 18→06 (Factoring claims Carriers as consumer) | 06 doesn't list 18 |
| A-44 | 18→14 (Factoring claims Carrier Portal as consumer) | 14 doesn't list 18 |
| A-45 | 18→19 (Factoring claims Analytics as consumer) | 19 doesn't list 18 |
| A-46 | 20→05 (Workflow depends on TMS Core) | 05 doesn't list 20 as consumer |
| A-47 | 20→07 (Workflow depends on Accounting) | 07 doesn't list 20 |
| A-48 | 20→12 (Workflow depends on Communication) | 12 doesn't list 20 as consumer |
| A-49 | 23→07 (HR claims Accounting as consumer) | 07 doesn't list 23 |
| A-50 | 25→06 (Safety claims Carriers as consumer for CSA) | 06 doesn't list 25 |
| A-52 | 26→05 (EDI depends on TMS Core) | 05 doesn't list 26 as consumer |
| A-53 | 26→07 (EDI depends on Accounting) | 07 doesn't list 26 |
| A-54 | 29→04 (Rate Intelligence claims Sales as consumer) | 04 doesn't list 29 |
| A-55 | 29→06 (Rate Intelligence claims Carriers as consumer) | 06 doesn't list 29 |
| A-56 | 29→07 (Rate Intelligence claims Accounting as consumer) | 07 doesn't list 29 |
| A-57 | 29→19 (Rate Intelligence claims Analytics as consumer) | 19 doesn't list 29 |
| A-58 | 38→04 (Operations claims Sales as consumer) | 04 doesn't list 38 |
| A-59 | 38→06 (Operations claims Carriers as consumer) | 06 doesn't list 38 |
| A-60 | 38→39 (Operations claims Command Center as consumer) | 39 doesn't list 38 (lists 05 instead) |
| A-61 | 39→04 (Command Center depends on Sales) | 04 doesn't list 39 |
| A-62 | 39→06 (Command Center depends on Carriers) | 06 doesn't list 39 |
| A-63 | 39→07 (Command Center depends on Accounting) | 07 doesn't list 39 |
| A-64 | 16→03 (Agents claims CRM as consumer) | 03 doesn't list 16 |
| A-65 | 16→07 (Agents claims Accounting as consumer) | 07 doesn't list 16 |
| A-66 | 16→08 (Agents claims Commission as consumer) | 08 doesn't list 16 |

### Worst Offenders: Missing Inbound References

| Hub | Missing inbound refs | Count |
|-----|---------------------|-------|
| **06 Carriers** | 02, 09, 10, 14, 18, 25, 29, 38, 39 | **9** |
| **07 Accounting** | 10, 14, 16, 17, 20, 23, 26, 29, 39 | **9** |
| **04 Sales** | 09, 13, 15, 17, 29, 38, 39 | **7** |
| **19 Analytics** | 08, 10, 15, 18, 29 | **5** |
| **03 CRM** | 02, 13, 16, 17 | **4** |

---

## B: Endpoint Path Collisions

**Total unique endpoint prefixes:** ~45
**Collisions found:** 9

| # | Path Prefix | Services | Severity | Notes |
|---|-------------|----------|----------|-------|
| B-01 | `/operations/dashboard/*` | 02, 05, 38 | **CRITICAL** | Triple claim — runtime collision risk |
| B-02 | `/operations/carriers/*` | 06, 38 | **HIGH** | Both register same NestJS controller route |
| B-03 | `/accounting/*` base routes | 02, 07 | MEDIUM | 02 claims `/accounting/dashboard` + `/accounting/aging` under 07's prefix |
| B-04 | `/commissions/*` base routes | 02, 08 | MEDIUM | 02 claims `/commissions/dashboard` + `/commissions/reports` under 08's prefix |
| B-05 | `/carrier-portal/dashboard/*` | 02, 14 | MEDIUM | Dashboard claims sub-routes under Carrier Portal's prefix |
| B-06 | `/portal/dashboard/*` | 02, 13 | MEDIUM | Dashboard claims sub-routes under Customer Portal's prefix |
| B-07 | `/auth/*`, `/users/*`, `/roles/*` | 01, 33 | **CRITICAL** | Identical top-level routes — 33 is a role overlay on 01's module, hubs don't clarify this |
| B-08 | `/tenant-services/*` | 31, 33 | MEDIUM | Both claim tenant-services endpoints |
| B-09 | `/orders/:id/edi-documents`, `/loads/:id/edi-documents` | 26 nests under 05 | LOW | EDI adds sub-routes under TMS Core's namespace |

**Known overlap:** Operations (38) and Carriers (06) — both hubs claim `/operations/carriers/*`. Hub 38 explains this is because Operations is the umbrella NestJS module containing the carriers sub-module. Hub 06 documents the logical carrier domain. The hubs do NOT clearly explain this dual-ownership structure — Hub 06 should note that its endpoints are physically hosted in the Operations module (38).

---

## C: Shared Model Consistency

| # | Model | Hub A | Hub B | Delta | Severity |
|---|-------|-------|-------|-------|----------|
| C-01 | **Tenant** | 01 (Auth): 11 fields | 33 (Super Admin): 20+ fields | +9 | **HIGH** — Auth undercounts or documents subset |
| C-02 | **AuditLog** | 01 (Auth): 12 fields | 30 (Audit): 21 fields | +9 | **HIGH** — Auth documents subset; Audit owns full model |
| C-03 | **OperationsCarrier** | 06 (Carriers): 41 fields, "owned" | 38 (Operations): listed as "owned" | Dual ownership | **MEDIUM** — Only 1 Prisma model; 2 hubs claim ownership |

**Notes:**
- User model: Only Hub 01 gives a field count (21 fields). Other hubs reference User but don't contradict the count.
- The Tenant/AuditLog discrepancies likely mean Auth (01) documents only the fields it uses, while the canonical owners (33, 30) document the full schema. This is confusing — hubs should standardize on "full model" or explicitly say "uses N of M fields."

---

## D: @Global() Consumer Accuracy

| Module | Hub Claims Consumers | Actual Verified Consumers | Hub Accuracy | Consumer Hubs Acknowledge? |
|--------|---------------------|--------------------------|--------------|---------------------------|
| **Email (34)** | Communication (12) | Auth (01) only | **0%** | 01 mentions SendGrid but not "Email (34)" explicitly |
| **Storage (35)** | Claims (10), Carrier Portal (14) | Documents (11), Auth/Profile (01) | **0%** | 11 lists 35; 01 does NOT list 35 |
| **Redis (36)** | Scheduler, WebSocket, Config | Auth (01), Cache (32), Rate Intel (29), Config (31) | **33%** (only Config correct) | All 4 actual consumers acknowledge the dependency |

**Post-tribunal correction status:** The cross-cutting addendum (finding #33) identified this ~33% accuracy problem. However, the hub files themselves were NOT corrected — they still contain the phantom consumer lists. The corrections exist only in the addendum document, not in the hubs.

**Additional finding:** Auth (01) is a verified consumer of Storage (35) for avatar uploads, but neither Auth's hub nor Storage's hub documents this relationship.

---

## E: Frontend Route Ownership

**Total actual routes (filesystem):** 98
**Routes claimed by exactly 1 hub:** ~85
**Routes claimed by 2+ hubs:** 8 conflicts
**Routes claimed by 0 hubs:** 2 orphans

### Routes Claimed by 2+ Hubs

| # | Route(s) | Hubs | Resolution |
|---|----------|------|------------|
| E-01 | `/load-history`, `/load-history/[id]` | 04 (Sales), 06 (Carriers) | Need single owner — likely 04 or 05 |
| E-02 | `/operations/dispatch` | 05 (TMS Core), 39 (Command Center) | Acceptable: 05 owns current, 39 will compose on top |
| E-03 | `/accounting` (base) | 02 (Dashboard), 07 (Accounting) | 07 should own; 02 consumes via dashboard widget |
| E-04 | `/commissions` (base) | 02 (Dashboard), 08 (Commission) | 08 should own |
| E-05 | `/load-board` (base) | 02 (Dashboard), 09 (Load Board) | 09 should own |
| E-06 | `/admin/users/*`, `/admin/roles/*` | 01 (Auth), 33 (Super Admin) | 01 should own; 33 documents the SUPER_ADMIN role overlay |
| E-07 | `/admin/audit-logs` | 01 (Auth), 30 (Audit) | 30 should own the audit domain; 01 just hosts the route |
| E-08 | `/superadmin/login` | 01 (Auth), 33 (Super Admin) | 01 owns auth flow; 33 documents the page |

### Domain Mismatches

| Hub | Route | Issue |
|-----|-------|-------|
| 06 (Carriers) | `/load-history/*` | Load history is operational, not carrier domain |
| 02 (Dashboard) | `/accounting`, `/commissions`, `/load-board` | Dashboard aggregates but shouldn't "own" section landing pages |
| 04 (Sales) | `/load-planner/[id]/edit` | Cross-cutting (PROTECTED, 1,825 LOC) — could be TMS Core |

### Orphan Routes (actual routes claimed by 0 hubs)

| Route | Expected Owner |
|-------|----------------|
| `/activities` | CRM (03) — standalone activity feed |
| `/track/[trackingCode]` | Customer Portal (13) or TMS Core (05) — public tracking |

---

## Recommendations

### Fix Priority

1. **CRITICAL:** Resolve endpoint collisions B-01 (`/operations/dashboard/*` triple-claim) and B-07 (`/auth/*` dual-claim) — these can cause runtime bugs
2. **HIGH:** Correct @Global() consumer lists in hubs 34, 35, 36 (transfer addendum findings into actual hub files)
3. **HIGH:** Designate single owner for OperationsCarrier model (either 06 or 38, not both)
4. **MEDIUM:** Batch-fix 66 asymmetric dependency refs (systematic doc update)
5. **MEDIUM:** Assign route ownership for 8 dual-claimed routes + 2 orphans
6. **LOW:** Standardize shared model field documentation (full count vs subset notation)

### Suggested Process Improvements

- **Add a cross-reference validation step** to the hub update workflow: when updating Section 7 of any hub, require checking that all referenced services have matching counter-entries
- **Establish canonical model owners**: each Prisma model should be owned by exactly one hub; other hubs that reference the model should say "references Model (owned by Hub N)"
- **Clarify the Dashboard (02) pattern**: Hub 02 aggregates data from many services but should NOT claim ownership of those services' routes or endpoints — it should be documented as a "consumer-only" service
- **Apply tribunal corrections to hub files**: findings from `_CROSS-CUTTING-ADDENDUM.md` need to be backported into the actual hub files they reference

## Resolution: Accepted as-is (2026-03-09)

66 asymmetric refs exist because hubs document their own dependencies but don't list all consumers. This is a documentation style choice, not an error. A full cross-reference pass would touch 30+ files for low developer impact.
