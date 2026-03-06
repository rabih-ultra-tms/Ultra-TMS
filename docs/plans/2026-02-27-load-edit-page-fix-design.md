# Load Edit Page Fix — Design

> Date: 2026-02-27
> Scope: Fix P0 + P1 gaps on `/operations/loads/:id/edit`
> Files: form-page.tsx, load-form.tsx, edit/page.tsx

## Problem

The Load Edit page has critical gaps:

1. **Form data doesn't populate** — `FormPage` creates `useForm` with empty `defaultValues` on first render. When async load data arrives, `defaultValues` update via `useMemo` but `useForm` ignores post-init changes. Fields show empty/zero.
2. **Carrier, Driver, Rate sections invisible** — `LoadFormSections` tracks carrier via `selectedCarrier` React state (set only by the picker). In edit mode, existing carrier data is never injected. The Rate & Margin card is gated on `selectedCarrier` being truthy.
3. **No order link display** — `orderId` is in the schema but never rendered. Users can't see which order this load belongs to.
4. **No status badge** — Users can't see current load status.
5. **Missing stop fields** — Appointment date/time, special instructions, address line 2 are in the schema but not rendered in `StopsBuilder`.

## Solution

### 1. FormPage — reset on defaultValues change

Add a `useEffect` that calls `form.reset(defaultValues)` when `defaultValues` changes. Use `JSON.stringify` for deep comparison. This is the standard React Hook Form pattern for async default values.

### 2. LoadFormSections — initialCarrier prop

Add `initialCarrier?: { id: string; companyName: string; mcNumber: string }` and `initialCustomerRate?: number` props. On mount in edit mode, initialize `selectedCarrier` state from `initialCarrier`. This makes the carrier display, driver fields, and Rate & Margin section visible.

For post-pickup loads where carrier is read-only: show carrier info as a read-only display card (name, MC#) instead of just the lock warning.

### 3. Edit page — pass carrier + customer rate + status

Extract `loadData.carrier` and pass as `initialCarrier`. Extract customer rate from order. Pass `loadStatus` for the status badge display.

### 4. Order Link section (edit mode only)

At the top of `LoadFormSections`, show a read-only info bar with:
- Order number (as a link to `/operations/orders/:id`)
- Customer name
- Load status badge

### 5. StopsBuilder — add missing fields

Per stop card, add:
- Appointment Required toggle (already in schema)
- Appointment Date input (conditional on toggle)
- Appointment Time Start / End inputs (conditional)
- Special Instructions textarea
- Address Line 2 input

## Files Changed

| File | Action |
|------|--------|
| `apps/web/components/patterns/form-page.tsx` | Add useEffect for form.reset |
| `apps/web/components/tms/loads/load-form.tsx` | Add initialCarrier/initialCustomerRate props, order link section, fix carrier edit display, add stop fields |
| `apps/web/app/(dashboard)/operations/loads/[id]/edit/page.tsx` | Pass initialCarrier, customerRate, status badge in header |
