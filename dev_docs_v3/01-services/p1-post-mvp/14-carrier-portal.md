# Service Hub: Carrier Portal (14)

> **Priority:** P1 Post-MVP | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 | Last verified: 2026-03-07

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D (2/10) |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial — 7 controllers in carrier-portal module |
| **Frontend** | Not Built |
| **Tests** | None |
| **Auth** | Separate JWT secret: `CARRIER_PORTAL_JWT_SECRET` |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Carrier Portal definition in dev_docs |
| Backend Controller | Partial | 7 controllers in `apps/api/src/modules/carrier-portal/` |
| Backend Service | Partial | Portal-specific data views for carriers |
| Prisma Models | Partial | Uses Carrier + Load + CheckCall + Document |
| Frontend Pages | Not Built | |
| Hooks | Not Built | |
| Components | Not Built | |
| Tests | None | |
| Auth | Partial | Separate JWT secret configured in env |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Carrier Portal Login | `/portal/carrier/login` | Not Built | Carrier-specific auth |
| My Loads | `/portal/carrier/loads` | Not Built | Loads assigned to this carrier |
| Load Detail | `/portal/carrier/loads/[id]` | Not Built | Stops, rate con, documents |
| Submit Check Call | `/portal/carrier/loads/[id]/checkcall` | Not Built | Mobile-friendly form |
| Update Stop | `/portal/carrier/loads/[id]/stops/[stopId]` | Not Built | Arrive/depart |
| Upload Document | `/portal/carrier/documents` | Not Built | BOL, POD upload |
| My Profile | `/portal/carrier/profile` | Not Built | Carrier info, contacts |
| Rate Confirmation | `/portal/carrier/loads/[id]/rate-con` | Not Built | View + sign |

---

## 4. API Endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| POST | `/api/v1/portal/carrier/auth/login` | Partial | Carrier login |
| GET | `/api/v1/portal/carrier/loads` | Partial | My loads (assigned to carrier) |
| GET | `/api/v1/portal/carrier/loads/:id` | Partial | Load detail + stops |
| POST | `/api/v1/portal/carrier/loads/:id/checkcall` | Partial | Submit check call |
| PATCH | `/api/v1/portal/carrier/stops/:id/arrive` | Partial | Mark arrived |
| PATCH | `/api/v1/portal/carrier/stops/:id/depart` | Partial | Mark departed |
| POST | `/api/v1/portal/carrier/documents` | Partial | Upload BOL/POD |
| GET | `/api/v1/portal/carrier/profile` | Partial | Carrier profile |

---

## 5. Business Rules

1. **Separate Auth:** Carrier portal uses `CARRIER_PORTAL_JWT_SECRET`. Carrier contacts log in using their email + password or magic link. Driver logins are mobile-optimized.
2. **Data Isolation:** A carrier can ONLY see loads assigned to them. Backend filters all queries by `carrierId` from portal JWT.
3. **Check Call Submission:** Carriers submit check calls via the portal. These appear in the Dispatcher's check call log in the main app. Submission triggers a notification to the dispatcher.
4. **Document Upload (POD):** Carriers upload Proof of Delivery via the portal. POD upload triggers the same invoice workflow as internal POD upload. Mobile camera upload is required for drivers.
5. **Rate Confirmation:** Carriers view and electronically sign rate confirmations via the portal. Signature is recorded with timestamp and IP address. Unsigned rate confirmations block dispatch in the main app (configurable).
6. **Mobile-First:** Carrier portal is designed for drivers on mobile devices. Forms must be touch-friendly. POD upload uses camera. Check calls are single-screen with GPS auto-fill.

---

## 6. Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| No frontend portal built | P0 | Deferred to P1 |
| Mobile-optimized design not started | P1 | Open |
| Rate confirmation e-signature not integrated | P2 | Open |
| No tests | P0 | Open |

---

## 7. Tasks

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CPORT-201 | Build Carrier Portal shell + auth | L (8h) | P1 |
| CPORT-202 | Build My Loads + stop management | L (8h) | P1 |
| CPORT-203 | Build Check Call submission (mobile) | M (4h) | P1 |
| CPORT-204 | Build POD upload (camera) | M (4h) | P1 |
| CPORT-205 | Build Rate Confirmation view + e-signature | M (5h) | P2 |

---

## 8. Dependencies

**Depends on:** Auth (separate JWT), TMS Core (loads/stops), Documents (POD upload), Communication (check call alerts)
**Depended on by:** Carriers (external users using mobile portal)
