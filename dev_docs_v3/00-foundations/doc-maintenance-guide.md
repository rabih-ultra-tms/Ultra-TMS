# Documentation Maintenance Guide

> How to keep dev_docs_v3 accurate as code changes
> **Created:** 2026-03-09 | **Sources:** Cross-cutting #16 (22 false "no tests" claims), #19 ("Not Built" claims wrong), #20 (endpoint counts wildly inaccurate)

## Why This Matters

The per-service tribunal (39 PSTs) found that documentation drift was the single biggest accuracy problem in the project:

- **22 of 39 services** had false "no tests" claims (cross-cutting #35)
- **Endpoint counts** were wrong by up to 8.9x (Load Board: 4 claimed vs 36 actual)
- **"Not Built" claims** were systematically wrong for frontend pages (cross-cutting #37)
- **Hub scores** were off by up to +5 points (cross-cutting #7, #12)

The root cause: hubs were written from specs BEFORE code was written, then never updated after implementation. This guide prevents that from happening again.

## When to Update Documentation

| Code Change | Update Required | Hub Section(s) | Urgency |
| --- | --- | --- | --- |
| New endpoint added | Required | S4 (API Endpoints), S1 (status box count) | Same session |
| Endpoint removed | Required | S4, S1 | Same session |
| New Prisma model/field | Required | S8 (Data Model) | Same session |
| New frontend page (route) | Required | S3 (Screens), S1 | Same session |
| New frontend component | Recommended | S5 (Components) | Within 1 week |
| New hook function | Recommended | S6 (Hooks) | Within 1 week |
| Bug fixed from Section 11 | Required | S11 (Known Issues) -- add ~~strikethrough~~ + date | Same session |
| New test file added | Recommended | S14 (Test Coverage) if count changes by 5+ | Within 1 week |
| Status machine change | Required | S10 (Status States) | Same session |
| Business rule added/changed | Required | S7 (Business Rules) | Same session |
| Quality score changed | Recommended | S3 (Screens) quality column | After QS-008 verification |

## Hub Update Checklist

When updating a hub file, verify these sections are still accurate:

- [ ] **S1:** Health score, confidence, last verified date
- [ ] **S4:** Endpoint count matches actual controllers (grep for `@Get/@Post/@Put/@Patch/@Delete` in the module's controller files)
- [ ] **S8:** Model count matches `schema.prisma` (grep for the service's models)
- [ ] **S11:** No issues listed as "Open" that are actually fixed
- [ ] **S14:** Test count roughly matches actual spec file count (check `__tests__/` and `*.spec.ts` files)

**Quick verification commands:**

```bash
# Count endpoints in a controller
grep -c '@Get\|@Post\|@Put\|@Patch\|@Delete' apps/api/src/modules/{service}/**/*.controller.ts

# Count spec files for a module
find apps/api/src/modules/{service} -name '*.spec.ts' | wc -l
find apps/web/__tests__/{service} -name '*.test.tsx' | wc -l

# Check if a frontend route exists
ls apps/web/app/\(dashboard\)/{route}/page.tsx
```

## Session End Ritual Addition

After completing a coding task (in addition to existing steps in session-kickoff.md):

1. Run build/test verification (existing -- `pnpm check-types && pnpm lint && pnpm --filter web test`)
2. **NEW: If you changed endpoints, models, or components -- update the service hub file**
3. **NEW: If you fixed a bug listed in a hub's Known Issues (Section 11) -- close it with ~~strikethrough~~ and add the fix date**
4. Update STATUS.md task status (existing)

## Monthly Freshness Audit

Every month, pick 5 random hub files and verify:

- Endpoint count matches actual controllers (grep for `@Get/@Post/@Put/@Patch/@Delete`)
- Model count matches actual schema (grep for relevant models in `schema.prisma`)
- Test count matches actual spec files
- Known issues still accurate (any fixed but not closed?)
- Screen quality scores still accurate (any improved since last check?)

**Process:**

1. Pick 5 hub files using random selection (e.g., `shuf -n 5` on the hub file list)
2. For each hub, run the verification commands above
3. If any count is off by > 10%, update the hub
4. If any known issue is listed as "Open" but is actually fixed, close it
5. Log the audit results in STATUS.md under a "Monthly Audit" section

## Automated Freshness Checks (Proposals)

See `doc-automation-proposals.md` for CI/CD integration ideas that would automate the monthly audit.

## Ownership Model

| Doc Category | Primary Owner | Review Cadence | Notes |
| --- | --- | --- | --- |
| Hub files (`01-services/`) | Feature developer who last modified the service | After every sprint | Most critical -- these are the source of truth |
| Foundation docs (`00-foundations/`) | Tech lead / senior developer | Monthly | Domain rules, data flow, architecture |
| Standards (`10-standards/`) | Tech lead | Quarterly | Testing standards, quality rubric, bug template |
| Audit docs (`05-audit/`) | Audit lead (whoever ran the tribunal) | After each audit cycle | Read-only after audit completes |
| STATUS.md | Session developer (whoever is coding) | Every session | Must be updated at session end |
| Task files (`03-tasks/`) | Assigned developer | When task status changes | Mark done/blocked/in-progress |

## Common Documentation Mistakes to Avoid

Based on tribunal findings:

1. **Don't write "Not Built" without checking.** Run `ls apps/web/app/(dashboard)/{route}/page.tsx` first. Cross-cutting #37 found 3+ services where hubs said "Not Built" but pages existed.
2. **Don't write "No tests" without checking.** Run `find apps -name '*.spec.ts' -path '*{service}*'` first. Cross-cutting #35 found 22 services with false "no tests" claims.
3. **Don't copy endpoint counts from specs.** Count actual decorators in controller files. Cross-cutting #20 found counts off by 0.8x to 8.9x.
4. **Don't list model field names from memory.** Open `schema.prisma` and verify. Cross-cutting #31 found model names wrong in 3+ services (e.g., `Notification` vs `InAppNotification`).
5. **Don't leave bugs as "Open" after fixing.** Add ~~strikethrough~~ and fix date. Cross-cutting #13 found 3+ services with resolved issues listed as Open.

## Related Documents

- Session kickoff: `dev_docs_v3/00-foundations/session-kickoff.md`
- Quality gates: `dev_docs_v3/00-foundations/quality-gates.md`
- Automation proposals: `dev_docs_v3/00-foundations/doc-automation-proposals.md`
- Cross-cutting addendum: `dev_docs_v3/05-audit/tribunal/per-service/_CROSS-CUTTING-ADDENDUM.md`
