# Super Admin Services Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/38-super-admin/` (files 11-20)
**MVP Tier:** P1-P2
**Frontend routes:** None — not built yet

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Status |
|---|------------|----------------|--------|
| 11 | `11-billing-management.md` | — | Not built — P2 |
| 12 | `12-billing-detail.md` | — | Not built — P2 |
| 13 | `13-usage-metrics.md` | — | Not built — P2 |
| 14 | `14-system-logs.md` | — | Not built — P1 |
| 15 | `15-error-dashboard.md` | — | Not built — P1 |
| 16 | `16-job-queue.md` | — | Not built — P2 |
| 17 | `17-database-admin.md` | — | Not built — P2 |
| 18 | `18-migration-tool.md` | — | Not built — P2 |
| 19 | `19-api-analytics.md` | — | Not built — P2 |
| 20 | `20-security-center.md` | — | Not built — P1 |

---

## Implementation Notes

- Billing management (11-13) — SaaS billing per tenant, usage tracking
- System logs (14) and error dashboard (15) — operational monitoring, P1
- Job queue (16) — Bull/scheduler job monitoring
- Database admin (17) and migration tool (18) — dangerous in production, needs heavy guardrails
- API analytics (19) — request volume, latency, error rates per tenant
- Security center (20) — audit trail, threat detection, IP blocking, P1
