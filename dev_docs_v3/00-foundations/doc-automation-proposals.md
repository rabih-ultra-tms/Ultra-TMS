# Documentation Automation Proposals

> Ideas for keeping docs in sync with code automatically
> **Created:** 2026-03-09 | **Motivation:** Per-service tribunal found endpoint counts off by up to 8.9x, 22 false "no tests" claims, and systematic "Not Built" errors

## Proposal 1: Endpoint Count Validator

**Problem:** Hub Section 4 endpoint counts were wrong by 0.8x to 8.9x (cross-cutting #20). Load Board claimed 4 endpoints, actual was 36. Accounting claimed 17, actual was 54. TMS Core claimed 65, actual was 51.

**Solution:**
- Script: Parse all `*.controller.ts` files in each module directory
- Count HTTP method decorators (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`)
- Compare to the count stated in the corresponding hub file's Section 4
- Output: Warning if counts diverge by > 5%

**Trigger:** Pre-commit hook or CI check on PRs that modify `apps/api/src/modules/`

**Implementation sketch:**
```bash
#!/bin/bash
# count-endpoints.sh
for module_dir in apps/api/src/modules/*/; do
  module_name=$(basename "$module_dir")
  count=$(grep -rch '@Get\|@Post\|@Put\|@Patch\|@Delete' "$module_dir"**/*.controller.ts 2>/dev/null | paste -sd+ | bc)
  echo "$module_name: $count endpoints"
done
```

**Effort:** 4-8 hours to build (script + CI integration + hub file parser)
**ROI:** Prevents endpoint count drift -- the #1 accuracy issue found in tribunal

---

## Proposal 2: Model Count Validator

**Problem:** Hub Section 8 data models had wrong names (cross-cutting #31: `Notification` vs `InAppNotification`), missing models (EDI had 4 documented, 9 actual), and phantom models (TMS Core listed `TrackingEvent` which doesn't exist).

**Solution:**
- Script: Parse `schema.prisma`, extract all model names
- Map models to services based on naming convention or a manual mapping file
- Compare to hub Section 8 model lists
- Output: Warning if model count changes or names don't match

**Trigger:** After `prisma migrate` or when `schema.prisma` is modified

**Implementation sketch:**
```bash
#!/bin/bash
# count-models.sh
grep '^model ' apps/api/prisma/schema.prisma | awk '{print $2}' | sort
```

**Effort:** 2-4 hours to build
**ROI:** Prevents data model section drift. Less common than endpoint drift but more impactful when wrong (developers build code against wrong model assumptions).

---

## Proposal 3: Test Coverage Reporter

**Problem:** 22 of 39 services had false "no tests" claims (cross-cutting #35). Hub files were written before tests existed, then never updated. The number of spec files and test counts were systematically undercounted.

**Solution:**
- Script: Run `pnpm --filter api test:coverage` and `pnpm --filter web test:coverage`
- Parse Istanbul/c8 JSON output
- Extract per-module coverage percentages
- Update hub Section 14 (or generate a coverage dashboard file)
- Flag modules where hub claims "No tests" but spec files exist

**Trigger:** CI pipeline (weekly or on every PR)

**Implementation sketch:**
```bash
#!/bin/bash
# Check for spec files per module
for module_dir in apps/api/src/modules/*/; do
  module_name=$(basename "$module_dir")
  spec_count=$(find "$module_dir" -name '*.spec.ts' | wc -l)
  if [ "$spec_count" -gt 0 ]; then
    echo "$module_name: $spec_count spec files"
  fi
done
```

**Effort:** 4-8 hours to build (coverage run + parsing + hub update script)
**ROI:** Eliminates false "no tests" claims permanently. Also provides actual coverage baseline (currently estimated at ~15% BE -- never actually measured).

---

## Proposal 4: Stale Doc Detector

**Problem:** Hub files were written once and never updated. Some hubs hadn't been touched since initial creation despite significant code changes in their modules.

**Solution:**
- Script: For each hub file in `01-services/`, find the corresponding module directory
- Compare hub file `last-modified` date vs module directory's most recent file modification
- If module was modified > 2 weeks after hub, flag as potentially stale

**Trigger:** Weekly GitHub Action or local cron

**Implementation sketch:**
```bash
#!/bin/bash
# stale-doc-check.sh
for hub in dev_docs_v3/01-services/**/*.md; do
  hub_date=$(stat -c %Y "$hub" 2>/dev/null || stat -f %m "$hub")
  # Extract module name from hub filename (e.g., 05-tms-core.md -> tms)
  module=$(basename "$hub" .md | sed 's/^[0-9]*-//')
  module_dir="apps/api/src/modules/$module"
  if [ -d "$module_dir" ]; then
    newest=$(find "$module_dir" -type f -name '*.ts' -newer "$hub" | head -1)
    if [ -n "$newest" ]; then
      echo "STALE: $hub (module has newer files)"
    fi
  fi
done
```

**Effort:** 2-4 hours to build
**ROI:** Catches drift before it accumulates. Low effort, high visibility.

---

## Proposal 5: Frontend Route Scanner

**Problem:** Hub Section 3 screen lists had systematic "Not Built" errors (cross-cutting #37). Super Admin hub said "Not Built" but 16 frontend pages existed.

**Solution:**
- Script: Scan `apps/web/app/(dashboard)/` for all `page.tsx` files
- Map routes to services
- Compare to hub Section 3 screen lists
- Flag screens listed as "Not Built" that have a `page.tsx` file

**Trigger:** On PRs that add/remove page.tsx files

**Implementation sketch:**
```bash
#!/bin/bash
# scan-routes.sh
find apps/web/app -name 'page.tsx' | sort | while read -r page; do
  route=$(echo "$page" | sed 's|apps/web/app||; s|/page.tsx||; s|(dashboard)/||; s|(auth)/||')
  echo "$route"
done
```

**Effort:** 2-4 hours to build
**ROI:** Prevents the most embarrassing documentation error ("this page doesn't exist" when it does).

---

## Priority Order

| # | Proposal | Impact | Effort | Priority |
| --- | --- | --- | --- | --- |
| 1 | Endpoint Count Validator | High (was wrong by 8.9x for Load Board) | 4-8h | P1 -- build first |
| 2 | Stale Doc Detector | Medium (low effort, high visibility) | 2-4h | P1 -- build second |
| 3 | Test Coverage Reporter | High (eliminates 22 false claims) | 4-8h | P2 |
| 4 | Frontend Route Scanner | Medium (prevents "Not Built" errors) | 2-4h | P2 |
| 5 | Model Count Validator | Medium (less common drift) | 2-4h | P3 |

**Total effort for all 5:** 14-28 hours
**Recommended MVP:** Proposals 1 + 2 (6-12 hours) -- catches the two most impactful drift patterns

## Implementation Notes

- All scripts should be runnable locally (`./scripts/doc-check.sh`) and in CI
- Output format: markdown table that can be pasted into STATUS.md
- GitHub Action: run weekly on `main` branch, create an issue if drift detected
- Scripts live in `scripts/doc-tools/` directory (to be created)

## Related Documents

- Doc maintenance guide: `dev_docs_v3/00-foundations/doc-maintenance-guide.md`
- Cross-cutting addendum: `dev_docs_v3/05-audit/tribunal/per-service/_CROSS-CUTTING-ADDENDUM.md`
- STATUS.md: `dev_docs_v3/STATUS.md`
