# PROTECT LIST — DO NOT TOUCH

These files are production-quality and must not be modified without explicit user permission.
Any AI agent working on this codebase must read this file before starting any session.

---

## Protected Files

| File / Route | Why Protected | Quality |
|---|---|---|
| `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx` | 1,825 LOC, AI cargo extraction, Google Maps integration, full quote lifecycle. Production-ready. | 9/10 |
| `apps/web/app/(dashboard)/truck-types/page.tsx` | Clean CRUD with inline editing. Gold standard for the codebase. | 8/10 |
| `apps/web/app/(auth)/login/page.tsx` | Working auth flow, properly secured. | 8/10 |

## What "Protected" Means

- **Do NOT rebuild** these pages even if asked to "rebuild from spec"
- **Do NOT refactor** unless a specific bug is identified
- **Do NOT change styling** without explicit stakeholder approval
- **You MAY** fix confirmed runtime bugs in these files if the bug is clearly identified with file:line

## How to Add to This List

After completing any feature that scores >=8/10 in the audit, add it here with:
- File path
- Why it's protected
- Quality score

## Audit Protect Candidates (not yet confirmed)

These scored well in audits but haven't been formally protected yet:
- `apps/web/components/tms/` — 31 design system components, stakeholder-approved V1 design
- `apps/api/src/modules/loads/loads.service.ts` — 19KB, comprehensive load management logic
- `apps/api/src/modules/orders/orders.service.ts` — 22KB, comprehensive order management logic
