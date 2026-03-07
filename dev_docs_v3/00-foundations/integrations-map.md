# Integrations Map — Ultra TMS

> **Last Updated:** 2026-03-07
> All third-party integrations: direction, auth method, data flow, build status

---

## Internal Infrastructure (Already Built)

| Service | Port | Purpose | Status |
|---|---|---|---|
| PostgreSQL 15 | 5432 | Primary database | Production |
| Redis 7 | 6379 | Cache + sessions + job queues | Configured (not fully used) |
| Elasticsearch 8.13 | 9200 | Full-text search | Configured (not integrated) |
| Kibana | 5601 | ES dashboard | Running |

---

## Email (Outbound)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| SendGrid | Outbound | API Key | Configured, not tested | Quote emails, invoice emails, load notifications, user onboarding |
| SMTP (fallback) | Outbound | SMTP credentials | Not configured | Alternative if SendGrid fails |

**Data flow:** NestJS service → SendGrid REST API → Customer/carrier inbox

**Env vars:** `SENDGRID_API_KEY`

**Note:** Email templates not yet built. Backend service exists but not fully wired.

---

## SMS / Voice (Outbound)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| Twilio | Outbound | SID + Token | Configured, not tested | Check call reminders, load status SMS, carrier alerts |

**Data flow:** NestJS service → Twilio REST API → Driver/carrier phone

**Env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

---

## ELD Providers (Inbound — Future P2/P3)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| Samsara | Inbound | OAuth 2.0 | NOT BUILT | Real-time GPS tracking, HOS data, driver logs |
| KeepTruckin (Motive) | Inbound | API Key | NOT BUILT | Alternative ELD provider |
| Generic ELD webhook | Inbound | HMAC signature | NOT BUILT | Standard ELD data format |

**Data flow:** ELD device → Provider API → Ultra TMS webhook → Load tracking update

---

## External Load Boards (Bidirectional — Future P3)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| DAT Load Board | Bidirectional | API Key | NOT BUILT | Post loads, find carriers, rate data |
| TruckStop.com | Bidirectional | API Key | NOT BUILT | Alternative load board |
| 123Loadboard | Bidirectional | API Key | NOT BUILT | Additional carrier network |

---

## Mapping / Routing (Future)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| Google Maps API | Inbound | API Key | PARTIAL (in Load Planner) | Route calculation, mileage, transit time |
| PC*MILER | Inbound | API Key | NOT BUILT | Industry-standard trucker routing |

**Note:** Google Maps is used in the Load Planner (PROTECTED). Do not modify.

---

## Payment Processing (Future P2)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| Stripe | Outbound | API Key + Webhook | NOT BUILT | Invoice payments from customers, subscription billing |
| ACH / Bank Transfer | Outbound | Plaid or direct | NOT BUILT | Carrier settlement payments |

---

## Factoring (Future P2/P3)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| TriumphPay | Bidirectional | API Key | NOT BUILT | Carrier invoice factoring |
| RTS Financial | Bidirectional | API Key | NOT BUILT | Alternative factoring provider |

---

## ERP / TMS Integration (Future P2)

| Provider | Direction | Auth | Status | Use Cases |
|---|---|---|---|---|
| QuickBooks | Bidirectional | OAuth 2.0 | NOT BUILT | Accounting sync |
| SAP | Bidirectional | API Key | NOT BUILT | Enterprise ERP integration |
| McLeod | Inbound | Webhook/EDI | NOT BUILT | McLeod TMS data migration |

---

## EDI (Future P3)

| Standard | Direction | Status | Use Cases |
|---|---|---|---|
| EDI 204 | Inbound | NOT BUILT | Motor carrier load tender |
| EDI 214 | Outbound | NOT BUILT | Transportation carrier shipment status message |
| EDI 210 | Outbound | NOT BUILT | Motor carrier freight invoice |
| EDI 997 | Bidirectional | NOT BUILT | Functional acknowledgment |

**Note:** EDI requires a VAN (Value Added Network) or AS2 connection. Needs dedicated sprint.

---

## Integration Priority Matrix

| Integration | Priority | Effort | Business Value |
|---|---|---|---|
| Email (SendGrid) | P1 | S | High — customer/carrier communication |
| SMS (Twilio) | P1 | S | High — driver check calls |
| Google Maps | MVP | DONE | Critical — Load Planner (PROTECTED) |
| External Load Board (DAT) | P3 | XL | High — carrier acquisition |
| ELD (Samsara) | P2 | L | High — real-time tracking |
| Payment (Stripe) | P2 | L | High — automated collections |
| QuickBooks | P2 | M | Medium — accounting sync |
| EDI | P3 | XL | Medium — enterprise clients only |
| Factoring | P2 | M | Medium — carrier cash flow |
