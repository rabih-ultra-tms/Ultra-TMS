# Sprint 2 Service Audit — Pre-Build Assessment
> Audited: 2026-02-23 | 4 services: Documents, Communication, Credit, Analytics

---

## Summary

| Service | Backend % | Frontend % | Controllers | Prisma Models | Hooks | Pages | Effort Focus |
|---------|-----------|-----------|-------------|---------------|-------|-------|-------------|
| Documents | 75% | 30% | 3 active + 2 in .bak | 6 complete | 4 basic | 0 | Wire .bak + frontend |
| Communication | 85% | 40% | 5 complete | 8 complete | 3 partial | 0 | WebSocket + frontend |
| Credit | 80% | 0% | 5 complete | 5 complete | 0 | 0 | Auto-holds + frontend |
| Analytics | 75% | 0% | 6 complete | 9 complete | 0 | 0 | KPI engine + frontend |

**Key Insight:** Sprint 2 is **80% frontend work**. All 4 services have substantial backend implementations already.

---

## Service 10: Documents

### Backend Assessment (75% complete)

#### Active Controllers
| Controller | File | Endpoints | LOC |
|-----------|------|-----------|-----|
| DocumentsController | `apps/api/src/modules/documents/controllers/documents.controller.ts` | CRUD, upload, download | ~200 |
| FoldersController | `apps/api/src/modules/documents/controllers/folders.controller.ts` | CRUD, tree | ~150 |
| TemplatesController | `apps/api/src/modules/documents/controllers/templates.controller.ts` | CRUD, render | ~150 |

#### .bak Controllers (READY TO WIRE)
| Controller | File | LOC | What It Does |
|-----------|------|-----|-------------|
| GenerationController | `apps/api/src/modules/documents.bak/generation.controller.ts` | 2,100 | PDF generation from templates |
| GenerationService | `apps/api/src/modules/documents.bak/generation.service.ts` | 11,000 | Handlebars template engine, batch generation, status tracking |
| SharesController | `apps/api/src/modules/documents.bak/shares.controller.ts` | 1,900 | Share link creation, token-based access |
| SharesService | `apps/api/src/modules/documents.bak/shares.service.ts` | 7,500 | Token generation, expiry, access control, revocation |

**Total .bak code: 22,500 LOC — production-quality, just needs module registration**

#### Prisma Models (6 complete)
- `Document` — core document record
- `DocumentVersion` — version tracking
- `DocumentFolder` — folder hierarchy
- `DocumentTemplate` — template definitions
- `DocumentShare` — share link tokens
- `DocumentTag` — tagging system

#### Storage Abstraction
- Local filesystem adapter exists
- S3 adapter pattern ready but needs AWS SDK wiring
- Upload middleware handles multipart

#### What's Missing
- Bulk upload endpoint
- OCR search integration
- Version management API
- Virus scanning (can defer)
- Event emission (document.uploaded, document.generated, etc.)

### Frontend Assessment (30% complete)

#### Existing Hooks (4)
| Hook | File | Status |
|------|------|--------|
| useDocuments | `lib/hooks/documents/use-documents.ts` | Basic CRUD |
| useUploadDocument | `lib/hooks/documents/use-documents.ts` | Upload mutation |
| useDeleteDocument | `lib/hooks/documents/use-documents.ts` | Delete mutation |
| useDocumentDownloadUrl | `lib/hooks/documents/use-documents.ts` | URL generation |

#### Existing Components (5)
| Component | File | Quality |
|-----------|------|---------|
| DocumentList | `components/documents/document-list.tsx` | Basic table |
| DocumentActions | `components/documents/document-actions.tsx` | Dropdown menu |
| UploadZone | `components/documents/upload-zone.tsx` | Drag-and-drop |
| PermitList | `components/documents/permit-list.tsx` | Carrier permits |
| RateConPreview | `components/documents/rate-con-preview.tsx` | PDF preview |

#### What's Missing
- All 8 dedicated pages (document library, detail, upload modal, folder browser, shared docs, templates, viewer, search)
- Folder management hooks and UI
- Template management hooks and UI
- Share management hooks and UI
- Document search hooks and UI
- loading.tsx and error.tsx for route group

---

## Service 11: Communication

### Backend Assessment (85% complete)

#### Controllers (5 complete)
| Controller | Endpoints | LOC |
|-----------|-----------|-----|
| EmailController | send, bulk, track, webhooks, templates | ~250 |
| SmsController | send, receive, conversations, webhooks | ~200 |
| NotificationsController | CRUD, bulk, read/unread | ~200 |
| TemplatesController | CRUD, render, preview, i18n | ~180 |
| PreferencesController | get/set preferences, opt-out | ~150 |

#### Services
| Service | LOC | What It Does |
|---------|-----|-------------|
| EmailService | 387 | Full send via SendGrid, bulk, tracking, template rendering |
| SmsService | 418 | Full 2-way via Twilio, conversations, webhooks |
| NotificationsService | 255 | CRUD, bulk create, read/unread toggling |
| TemplatesService | ~200 | Template CRUD, Handlebars rendering, EN/ES |
| PreferencesService | ~150 | User notification preferences |

#### Providers
| Provider | File | Status |
|---------|------|--------|
| SendGrid | `providers/sendgrid.provider.ts` | WORKING — API key configured |
| Twilio | `providers/twilio.provider.ts` | WORKING — SID + auth token configured |
| Firebase | N/A | NOT BUILT — push notifications |

#### Prisma Models (8 complete)
- `EmailLog` — sent email tracking
- `SmsConversation` — SMS thread grouping
- `SmsMessage` — individual SMS messages
- `Notification` — in-app notifications
- `NotificationPreference` — per-user channel preferences
- `CommunicationTemplate` — email/SMS templates with i18n
- `EmailOptOut` — email unsubscribe list
- `SmsOptOut` — SMS unsubscribe list

#### What's Missing
- WebSocket real-time notification delivery
- Firebase push notification integration (stub for now)
- Opt-out enforcement before sending (check opt-out tables)
- Quiet hours enforcement
- Event emission (email.sent, sms.received, etc.)
- Communication gateway (WebSocket namespace)

### Frontend Assessment (40% complete)

#### Existing Hooks (3)
| Hook | File | LOC | Status |
|------|------|-----|--------|
| useSendEmail | `lib/hooks/communication/use-email.ts` | ~120 | Send mutation |
| useEmailLogs | `lib/hooks/communication/use-email.ts` | ~80 | Log query |
| useAutoEmail | `lib/hooks/communication/use-email.ts` | ~170 | Auto-trigger |

#### What's Missing
- All 7 dedicated pages (notification center, SMS inbox, email log, templates, preferences, history, compose)
- Notification hooks (list, unread count, mark read, WebSocket subscription)
- SMS hooks (conversations, messages, send)
- Template hooks (CRUD, preview)
- Preference hooks (get/set)
- Notification bell component for header
- loading.tsx and error.tsx for route group
- Sidebar navigation entry

---

## Service 16: Credit

### Backend Assessment (80% complete)

#### Controllers (5 complete, 30 endpoints)
| Controller | Endpoints | Key Operations |
|-----------|-----------|---------------|
| ApplicationsController | submit, review, approve, reject, list | Full application workflow |
| LimitsController | CRUD, temp increase, utilization | Limit management |
| HoldsController | create, release, list, history | Manual hold management |
| CollectionsController | queue, log activity, aging, follow-ups | Collections workflow |
| PaymentPlansController | create, record payment, cancel, list | Payment plan management |

#### Services (5 complete)
| Service | Key Methods |
|---------|------------|
| ApplicationsService | submit, approve, reject, scoring |
| LimitsService | set, adjust, check utilization |
| HoldsService | create, release (MANUAL ONLY) |
| CollectionsService | queue, log, aging buckets |
| PaymentPlansService | create, record payment, cancel |

#### DTOs (23 complete)
Full validation on all inputs — CreateApplicationDto, UpdateLimitDto, etc.

#### Prisma Models (5 complete)
- `CreditApplication` — application with scoring
- `CreditLimit` — per-company credit limit with utilization
- `CreditHold` — hold records (manual + auto)
- `CollectionItem` — collections queue entries
- `PaymentPlan` — installment plans

#### What's Missing
- **Auto-hold triggers** (event-driven: invoice.past_due → auto-hold, payment.received → auto-release)
- **Credit enforcement on orders** (check credit before order creation)
- **Dashboard aggregation endpoint** (total exposure, utilization %, at-risk accounts)
- **Write-off functionality** (mark as uncollectable)
- **Credit score calculation** (internal scoring from payment history, utilization, etc.)
- **Events integration** (publish credit.hold.placed, subscribe to invoice.past_due)

### Frontend Assessment (0% complete)
- Zero hooks
- Zero components
- Zero pages
- Everything needs to be built from scratch

---

## Service 19: Analytics

### Backend Assessment (75% complete)

#### Controllers (6 complete, 43 endpoints)
| Controller | Endpoints | Key Operations |
|-----------|-----------|---------------|
| DashboardsController | CRUD, widgets, layout | Dashboard management |
| KpisController | CRUD, definitions, snapshots, calculate | KPI management |
| ReportsController | CRUD, schedule, execute, download | Report management |
| AlertsController | list, acknowledge, resolve, configure | Alert management |
| DataController | query, export, trends, compare | Data access |
| WidgetsController | CRUD, configure, data source | Widget management |

#### Services
| Service | Key Methods |
|---------|------------|
| DashboardsService | CRUD, widget placement, layout management |
| KpisService | CRUD, snapshot, **calculateKPI (STUB)** |
| ReportsService | CRUD, schedule, **executeReport (STUB)** |
| AlertsService | list, acknowledge, resolve |
| DataService | query, export, trends, compare |

#### Prisma Models (9 complete)
- `Dashboard` — dashboard definitions
- `DashboardWidget` — widget placement and config
- `KpiDefinition` — KPI metadata (code, name, category, unit)
- `KpiSnapshot` — historical KPI values
- `Report` — report definitions with query
- `ReportExecution` — execution history with output URLs
- `ReportSchedule` — cron schedules for reports
- `Alert` — threshold-based alerts
- `AlertRule` — alert configuration rules

#### What's Missing
- **KPI calculation engine** — actual SQL queries for TOTAL_REVENUE, GROSS_MARGIN, ON_TIME_DELIVERY, etc. (currently stubs)
- **Report execution engine** — run SQL, format as CSV/Excel/PDF, upload to storage (currently stubs)
- **ETL/aggregation layer** — periodic rollup of operational data
- **Seed data** — 20+ system KPI definitions, 3 default dashboards (Executive, Operations, Sales)
- **Event subscriptions** — recalculate KPIs when orders, invoices, payments change
- **Export libraries** — xlsx, pdfkit, csv-writer not installed

### Frontend Assessment (0% complete)
- Zero hooks
- Zero components
- Zero pages
- Everything needs to be built from scratch
- Will need chart library (Recharts) and drag-and-drop grid (react-grid-layout)

---

## Cross-Service Dependencies

```
Documents ← Auth, TMS Core
Communication ← Auth, TMS Core
Credit ← Auth, CRM, Accounting
Analytics ← Auth, CRM, TMS Core, Carrier, Accounting
```

All 4 depend on Sprint 1 fixes (FIX-002 envelope unwrapping, service quality passes).

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| .bak code doesn't integrate cleanly | Medium | High | Test generation + sharing early in Phase 3 |
| WebSocket notification delivery flaky | Medium | Medium | Fallback to polling with short interval |
| KPI SQL queries slow on large datasets | Medium | Medium | Add materialized views / caching |
| Credit auto-holds fire incorrectly | Low | High | Extensive testing, manual override always available |
| Chart library bundle size too large | Low | Medium | Dynamic imports, tree-shaking |
| SendGrid/Twilio rate limits in production | Low | Medium | Queue with retry, rate limiting |

## Recommended Build Order

1. **Documents + Communication** (parallel) — foundational for later services
2. **Credit** — depends on Accounting events from Sprint 1
3. **Analytics** — depends on data from all other services
4. **Launch Prep + Go-Live** — can overlap with service builds
5. **Business Ops** — documentation and planning, least technical
