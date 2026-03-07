# Sales Domain Rules

> AI Dev Guide | Source: `dev_docs_v3/01-services/p0-mvp/04-sales-quotes.md`

---

## Quote Lifecycle

### Status Machine

```
DRAFT -> SENT (via send action)
DRAFT -> DELETED (soft delete)
SENT -> ACCEPTED (customer accepts, creates Order)
SENT -> REJECTED (customer declines)
SENT -> EXPIRED (system job at expiry date)
REJECTED/EXPIRED -> DRAFT (clone and edit)
```

- Only DRAFT quotes can be edited.
- ACCEPTED quotes create orders immediately.
- REJECTED quotes can be revised and re-sent.

## Minimum Margin Enforcement

- Every quote MUST have a minimum gross margin of 15%.
- Formula: `margin% = (totalRevenue - totalCost) / totalRevenue * 100`
- If below 15%: system shows warning, requires dispatcher/manager override with written justification.
- Override is logged to AuditLog.

## Quote Expiry

- Default: 7 days from send date (configurable per tenant in settings).
- Expired quotes cannot be accepted.
- Can be cloned with new dates.
- System auto-expires via scheduled job at midnight.

## Quote-to-Order Conversion

- Accepting a quote (`POST /quotes/:id/accept`) creates a new Order in TMS Core.
- Quote data pre-fills: customer, commodity, stops, rate.
- Cannot accept if customer has credit HOLD status.

## Rate Table Priority

1. Customer-specific rate table
2. Lane-specific rate table
3. Default rate table

Load Planner UI shows which table is active and allows override.

## AI Cargo Extraction

- Load Planner accepts pasted text (emails, BOLs, PDFs).
- AI endpoint extracts: commodity, weight, dimensions, pickup/delivery locations, special requirements.
- User must confirm before applying. AI suggestions are non-binding.

## Accessorial Charges

Standard accessorials must be itemized, not bundled:
- Fuel surcharge (% of line haul)
- Detention ($75/hr)
- Liftgate
- Inside delivery
- Residential delivery

## Currency

- All amounts in USD. Multi-currency deferred to P3.
- `Decimal` type in Prisma (not Float) -- rounding to 2 decimal places.

## Quote Number Format

`Q-{YYYYMM}-{NNN}` -- auto-generated, unique per tenant.

## PROTECTED: Load Planner

**DO NOT MODIFY** `apps/web/app/(dashboard)/load-planner/[id]/edit/page.tsx`
- 1,825 LOC, 9/10 quality
- AI cargo extraction + Google Maps + full quote lifecycle
- Any changes risk breaking production-ready feature

## Key API Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET/POST | `/api/v1/sales/quotes` | List + Create |
| GET/PUT/PATCH/DELETE | `/api/v1/sales/quotes/:id` | Detail + Update + Soft delete |
| POST | `/api/v1/sales/quotes/:id/send` | Send to customer (email) |
| POST | `/api/v1/sales/quotes/:id/accept` | Customer acceptance -> create order |
| POST | `/api/v1/sales/quotes/:id/reject` | Mark rejected |
| POST | `/api/v1/sales/quotes/:id/clone` | Duplicate with new dates |
| GET | `/api/v1/sales/quotes/:id/pdf` | Generate PDF |
| POST | `/api/v1/sales/ai/extract-cargo` | AI cargo extraction |
| GET | `/api/v1/sales/ai/suggest-rate` | AI rate suggestion |
| GET/PUT | `/api/v1/sales/load-planner/:id` | Load Planner session |
