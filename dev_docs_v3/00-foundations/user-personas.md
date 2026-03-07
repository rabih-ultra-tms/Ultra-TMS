# User Personas — Ultra TMS

> **Last Updated:** 2026-03-07
> These personas define who uses Ultra TMS and what they need most.
> Every feature must be evaluated against: "which persona does this serve, and how critical is it to them?"

---

## Persona 1: The Dispatcher (PRIMARY USER)

**Name:** Mike, freight dispatcher at a 3PL company
**Role in system:** DISPATCHER
**Usage:** 8-10 hours/day, the heaviest user of the system

**What they need:**
- See all active loads at a glance (dispatch board)
- Quickly assign available carriers to open loads
- Track in-transit loads in real time
- Get alerts when loads are delayed or carriers don't check in
- Process check calls (driver location/status updates)
- Coordinate between customers and carriers

**Deal-breakers (if these don't work, they won't use the product):**
- Real-time dispatch board (WebSocket — QS-001 is the top P0 task)
- Quick carrier search and assignment (must be <3 clicks)
- Check call form (RHF refactor needed — QS-006)
- Mobile-friendly interface (dispatchers often work from tablets)

**Screen count:** ~15 screens (dispatch board, load detail, carrier search, check call, tracking map)

---

## Persona 2: The Sales Rep / Broker (HIGH VALUE)

**Name:** Sarah, freight broker
**Role in system:** ADMIN or MANAGER
**Usage:** 4-6 hours/day

**What they need:**
- Create and send quotes quickly
- Use the Load Planner to estimate costs and routes
- Track quote-to-load conversion
- Manage customer relationships (CRM)
- See revenue metrics and win rates

**Deal-breakers:**
- Load Planner must work reliably (PROTECTED — do not touch)
- Quote creation must be fast (<2 minutes to create and send)
- Customer history visible on quote screen

**Screen count:** ~12 screens (quote list, quote form, load planner, CRM list, customer detail, dashboard)

---

## Persona 3: The Accounting Team Member (FINANCIAL)

**Name:** Jennifer, accounting manager
**Role in system:** ACCOUNTING
**Usage:** 3-5 hours/day

**What they need:**
- See all outstanding invoices and their status
- Process carrier settlements
- Generate financial reports (P&L by period, by lane, by carrier)
- Track commission calculations for sales agents
- See overdue invoices and payment status

**Deal-breakers:**
- Invoice management must be accurate (financial data integrity is critical)
- Settlement amounts must match carrier agreements
- Reports must export to Excel/CSV

**Screen count:** ~10 screens (invoice list, settlement list, accounting dashboard, commission reports, payment processing)

---

## Persona 4: The Company Admin (ADMINISTRATOR)

**Name:** Tom, operations director
**Role in system:** ADMIN
**Usage:** 1-3 hours/day, mostly oversight

**What they need:**
- Manage user accounts (create, edit, deactivate)
- Configure system settings (company info, integrations, rate tables)
- See company-wide performance metrics
- Manage carrier qualifications and compliance
- Control access permissions

**Deal-breakers:**
- User management must be simple and auditable
- Cannot accidentally expose sensitive data to wrong role
- Profile page must work (currently a 0/10 stub — QS-005)

**Screen count:** ~8 screens (user management, settings, admin dashboard, permission management)

---

## Persona 5: The Carrier Agent (EXTERNAL PARTNER)

**Name:** Carlos, carrier company's dispatch coordinator
**Role in system:** CARRIER_AGENT (carrier portal)
**Usage:** 2-4 hours/day

**What they need:**
- See loads assigned to their carrier
- Confirm load acceptance / rejection
- Update load status (picked up, in transit, delivered)
- Upload proof of delivery documents
- View and download rate confirmations

**Deal-breakers:**
- Portal must be simple (carrier agents are not technical)
- Must work on mobile
- Rate confirmation download must be reliable

**Screen count:** ~6 screens (carrier portal load list, load detail, document upload, rate confirmation)

---

## Persona 6: The Customer / Shipper (EXTERNAL PARTNER)

**Name:** Amy, shipping manager at a manufacturing company
**Role in system:** CUSTOMER_REP (customer portal)
**Usage:** 1-2 hours/day

**What they need:**
- See status of their shipments in real time
- Get notifications when loads are picked up / delivered
- Download invoices and proof of delivery
- Request new quotes

**Deal-breakers:**
- Real-time tracking map (customer-facing)
- Invoice download must work reliably
- No technical knowledge required — UI must be self-explanatory

**Screen count:** ~5 screens (customer portal shipment list, tracking, invoices, quote request)

---

## Persona 7: The Super Admin (PLATFORM OPERATOR)

**Name:** Internal Rabih team
**Role in system:** SUPER_ADMIN
**Usage:** Occasional (tenant management, support)

**What they need:**
- Create and manage tenant accounts
- See cross-tenant system health
- Debug issues for specific tenants
- Manage subscription/billing

**Screen count:** ~4 screens (tenant list, tenant detail, system health, support tools)

---

## Persona Priority Matrix

| Persona | Business Priority | Feature Priority | Must-Have Screens |
|---|---|---|---|
| Dispatcher | CRITICAL | P0 | Dispatch board, load detail, carrier assignment |
| Sales Rep | CRITICAL | P0 | Load planner (PROTECTED), quote management |
| Accounting | HIGH | P0 | Invoice management, settlement processing |
| Company Admin | HIGH | P0 | User management, system settings |
| Carrier Agent | MEDIUM | P1 | Carrier portal |
| Customer | MEDIUM | P1 | Customer portal, tracking |
| Super Admin | LOW | P2 | Tenant management |
