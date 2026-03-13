# MP-07: Documents + Communication — UI-First Design

**Date:** 2026-03-13
**Sprint:** MP-07 (Weeks 13-14, Phase 2: Core Expansion)
**Services:** Documents (#11), Communication (#12)
**Approach:** UI-First + Backend Verification
**Execution:** 2 weeks, full focus
**Exit Criteria:** All 18 tasks complete (pages, security, wiring, tests)

---

## Executive Summary

MP-07 builds the document management and communication center for the TMS platform. Using a **UI-first approach**, we'll deliver fully-designed pages in Week 1 with mocked APIs, then integrate real backends, verify security, and add tests in Week 2. This maximizes visible progress early while ensuring backend readiness.

**Deliverables:**

- 6 production-ready pages (Document Dashboard, Upload, Viewer, Communication Center, Templates, Preferences)
- 20 Document endpoints verified + 30 Communication endpoints verified
- 100% guard coverage (DocumentAccessGuard, Communication guards)
- Backend wiring: Folder CRUD, POD-to-invoice triggers, auto-email triggers, SendGrid webhooks, cron cleanup
- Unit tests for Documents + Communication services (20% coverage target)

---

## Week 1: UI Pages with Mocked APIs (29 hours)

### Scope

| Page                     | Task      | Hours   | Source  | Notes                                                          |
| ------------------------ | --------- | ------- | ------- | -------------------------------------------------------------- |
| Document Dashboard       | MP-07-003 | 4h      | P1S-004 | List, search, filter by type/folder, soft-delete aware         |
| Document Upload Flow     | MP-07-004 | 4h      | P1S-005 | Drag-drop zone, multi-file, progress tracking, file validation |
| Document Viewer          | MP-07-005 | 4h      | P1S-006 | PDF/image preview, metadata display, version history           |
| Communication Center     | MP-07-012 | 6h      | P1S-007 | Unified inbox (email, SMS, in-app), message threads, search    |
| Email Template Manager   | MP-07-013 | 4h      | P1S-008 | CRUD templates, live preview with variable substitution        |
| Notification Preferences | MP-07-014 | 3h      | P1S-009 | Per-event toggles, quiet hours, save/load prefs                |
| **Total Week 1**         | —         | **29h** | —       | —                                                              |

### Component Architecture

**Page-level components:**

- `/app/(dashboard)/documents/page.tsx` — Document Dashboard
- `/app/(dashboard)/documents/upload/page.tsx` — Upload flow
- `/app/(dashboard)/documents/[id]/page.tsx` — Document Viewer
- `/app/(dashboard)/communications/page.tsx` — Communication Center
- `/app/(dashboard)/communications/templates/page.tsx` — Template Manager
- `/app/(dashboard)/settings/notifications/page.tsx` — Notification Preferences

**Reusable components in `components/`:**

- `<DocumentCard>` — Thumbnail, name, type, date, actions (view, download, delete)
- `<UploadZone>` — Drag-drop area, file list, progress bars, error feedback
- `<DocumentPreview>` — PDF/image viewer, metadata panel, version selector
- `<MessageThread>` — Conversation view, message list, reply input
- `<MessageCard>` — Single message (sender, timestamp, content, attachments)
- `<TemplateForm>` — CRUD form with live preview, variable picker
- `<PreferenceToggle>` — Toggle switch + description, quiet hours time picker

**Custom hooks (in `lib/hooks/`):**

- `useDocuments()` — Fetch documents, search, filter (mocked initially)
- `useCommunications()` — Fetch messages, threads (mocked initially)
- `useNotificationPrefs()` — Load/save notification preferences (mocked initially)
- `useUploadDocument()` — File upload handler with progress (mocked initially)
- `useEmailTemplates()` — CRUD for templates (mocked initially)

### Data Flow: Week 1 (Mocked)

```
User Action (e.g., upload file)
  ↓
React Component State (Zustand or useState)
  ↓
Mock API Hook (useDocuments) returns fake data
  ↓
UI renders with mock responses + loading/error/empty states
```

**Mock data sources:**

- `lib/mocks/documents.ts` — Fake documents, folders, versions
- `lib/mocks/communications.ts` — Fake messages, threads, templates
- `lib/mocks/notifications.ts` — Fake preference state

**Key UI interactions:**

- Search/filter documents by name, type, folder
- Drag-drop upload + real-time progress display
- Preview document (PDF, image, metadata)
- Switch message threads
- Edit + preview email template with variable insertion
- Toggle notification preferences + save state

### Design Specs Reference

All pages follow specs from `dev_docs/12-Rabih-design-Process/`:

- Documents service folder
- Communication service folder
- Design system (colors, spacing, icons, status badges)

---

## Week 2: Backend Verification + Wiring + Tests + Security (24.5 hours)

### Verification (MP-07-001, MP-07-010) — 4 hours

**Documents Endpoints (MP-07-001, 2h):**

- Runtime verification that all 20 endpoints respond correctly
- Check request/response shape matches API contracts
- Verify soft-delete filtering applied automatically
- Record findings in test results file

**Communication Endpoints (MP-07-010, 2h):**

- Runtime verification that all 30 endpoints respond correctly
- Test message creation, retrieval, filtering
- Verify template rendering endpoints work
- Verify notification preference save/load endpoints

**Tool:** Postman collection or Jest E2E tests hitting real backend.

### Security Verification (MP-07-002, MP-07-011) — 1.5 hours

**DocumentAccessGuard (MP-07-002, 1h):**

- Verify 100% guard coverage per PST-11
- Test cross-tenant isolation: User A cannot access Tenant B's documents
- Verify soft-delete filtering applies (deleted docs not returned)
- Guard must check tenantId on all document operations

**Communication Guards (MP-07-011, 30min):**

- Verify 100% guard coverage per PST-12
- Test that users cannot read other tenants' messages/templates
- Verify guard on all 30 endpoints

**Tool:** Jest unit tests with mocked Prisma + real guard logic.

### Backend Wiring (MP-07-007, 008, 015, 016, 017) — 9.5 hours

**MP-07-007: Wire DocumentShare + GeneratedDocument Models (2h)**

- Add missing Prisma models to schema
- Run migration
- Wire to Documents service CRUD
- Update API responses to include these entities

**MP-07-008: POD-to-Invoice Trigger (3h)**

- Listen for delivery event (POD created)
- Auto-create draft invoice with line items from load details
- Link invoice to POD
- Trigger sends notification to accounting

**MP-07-015: Wire Auto-Email Triggers (2h)**

- 5 triggers from existing useAutoEmail code (258 LOC)
- Examples: document approved, POD received, invoice created, payment processed, delivery delayed
- Each trigger fires email to configured recipients
- Verify SendGrid integration

**MP-07-016: SendGrid Webhook (2h)**

- Register webhook endpoint: POST `/api/v1/communications/webhooks/sendgrid`
- Parse bounce/delivery/open events from SendGrid
- Update notification status in database
- Log for analytics

**MP-07-017: Cron Job for Cleanup (30min)**

- Wire deleteExpired() to cron job (runs daily)
- Removes old notifications past retention period
- Verify Redis job queue integration

### Testing (MP-07-009, MP-07-018) — 8 hours

**DocumentsService Unit Tests (MP-07-009, 4h, target: 20%)**

- CRUD operations (create, read, update, delete)
- Soft-delete filtering (deletedAt field)
- Folder operations (create, move, rename)
- File versioning logic
- DocumentAccessGuard integration (deny cross-tenant)
- Coverage target: 20% of service logic

**CommunicationService Unit Tests (MP-07-018, 4h, target: 20%)**

- Message creation + retrieval
- Template rendering with variable substitution
- Notification preference save/load
- Auto-email trigger execution
- Guard verification (deny cross-tenant)
- Coverage target: 20% of service logic

**Tool:** Jest + Supertest for API tests, MSW for mocked HTTP in component tests.

### Additional Tasks (MP-07-006) — 3 hours

**Folder Management CRUD (MP-07-006, 3h, P1):**

- UI: Folder list in sidebar, create/rename/move dialogs
- API: Folder create, rename, move endpoints (wired + tested)
- Constraint: Cannot move folder into itself or its children

---

## Data Flow: Week 2 (Real API Integration)

```
User Action (upload file)
  ↓
React Component (useDocuments hook)
  ↓
Real API Call: POST /api/v1/documents/upload
  ↓
Backend DocumentsService processes request
  ↓
DocumentAccessGuard checks tenantId (security gate)
  ↓
Prisma writes to database (with soft-delete metadata)
  ↓
Response with real document data flows back to UI
  ↓
Component re-renders with actual data
```

**Same pattern for all 6 pages.**

---

## Error Handling & Loading States

### Week 1 (Mocked)

- Mock hooks return `{ data, loading, error }` states
- UI shows skeleton loaders during mock fetch (simulated 300ms delay)
- Error boundary catches exceptions
- Placeholder error messages + empty states

### Week 2 (Real API)

- Actual network errors caught + displayed (e.g., "Upload failed: 413 Payload Too Large")
- Guard rejections show permission error (e.g., "You don't have access to this document")
- Soft-delete filtering: Silently exclude deleted docs (no UI notification needed)
- Retry logic: Upload, email send operations support manual retry
- Input validation: File types, template syntax, preferences constraints

**Error display:**

- Toasts for transient errors (file upload, email send)
- Error boundaries for component crashes
- Inline validation errors on forms
- 404 pages for missing documents

---

## Security Model

### Multi-Tenant Isolation

**Documents:**

- Every document query: `WHERE tenantId = currentTenant.id AND deletedAt IS NULL`
- DocumentAccessGuard enforces on every endpoint
- No user can read/write another tenant's documents

**Communications:**

- Every message query: `WHERE tenantId = currentTenant.id AND deletedAt IS NULL`
- Communication guard enforces on every endpoint
- No user can access another tenant's messages, templates, or preferences

### Guard Coverage

- **Documents:** 100% (all 20 endpoints protected per PST-11)
- **Communication:** 100% (all 30 endpoints protected per PST-12)

### Sensitive Data

- API keys (SendGrid) stored in environment variables, never logged
- Email content may contain PII (handled per GDPR, not in scope for this sprint)
- Notification preferences are user-level (not tenant-level)

---

## Testing Strategy

### Unit Tests (20% coverage target)

- DocumentsService methods: CRUD, filtering, versioning, folder operations
- CommunicationService methods: Message CRUD, template rendering, preference logic
- Guard logic: Cross-tenant rejection tests

### Integration Tests (component level)

- Document upload flow (component + mocked API)
- Communication center (load messages, reply, search)
- Template manager (CRUD + preview)

### Security Tests

- DocumentAccessGuard rejects cross-tenant requests
- Communication guards rejects cross-tenant requests
- Soft-delete filtering verified

### E2E Tests (via Playwright, optional, post-sprint)

- Full document upload → download → delete flow
- Full message send → receive → reply → archive flow

**Tool:** Jest for unit, Supertest for API integration, MSW for component isolation.

---

## Dependencies & Blockers

### Must Exist Before Week 2

1. **Prisma Models:** DocumentShare, GeneratedDocument (added in MP-07-007)
2. **Backend Endpoints:** All 20 Documents + 30 Communication endpoints exist and respond
3. **SendGrid Config:** API key in `.env`, webhook registered
4. **Design Specs:** Final versions in `dev_docs/12-Rabih-design-Process/`

### Assumptions

1. Backend is running (`pnpm dev` starts API on port 3001)
2. Database is seeded with test data
3. Current user is authenticated + has tenantId set
4. Design specs are final (no mid-sprint changes)

### Risks

- **Design spec changes mid-sprint** → Delays Week 1 UI
- **Backend endpoint missing** → Delays Week 2 wiring
- **SendGrid webhook config issues** → Delays MP-07-016
- **Cron job infrastructure** → Delays MP-07-017 (mitigation: use Redis job queue)

---

## Success Criteria

- [ ] Document Dashboard page loads list, search, filter work (Week 1)
- [ ] Document Upload works end-to-end with progress tracking (Week 1)
- [ ] Document Viewer displays PDF/image + metadata (Week 1)
- [ ] Communication Center loads messages, displays threads (Week 1)
- [ ] Email Template Manager CRUD works (Week 1)
- [ ] Notification Preferences save/load works (Week 1)
- [ ] All 20 Documents endpoints verified responding (Week 2)
- [ ] All 30 Communication endpoints verified responding (Week 2)
- [ ] DocumentAccessGuard 100% coverage confirmed (Week 2)
- [ ] Communication guards 100% coverage confirmed (Week 2)
- [ ] POD-to-invoice trigger fires on delivery (Week 2)
- [ ] 5 auto-email triggers fire on events (Week 2)
- [ ] SendGrid webhook receives + processes bounce/delivery events (Week 2)
- [ ] Cron job cleanup runs daily (Week 2)
- [ ] DocumentsService tests written + passing (4h, Week 2)
- [ ] CommunicationService tests written + passing (4h, Week 2)
- [ ] Folder CRUD works (create, rename, move) (Week 2)

---

## Deliverables

**Week 1:**

- 6 production pages (dashboard, upload, viewer, center, templates, preferences)
- Mock data + hooks
- Component library (8 reusable components)
- Mocked API client

**Week 2:**

- Real API client (replace mocks)
- Backend wiring (triggers, webhooks, cron)
- 8 hours of unit tests
- 4 hours of integration tests
- Security verification report
- Endpoint verification report

---

## Timeline

| Week      | Task                                                          | Hours     | Owner |
| --------- | ------------------------------------------------------------- | --------- | ----- |
| Week 1    | Build 6 pages with mocked APIs                                | 29h       | You   |
| Week 2    | Verify backends, wire integration, add tests, security checks | 24.5h     | You   |
| **Total** | —                                                             | **53.5h** | —     |

Estimated completion: 2 weeks at 20-27 hours/week.

---

## Success Metrics

- All 18 MP-07 tasks marked complete
- No red X's in exit criteria checklist
- Frontend pages pass visual QA (against design specs)
- API verification report shows 20/20 Documents + 30/30 Communication endpoints working
- Security report shows 100% guard coverage
- Test coverage report shows DocumentsService + CommunicationService at target 20%
