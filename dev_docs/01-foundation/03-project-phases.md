# Development Phases

The platform is built across **5 phases spanning 162 weeks** (approximately 3 years).

---

## Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         162-WEEK DEVELOPMENT TIMELINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE A (78 weeks)                                                         │
│  ████████████████████████████████████████████████████████████               │
│  Internal MVP - Your Brokerage Operations                                   │
│  Weeks 1-78                                                                 │
│                                                                              │
│  PHASE B (26 weeks)                                                         │
│  ████████████████████                                                       │
│  Enhancement - Internal CRM, Mobile, Advanced                               │
│  Weeks 79-104                                                               │
│                                                                              │
│  PHASE C (24 weeks)                                                         │
│  ██████████████████                                                         │
│  SaaS Launch - Multi-tenant, Fleet/Trucking/Drayage                        │
│  Weeks 105-128                                                              │
│                                                                              │
│  PHASE D (18 weeks)                                                         │
│  ██████████████                                                             │
│  Expansion - Forwarding, Warehouse, Last-Mile                              │
│  Weeks 129-146                                                              │
│                                                                              │
│  PHASE E (16 weeks)                                                         │
│  ████████████                                                               │
│  Specialty - Cold Chain, Heavy Haul, Marketplace                           │
│  Weeks 147-162                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase A: Internal MVP (78 Weeks)

**Goal:** Replace all manual brokerage processes with a working system that you use daily.

**Team:** 2 engineers @ 30 hrs/week each

### Sections

| Section                        | Weeks | Focus                               |
| ------------------------------ | ----- | ----------------------------------- |
| 1. Foundation & Infrastructure | 1-6   | Setup, database, auth, admin        |
| 2. HubSpot Integration         | 7-12  | CRM sync, contact management        |
| 3. Sales & Quoting             | 13-20 | Quotes, rate tables, proposals      |
| 4. TMS Core                    | 21-32 | Orders, loads, stops, tracking      |
| 5. Carrier Management          | 33-40 | Profiles, compliance, scorecards    |
| 6. Accounting Core             | 41-50 | Invoices, payables, settlements     |
| 7. Operations Support          | 51-56 | Claims, credit, commissions         |
| 8. Governance & Documentation  | 53-62 | Testing, monitoring, SLAs, etc.     |
| 9. Extended Features           | 63-70 | EDI, rate intelligence, load boards |
| 10. Analytics & Reporting      | 71-74 | KPIs, dashboards, reports           |
| 11. Customer Portal            | 75-77 | Customer self-service               |
| 12. Phase A Polish             | 78    | Bug fixes, optimization             |

### Go-Lives During Phase A

| Go-Live | Week | Scope                      |
| ------- | ---- | -------------------------- |
| GL-1    | 6    | Admin & user management    |
| GL-2    | 12   | HubSpot sync working       |
| GL-3    | 20   | Quotes can be created/sent |
| GL-4    | 28   | Orders can be managed      |
| GL-5    | 36   | Carriers can be onboarded  |
| GL-6    | 44   | Invoices can be generated  |
| GL-7    | 56   | Full operations workflow   |
| GL-8    | 64   | EDI working                |
| GL-9    | 74   | Analytics available        |
| GL-10   | 78   | Customer portal live       |

### Phase A Deliverables

- [ ] User authentication & RBAC
- [ ] HubSpot bidirectional sync
- [ ] Quote builder with rate lookup
- [ ] Order entry with multi-stop
- [ ] Dispatch board
- [ ] Real-time tracking map
- [ ] Carrier onboarding flow
- [ ] FMCSA/insurance verification
- [ ] Invoice generation
- [ ] Carrier settlement
- [ ] Payment processing
- [ ] Claims management
- [ ] Credit management
- [ ] Commission calculations
- [ ] EDI 204/214/210
- [ ] DAT/Truckstop integration
- [ ] KPI dashboards
- [ ] Customer portal

---

## Phase B: Enhancement (26 Weeks)

**Goal:** Build internal CRM, add mobile app, advanced features.

**Weeks:** 79-104

### Sections

| Section               | Weeks   | Focus                                   |
| --------------------- | ------- | --------------------------------------- |
| 1. Internal CRM Build | 79-88   | Replace HubSpot dependency              |
| 2. HubSpot Migration  | 89-92   | Full data migration                     |
| 3. Mobile App         | 93-98   | React Native driver app                 |
| 4. Advanced Features  | 99-102  | Workflow automation, advanced analytics |
| 5. Phase B Polish     | 103-104 | Testing, refinement                     |

### Phase B Deliverables

- [ ] Full internal CRM module
- [ ] HubSpot data migration complete
- [ ] HubSpot optional (can disconnect)
- [ ] Driver mobile app (iOS/Android)
- [ ] Photo POD capture
- [ ] GPS tracking from app
- [ ] Push notifications
- [ ] Workflow automation engine
- [ ] Custom report builder
- [ ] Advanced analytics
- [ ] API documentation

---

## Phase C: SaaS Launch (24 Weeks)

**Goal:** Launch multi-tenant SaaS, add fleet/trucking/drayage verticals.

**Weeks:** 105-128

### Sections

| Section                        | Weeks   | Focus                    |
| ------------------------------ | ------- | ------------------------ |
| 1. Multi-Tenant Architecture   | 105-110 | Data isolation, billing  |
| 2. Onboarding & Subscription   | 111-114 | Self-service signup      |
| 3. Fleet Management Vertical   | 115-118 | Asset mgmt, maintenance  |
| 4. Trucking Company Vertical   | 119-122 | Driver settlement, IFTA  |
| 5. Drayage/Intermodal Vertical | 123-126 | Container mgmt, port ops |
| 6. Public Launch               | 127-128 | Marketing site, SOC 2    |

### Phase C Deliverables

- [ ] Multi-tenant data isolation
- [ ] Tenant provisioning system
- [ ] Subscription billing (Stripe)
- [ ] Self-service onboarding wizard
- [ ] Fleet management module
- [ ] Asset tracking
- [ ] Maintenance scheduling
- [ ] Trucking company module
- [ ] Driver settlement
- [ ] IFTA/IRP tracking
- [ ] Drayage module
- [ ] Container management
- [ ] Port integration
- [ ] Marketing website
- [ ] Help center / documentation
- [ ] SOC 2 Type 1 compliance

---

## Phase D: Expansion (18 Weeks)

**Goal:** Add freight forwarding, warehouse, last-mile verticals.

**Weeks:** 129-146

### Sections

| Section                        | Weeks   | Focus                          |
| ------------------------------ | ------- | ------------------------------ |
| 1. Freight Forwarding Vertical | 129-135 | Ocean/air booking, customs     |
| 2. Warehouse/3PL Vertical      | 136-141 | WMS core, inventory            |
| 3. Last-Mile Delivery Vertical | 142-146 | Route optimization, driver app |

### Phase D Deliverables

- [ ] Freight forwarding module
- [ ] Ocean/air booking
- [ ] Customs documentation
- [ ] Letter of credit management
- [ ] Trade compliance
- [ ] Warehouse management module
- [ ] Inventory control
- [ ] Pick/pack/ship
- [ ] Receiving workflow
- [ ] Last-mile module
- [ ] Route optimization
- [ ] Driver delivery app
- [ ] Customer ETA tracking
- [ ] Photo proof of delivery

---

## Phase E: Specialty (16 Weeks)

**Goal:** Add specialty verticals, marketplace features.

**Weeks:** 147-162

### Sections

| Section                 | Weeks   | Focus                      |
| ----------------------- | ------- | -------------------------- |
| 1. Cold Chain Vertical  | 147-151 | Temp monitoring, FSMA      |
| 2. Heavy Haul Vertical  | 152-156 | Permits, escorts           |
| 3. Shipper TMS Vertical | 157-160 | Carrier procurement, audit |
| 4. Marketplace Features | 161-162 | Carrier matching, ratings  |

### Phase E Deliverables

- [ ] Cold chain module
- [ ] Temperature monitoring integration
- [ ] FSMA compliance
- [ ] Chain of custody tracking
- [ ] Heavy haul module
- [ ] Permit management
- [ ] Route restrictions
- [ ] Escort scheduling
- [ ] Shipper TMS module
- [ ] Carrier procurement
- [ ] RFQ/RFP workflow
- [ ] Freight audit
- [ ] Marketplace features
- [ ] Carrier discovery
- [ ] Rating/review system
- [ ] Instant booking

---

## Resource Planning

### Phase A (Weeks 1-78)

| Role                | Count | Hours/Week | Total Hours |
| ------------------- | ----- | ---------- | ----------- |
| Full-Stack Engineer | 2     | 30         | 4,680       |
| AI Tools (Claude)   | -     | -          | -           |
| **Total**           | 2     | 60         | 4,680       |

### Phase C+ (Weeks 105+)

| Role                 | Count | Hours/Week | Notes                    |
| -------------------- | ----- | ---------- | ------------------------ |
| Full-Stack Engineers | 3-4   | 40         | Hire after first revenue |
| DevOps Engineer      | 1     | 40         | Part-time initially      |
| Customer Success     | 1     | 40         | First external customers |

---

## Key Milestones

| Week | Milestone              | Significance        |
| ---- | ---------------------- | ------------------- |
| 6    | First login            | System is real      |
| 28   | First internal order   | Using for business  |
| 44   | First internal invoice | Revenue tracking    |
| 78   | Phase A complete       | Full internal MVP   |
| 92   | HubSpot-free           | Independence        |
| 104  | Phase B complete       | Mobile + automation |
| 128  | First paying customer  | SaaS validation     |
| 146  | Phase D complete       | 7 verticals         |
| 162  | Phase E complete       | Full platform       |

---

## Risk Management by Phase

### Phase A Risks

- Scope creep from adding features
- HubSpot integration complexity
- EDI learning curve

### Phase B Risks

- HubSpot data migration edge cases
- Mobile app approval delays
- Feature parity expectations

### Phase C Risks

- Multi-tenant security
- First customer onboarding
- Support scalability

### Phase D/E Risks

- Vertical-specific domain knowledge
- Competition in new verticals
- Resource constraints

---

## Decision Points

### End of Phase A

- Is the internal MVP sufficient for daily operations?
- What's missing that blocks Phase B?
- HubSpot pain points to prioritize?

### End of Phase B

- Ready for external customers?
- What features are must-have for launch?
- Pricing strategy validated?

### End of Phase C

- Customer acquisition sustainable?
- Which vertical gets most traction?
- Hire more engineers?

See [Roadmap](../06-roadmap/README.md) for week-by-week breakdown.
