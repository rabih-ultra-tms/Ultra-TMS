# Post-Verification Fixes Plan

> **Created:** 2026-03-09
> **Source:** 7 verification tests in `dev_docs_v3/05-audit/test-results/`
> **Status:** 3/3 phases complete
> **Test 8 (Runtime):** Pending — execute separately via QS-008

---

## Phase 1: Fix Now (< 1 hour, high impact, 7 items)

Start a new chat. Paste this prompt:

```
Read `dev_docs_v3/05-audit/POST-VERIFICATION-FIXES.md` for context.
Execute Phase 1 — fix these 7 specific documentation errors. No re-auditing, no re-verification. Just fix exactly what's listed.

### Fix 1: Communication hub self-contradictions
**File:** `dev_docs_v3/01-services/p1-post-mvp/12-communication.md`
- Section 6 (Hooks): Says "0 built" or "All Not Built" — change to "3 hooks built" (useEmail, useSms, useNotifications confirmed in PST-12)
- Section 11 (Known Issues) or any test reference: If it says "None" or "No tests" for test count, change to "8 spec files, 68 tests"
- Cross-check Section 1 and Section 2 match these corrections

### Fix 2: Commission hub test count
**File:** `dev_docs_v3/01-services/p0-mvp/08-commission.md`
- Find backend test count "42" anywhere in the file
- Change to "33" (verified by grep of actual `it(` calls in spec files)
- PST-08 said 42 but actual code has 33 — PST was wrong, hub inherited the error

### Fix 3: Cache hub test file count
**File:** `dev_docs_v3/01-services/p3-future/32-cache.md`
- Find "6 spec files" anywhere in the file
- Change to "8 spec files, 40 tests" (verified by actual file count)

### Fix 4: TMS Core hub — two fixes
**File:** `dev_docs_v3/01-services/p0-mvp/05-tms-core.md`
- Section 4: Change endpoint count from 51 to 45 (6 phantom endpoints — grep found only 45 decorators across 5 controllers)
- Section 8: Find CheckCall field count "6" — change to "20" (actual Prisma schema has 20 scalar fields)

### Fix 5: CRM hub — add missing routes
**File:** `dev_docs_v3/01-services/p0-mvp/03-crm.md`
- Section 3 (Screens): Add these 6 routes that exist in code but hub doesn't claim:
  - `/customers/[id]` — Customer Detail
  - `/customers/[id]/edit` — Customer Edit
  - `/customers/[id]/activities` — Customer Activities
  - `/customers/[id]/contacts` — Customer Contacts
  - `/customers/new` — Customer Create
  - `/activities` — Standalone Activities page
- The hub currently only mentions `/customers` as "redirects" — these are full CRUD pages

### Fix 6: Root index — add Command Center
**File:** `dev_docs_v3/01-services/_index.md`
- Change "All 38 Services" to "All 39 Services" in the title
- Add row for #39 Command Center (`p0-mvp/39-command-center.md`) to the P0 table

### Fix 7: Create p0-mvp index
**File:** `dev_docs_v3/01-services/p0-mvp/_index.md` (NEW FILE)
- Create an index listing all 11 files in p0-mvp/:
  01-auth-admin.md, 02-dashboard.md, 03-crm.md, 04-sales-quotes.md, 05-tms-core.md,
  06-carriers.md, 07-accounting.md, 08-commission.md, 09-load-board.md, 13-customer-portal.md,
  39-command-center.md
- Follow the format of existing `_index.md` files in p1-post-mvp, p2-extended, etc.

After all 7 fixes, update this file: change Phase 1 status to "Done" with date.
```

### Phase 1 Verification

After the fixes chat completes, spot-check:
- `grep -n "42" 08-commission.md` — should show 33, not 42
- `grep -n "6 spec" 32-cache.md` — should show 8, not 6
- `grep -n "51" 05-tms-core.md` — should show 45, not 51
- Check `p0-mvp/_index.md` exists with 11 entries

---

## Phase 2: Fix Next Session (2-3 hours, medium impact, 5 items)

Start a new chat. Paste this prompt:

```
Read `dev_docs_v3/05-audit/POST-VERIFICATION-FIXES.md` for context.
Execute Phase 2 — fix these 5 documentation issues. Read each hub file before editing.

### Fix 8: Add 16 missing models to hub Section 8s
These models are actively used in code but missing from their hub's data model section.
Read the Prisma schema (`apps/api/prisma/schema.prisma`) to get field counts.

| Model | Add to Hub | Fields to document |
|-------|-----------|-------------------|
| Session | 01-auth-admin.md | Read from schema |
| PasswordResetToken | 01-auth-admin.md | Read from schema |
| SalesQuota | 04-sales-quotes.md | Read from schema |
| StatusHistory | 05-tms-core.md | Read from schema |
| OrderItem | 05-tms-core.md | Read from schema |
| Driver | 06-carriers.md | Read from schema (36 fields) — also rename "CarrierDriver" to "Driver" |
| InsuranceCertificate | 06-carriers.md | Read from schema (30 fields) — also rename "CarrierInsurance" to "InsuranceCertificate" |
| FmcsaComplianceLog | 06-carriers.md | Read from schema |
| CapacityResult | 09-load-board.md | Read from schema |
| CapacitySearch | 09-load-board.md | Read from schema |
| CarrierCapacity | 09-load-board.md | Read from schema |
| PostLead | 09-load-board.md | Read from schema |
| PostingRule | 09-load-board.md | Read from schema |
| Load | 38-operations.md | Note: referenced via dashboard.service.ts |
| Order | 38-operations.md | Note: referenced via dashboard.service.ts |
| StatusHistory | 38-operations.md | Note: referenced via dashboard.service.ts |

For each model: add to Section 8 with model name, field count from schema, and a one-line description.
Mark added models with "(Added post-verification)" so they're traceable.

### Fix 9: Fix @Global() consumer lists
These 3 infra hubs have wrong consumer lists. Fix Section 7 (Dependencies / Consumers).

**Email (34):** `dev_docs_v3/01-services/p-infra/34-email.md`
- REMOVE: Communication (12) as consumer
- ADD: Auth (01) as the actual consumer (password reset, email verification)

**Storage (35):** `dev_docs_v3/01-services/p-infra/35-storage.md`
- REMOVE: Claims (10), Carrier Portal (14) as consumers
- ADD: Auth/Profile (01) as actual consumer (avatar uploads), Documents (11)

**Redis (36):** `dev_docs_v3/01-services/p-infra/36-redis.md`
- REMOVE: Scheduler, WebSocket as consumers
- SET actual consumers: Auth (01), Cache (32), Rate Intelligence (29), Config (31)

### Fix 10: Fix endpoint counts for 9 services
Use the grep-verified counts from Test 4. For each, update Section 4 header/total only.

| Service | Hub File | Current | Correct | Delta |
|---------|----------|---------|---------|-------|
| Commission | p0-mvp/08-commission.md | 31 | 28 | -3 |
| EDI | p3-future/26-edi.md | 38 | 35 | -3 |
| Carrier Portal | p1-post-mvp/14-carrier-portal.md | 56 | 54 | -2 |
| Carriers | p0-mvp/06-carriers.md | 52 | 50 | -2 |
| Audit | p3-future/30-audit.md | 33 | 31 | -2 |
| Agents | p2-extended/16-agents.md | 43 | 42 | -1 |
| Analytics | p2-extended/19-analytics.md | 41 | 40 | -1 |
| CRM | p0-mvp/03-crm.md | 48 | 49 | +1 (add the missing one) |
| Operations | p-infra/38-operations.md | 61 | 62 | +1 (add the missing one) |

### Fix 11: Remove phantom model from TMS Core
**File:** `dev_docs_v3/01-services/p0-mvp/05-tms-core.md`
- Section 8: If TrackingEvent still appears, remove it entirely (confirmed phantom — does not exist in Prisma schema)

### Fix 12: Rename task prefixes to eliminate collisions
**File:** `dev_docs_v3/01-services/p1-post-mvp/12-communication.md`
- Section 12: Rename all COMM-xxx task IDs to NOTIF-xxx

**File:** `dev_docs_v3/01-services/p1-post-mvp/14-carrier-portal.md`
- Section 12: Rename all CPORT-xxx task IDs to CPRT-xxx

After all fixes, update this file: change Phase 2 status to "Done" with date.
```

---

## Phase 3: Document Accepted Gaps (30 min)

Start a new chat. Paste this prompt:

```
Read `dev_docs_v3/05-audit/POST-VERIFICATION-FIXES.md` for context.
Execute Phase 3 — document accepted gaps so future sessions know what's intentional.

### Gap A: Field counts are business-field counts (not full Prisma counts)
**File:** `dev_docs_v3/00-foundations/session-kickoff.md`
- Add a note under the hub reading instructions:
  "Hub Section 8 field counts represent business fields only. They exclude 6 standard scaffold fields present on nearly every model: `externalId`, `sourceSystem`, `customFields`, `createdById`, `updatedById`, `deletedAt`. For exact field counts, check `schema.prisma` directly."

### Gap B: Cross-hub dependency asymmetry is known
**File:** `dev_docs_v3/05-audit/test-results/test-2-cross-hub-consistency.md`
- Add a section at the bottom: "## Resolution: Accepted as-is (2026-03-09). 66 asymmetric refs exist because hubs document their own dependencies but don't list all consumers. This is a documentation style choice, not an error. A full cross-reference pass would touch 30+ files for low developer impact."

### Gap C: 18+ orphan Prisma models are known dead code
**File:** `dev_docs_v3/05-audit/test-results/test-3-prisma-schema-source-of-truth.md`
- Add a section at the bottom: "## Resolution: Accepted as-is (2026-03-09). 18+ models exist in schema.prisma with zero code references. These are either planned features or dead code from earlier development. Add to technical debt backlog for schema cleanup sprint."

### Gap D: Update the progress tracker
**File:** `dev_docs_v3/05-audit/HUB-CORRECTION-PROGRESS.md`
- Add a new section "## Post-Verification Fixes (2026-03-09)" with:
  - Phase 1: 7 targeted fixes (list them)
  - Phase 2: 16 missing models, 3 consumer lists, 9 endpoint counts, 1 phantom removal, 2 prefix renames
  - Phase 3: 3 accepted gaps documented
  - Link to all 7 test result files

After all docs updated, change Phase 3 status in this file to "Done" with date.
```

---

## Status

| Phase | Scope | Items | Status | Date |
|-------|-------|-------|--------|------|
| 1 | Targeted fixes (high impact) | 7 | **Done** | 2026-03-09 |
| 2 | Missing models + consumers + counts | 5 | **Done** | 2026-03-09 |
| 3 | Document accepted gaps | 4 | **Done** | 2026-03-09 |

## Test Results Reference

| Test | File | Key Finding |
|------|------|-------------|
| 1 | test-1-code-to-doc-ground-truth.md | 80% three-way match, endpoints 99.5%, fields LOW |
| 2 | test-2-cross-hub-consistency.md | 55% asymmetric deps, @Global consumers wrong |
| 3 | test-3-prisma-schema-source-of-truth.md | 99.3% model names, 26% field accuracy |
| 4 | test-4-endpoint-count-verification.md | 97% within ±10%, TMS Core worst (-6) |
| 5 | test-5-frontend-route-to-hub-mapping.md | 90.8% coverage, 9 orphans, 35 P0 phantoms |
| 6 | test-6-task-issue-deduplication.md | 0 duplicate IDs, 2 prefix collisions |
| 7 | test-7-index-file-accuracy.md | 8/9 indexes accurate, p0-mvp missing |
| 8 | (pending) | Runtime smoke test — execute via QS-008 |

## Estimated Total Effort

| Phase | Time |
|-------|------|
| Phase 1 | ~45 min |
| Phase 2 | ~2 hours |
| Phase 3 | ~30 min |
| **Total** | **~3.5 hours** |
