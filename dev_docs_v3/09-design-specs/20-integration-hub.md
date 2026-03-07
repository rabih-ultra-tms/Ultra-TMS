# Integration Hub Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/20-integration-hub/` (11 files)
**MVP Tier:** P2
**Frontend routes:** None — not built yet
**Backend module:** `apps/api/src/modules/integration-hub/`

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Page File | Status |
|---|------------|----------------|-----------|--------|
| 00 | `00-service-overview.md` | — | — | Reference only |
| 01 | `01-integration-dashboard.md` | — | Not built | P2 |
| 02 | `02-available-integrations.md` | — | Not built | P2 |
| 03 | `03-integration-setup.md` | — | Not built | P2 |
| 04 | `04-api-key-management.md` | — | Not built | P2 |
| 05 | `05-webhook-manager.md` | — | Not built | P2 |
| 06 | `06-data-mapping.md` | — | Not built | P2 |
| 07 | `07-sync-status.md` | — | Not built | P2 |
| 08 | `08-integration-logs.md` | — | Not built | P2 |
| 09 | `09-edi-setup.md` | — | Not built | P2 (overlaps with 24-edi) |
| 10 | `10-integration-reports.md` | — | Not built | P2 |

---

## Implementation Notes

- Central hub for managing all third-party integrations
- API key management and webhook configuration
- Data mapping tool for field-level mapping between systems
- EDI setup (09) overlaps with dedicated EDI module (24-edi)
- All screens P2 — not in MVP scope
