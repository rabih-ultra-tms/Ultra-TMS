# Super Admin Tools Design Spec Integration

**Source:** `dev_docs/12-Rabih-design-Process/38-super-admin/` (files 21-28)
**MVP Tier:** P2-P3
**Frontend routes:** None — not built yet

---

## Screen-to-Route Mapping

| # | Design Spec | Frontend Route | Status |
|---|------------|----------------|--------|
| 21 | `21-maintenance-mode.md` | — | Not built — P2 |
| 22 | `22-backup-management.md` | — | Not built — P2 |
| 23 | `23-email-management.md` | — | Not built — P2 |
| 24 | `24-sms-management.md` | — | Not built — P3 |
| 25 | `25-storage-management.md` | — | Not built — P2 |
| 26 | `26-performance-monitor.md` | — | Not built — P2 |
| 27 | `27-release-manager.md` | — | Not built — P3 |
| 28 | `28-platform-reports.md` | — | Not built — P2 |

---

## Implementation Notes

- Maintenance mode (21) — toggle site-wide maintenance with custom message
- Backup management (22) — database backup schedule, restore from backup
- Email/SMS management (23-24) — SendGrid/Twilio admin: templates, quotas, logs
- Storage management (25) — S3 bucket usage, cleanup orphaned files
- Performance monitor (26) — server metrics, DB query performance, API latency
- Release manager (27) — version tracking, changelog, rollback capability
- Platform reports (28) — cross-tenant analytics for platform owner
- All tools are P2-P3 — operational infrastructure, not user-facing
