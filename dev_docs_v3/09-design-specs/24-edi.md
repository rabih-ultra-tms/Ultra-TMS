# EDI Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/24-edi/` (9 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/edi/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-edi-dashboard.md` | — | Not built | P2 |
| 02 | `02-trading-partners.md` | — | Not built | P2 |
| 03 | `03-partner-setup.md` | — | Not built | P2 |
| 04 | `04-transaction-sets.md` | — | Not built | P2 |
| 05 | `05-transaction-viewer.md` | — | Not built | P2 |
| 06 | `06-map-editor.md` | — | Not built | P2 |
| 07 | `07-edi-errors.md` | — | Not built | P2 |
| 08 | `08-edi-reports.md` | — | Not built | P2 |

---

## Implementation Notes

- Electronic Data Interchange for automated load/invoice exchange with customers
- Key transaction sets: 204 (load tender), 210 (freight details), 214 (status), 990 (response)
- Map editor (06) is a visual field mapping tool — complex frontend
- Overlaps with integration-hub EDI setup (20-integration-hub/09)
- All screens P2 — industry requirement but not MVP
