# Carrier Management Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/05-carrier/` (13 files)
**MVP Tier:** P0
**Frontend routes:** `(dashboard)/carriers/*`
**Backend module:** `apps/api/src/modules/carrier/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-carrier-dashboard.md` | — | Not built | No dedicated carrier dashboard route |
| 02 | `02-carriers-list.md` | `/carriers` | `(dashboard)/carriers/page.tsx` | Exists |
| 03 | `03-carrier-detail.md` | `/carriers/[id]` | `(dashboard)/carriers/[id]/page.tsx` | Exists (tabs: overview, insurance, docs, trucks, drivers, contacts) |
| 04 | `04-carrier-onboarding.md` | — | Not built | P1 — wizard flow |
| 05 | `05-compliance-center.md` | — | Not built | P1 — safety module integration |
| 06 | `06-insurance-tracking.md` | Part of carrier detail | Insurance tab in carrier detail | Partial |
| 07 | `07-equipment-list.md` | Part of carrier detail | Trucks tab in carrier detail | Partial |
| 08 | `08-carrier-scorecard.md` | `/carriers/[id]/scorecard` | `(dashboard)/carriers/[id]/scorecard/page.tsx` | Exists |
| 09 | `09-lane-preferences.md` | — | Not built | P2 |
| 10 | `10-carrier-contacts.md` | Part of carrier detail | Contacts tab in carrier detail | Partial |
| 11 | `11-fmcsa-lookup.md` | Part of carrier create | FMCSA lookup in carrier form | Exists |
| 12 | `12-preferred-carriers.md` | — | Not built | P2 |

---

## Backend Endpoints

| Screen | Endpoint(s) | Hook |
|--------|-------------|------|
| Carriers List | `GET /carriers` | `use-carriers.ts` |
| Carrier Detail | `GET /carriers/:id` | `use-carriers.ts` |
| Carrier Create | `POST /carriers` | `use-carriers.ts` |
| Carrier Edit | `PATCH /carriers/:id` | `use-carriers.ts` |
| Carrier Scorecard | `GET /carriers/:id/scorecard` | `use-carrier-scorecard.ts` |
| FMCSA Lookup | `GET /carriers/fmcsa/:mc` | `use-fmcsa.ts` |

---

## Implementation Notes

- Carrier detail page has tabbed layout: overview, insurance, docs, trucks, drivers, contacts
- Carrier list uses `skip/take` pagination (divergent from standard `page/limit`)
- FMCSA lookup exists in carrier module (`/carriers/fmcsa/:mc`) — separate from safety module batch lookup
- Carrier scorecard calls safety module endpoints for CSA scores
- Truck Types page at `/truck-types` is PROTECTED (8/10, gold standard CRUD)
- Carrier onboarding wizard and compliance center are P1 features
- 45 carrier tests exist (largest test coverage in the project)
