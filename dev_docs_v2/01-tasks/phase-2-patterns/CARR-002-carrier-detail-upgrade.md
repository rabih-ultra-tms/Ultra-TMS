# CARR-002: Upgrade Carrier Detail Page

> **Phase:** 2 | **Priority:** P1 | **Status:** NOT STARTED
> **Effort:** M (3-4h)
> **Assigned:** Unassigned

## Context Header
Before starting, read:
1. CLAUDE.md (auto-loaded)
2. BUG-001 task file (carrier detail must be built first in Phase 0)
3. PATT-002 task file (detail page pattern)
4. `dev_docs/12-Rabih-design-Process/05-carrier/02-carrier-detail.md` — Full design spec

## Objective

Upgrade the basic carrier detail page (built in BUG-001) to use the DetailPage pattern from PATT-002. Add full design spec compliance: tier badge, insurance status indicators, document expiration warnings, load history tab, performance scorecard.

## File Plan

| Action | Path | What |
|--------|------|------|
| MODIFY | `apps/web/app/(dashboard)/carriers/[id]/page.tsx` | Refactor to use DetailPage pattern |
| MODIFY | `apps/web/components/carriers/carrier-overview-card.tsx` | Add tier badge, insurance indicators |
| CREATE | `apps/web/components/carriers/carrier-scorecard.tsx` | Performance scorecard (on-time %, claim rate) |
| CREATE | `apps/web/components/carriers/carrier-loads-tab.tsx` | Load history for this carrier |

## Acceptance Criteria

- [ ] Uses DetailPage pattern with tabs (Overview, Contacts, Insurance, Documents, Drivers, Loads)
- [ ] Tier badge shows carrier qualification level (Platinum/Gold/Silver/Bronze)
- [ ] Insurance section shows expiration warnings (amber for <30 days, red for expired)
- [ ] Documents show expiration warnings
- [ ] Loads tab shows recent loads assigned to this carrier
- [ ] Edit + Delete action buttons in header
- [ ] Breadcrumb navigation (Carriers > [Carrier Name])
- [ ] TypeScript compiles, lint passes

## Dependencies

- Blocked by: BUG-001 (basic carrier detail page), PATT-002 (detail page pattern)
- Blocks: None

## Reference

- Design: `dev_docs/12-Rabih-design-Process/05-carrier/02-carrier-detail.md`
- Dev prompt: `dev_docs/11-ai-dev/web-dev-prompts/05-carrier-ui.md`
