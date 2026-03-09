# CC-004: Universal Detail Drawer (Polymorphic)

**Priority:** P0
**Effort:** M (6 hours)
**Status:** planned
**Assigned:** Claude Code
**Dependencies:** CC-001

---

## Context Header (Read These First)

1. `apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx` — Existing load drawer (1,535 LOC)
2. `apps/web/components/sales/quotes/quote-detail-overview.tsx` — Quote detail (reuse in quote drawer)
3. `apps/web/components/carriers/carrier-overview-card.tsx` — Carrier overview (reuse in carrier drawer)
4. `dev_docs_v3/01-services/p0-mvp/39-command-center.md` — Section 5 (Components)
5. `dev_docs/12-Rabih-design-Process/39-command-center/01-command-center.md` — Section 6 (Interactions)

---

## Objective

Create a polymorphic drawer component that can display load, quote, carrier, order, or alert details based on the entity type. Extends (not replaces) the existing dispatch-detail-drawer.

---

## Acceptance Criteria

- [ ] UniversalDetailDrawer accepts `type: 'load' | 'quote' | 'carrier' | 'order' | 'alert'` + entity data
- [ ] Load type renders existing dispatch-detail-drawer content (tabs: Overview, Stops, Carrier, Timeline, Docs, Check Calls)
- [ ] Quote type renders QuoteDetailOverview + QuoteActionsBar
- [ ] Carrier type renders CarrierOverviewCard + insurance + scorecard
- [ ] Only one drawer open at a time — opening a new entity closes the current one
- [ ] Unsaved changes trigger confirmation dialog before closing
- [ ] Drawer slides from right, 40-45% viewport width
- [ ] Escape key closes drawer
- [ ] Click outside (backdrop) closes drawer
- [ ] Focus trap inside drawer when open
- [ ] `aria-modal="true"` and proper ARIA labels
- [ ] `pnpm build` passes, `pnpm check-types` passes

---

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `apps/web/components/tms/command-center/universal-detail-drawer.tsx` | Polymorphic drawer shell + type routing |

### Modified Files

| File | Change |
|------|--------|
| `apps/web/components/tms/dispatch/dispatch-detail-drawer.tsx` | Extract drawer shell into reusable wrapper (keep load-specific content) |

---

## Architecture Notes

The drawer uses a **composition pattern**:

```tsx
<UniversalDetailDrawer type={drawerType} entityId={entityId} onClose={closeDrawer}>
  {/* Content rendered based on type */}
  {type === 'load' && <LoadDrawerContent loadId={entityId} />}
  {type === 'quote' && <QuoteDrawerContent quoteId={entityId} />}
  {type === 'carrier' && <CarrierDrawerContent carrierId={entityId} />}
</UniversalDetailDrawer>
```

The existing `dispatch-detail-drawer.tsx` becomes `LoadDrawerContent` — its internal tabs and data fetching remain unchanged. The new `UniversalDetailDrawer` provides the shell (slide animation, backdrop, close button, focus trap).
