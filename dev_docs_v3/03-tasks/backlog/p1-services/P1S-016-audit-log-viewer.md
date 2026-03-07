# P1S-016: Audit Log Viewer

**Priority:** P1
**Service:** Audit
**Scope:** UI for viewing system audit logs

## Current State
Backend may log audit events but no UI exists to view them.

## Requirements
- Paginated list of audit events
- Filter by action (create, update, delete), entity type, user, date range
- Event detail view showing before/after values
- Search by entity ID or user
- Export audit log

## Acceptance Criteria
- [ ] Audit log list with pagination
- [ ] Filters for action, entity, user, date
- [ ] Event detail shows what changed
- [ ] Search functional
- [ ] Export to CSV
- [ ] Performance with large datasets (100k+ events)

## Dependencies
- Audit logging backend module

## Estimated Effort
M
