# Appendix

Reference materials including glossary, FAQ, and additional resources for the 3PL Platform.

---

## Table of Contents

1. [Glossary](#glossary)
2. [Frequently Asked Questions](#frequently-asked-questions)
3. [Status Codes Reference](#status-codes-reference)
4. [Equipment Types](#equipment-types)
5. [Accessorial Codes](#accessorial-codes)
6. [EDI Transaction Reference](#edi-transaction-reference)
7. [API Error Codes](#api-error-codes)

---

## Glossary

### A

**Accessorial** - Additional service or charge beyond basic transportation (e.g., detention, liftgate, lumper)

**Agent** - Independent sales representative who brings freight to a broker in exchange for commission

**API** - Application Programming Interface; method for software systems to communicate

**AR** (Accounts Receivable) - Money owed to the company by customers

**AP** (Accounts Payable) - Money owed by the company to carriers

**Authority** - Operating license granted by FMCSA to carriers and brokers

### B

**BASIC** - Behavior Analysis and Safety Improvement Categories; seven safety categories measured by CSA

**Bill of Lading (BOL)** - Legal document between shipper and carrier detailing freight shipment

**Blind Shipment** - Shipment where shipper/consignee info is hidden from carrier

**Brokerage** - Service of arranging transportation between shippers and carriers

**Broker Authority** - FMCSA license (MC number) authorizing freight brokerage operations

### C

**Carrier** - Company that physically transports freight using owned or leased equipment

**CDL** - Commercial Driver's License required to operate commercial vehicles

**Chassis** - Wheel frame for mounting shipping containers

**Class** - Freight classification (1-500) determining shipping rates based on density, handling, etc.

**CMV** - Commercial Motor Vehicle

**Consignee** - Recipient of shipped goods

**CSA** - Compliance, Safety, Accountability; FMCSA's safety measurement program

**CWT** - Hundredweight; 100 pounds, common billing unit

### D

**Deadhead** - Miles driven without a load (unpaid miles)

**Delivery Appointment** - Scheduled time window for freight delivery

**Demurrage** - Charge for holding a container at a port/terminal beyond free time

**Detention** - Charge for holding a truck/trailer beyond allowed loading/unloading time

**DOT** - Department of Transportation

**DOT Number** - Unique identifier assigned by FMCSA to commercial carriers

**Drayage** - Short-distance transport of containers to/from ports or rail yards

**Drop and Hook** - Driver drops loaded trailer and picks up empty (no wait time)

**Dry Van** - Enclosed trailer without temperature control

### E

**EDI** - Electronic Data Interchange; standard format for business document exchange

**ELD** - Electronic Logging Device; required for HOS compliance

**ETA** - Estimated Time of Arrival

### F

**FCL** - Full Container Load (ocean freight)

**Flatbed** - Open trailer without sides or roof for oversized cargo

**FMCSA** - Federal Motor Carrier Safety Administration

**FOB** - Free On Board; point where ownership/risk transfers

**Fuel Surcharge (FSC)** - Additional charge to offset fluctuating fuel costs

### G

**General Commodity** - Non-specialized freight moving in standard equipment

**Gross Margin** - Revenue minus direct carrier costs

### H

**Hazmat** - Hazardous Materials requiring special handling and documentation

**HOS** - Hours of Service; regulations limiting driver driving/working time

### I

**Intermodal** - Freight movement using multiple transport modes (truck + rail)

**Interstate** - Transportation crossing state lines

### L

**Lane** - Regular shipping route between origin and destination

**LCL** - Less than Container Load (ocean freight)

**Linehaul** - Base transportation charge for moving freight (excluding accessorials)

**Live Load/Unload** - Driver waits while freight is loaded/unloaded

**Load Board** - Platform where brokers post available loads and carriers search for freight

**Logistics** - Planning and coordination of freight transportation

**LTL** - Less Than Truckload; partial shipments combined with others

**Lumper** - Third-party service provider for loading/unloading freight

### M

**MC Number** - Motor Carrier number; FMCSA authority number for for-hire carriers

**Mode** - Method of transportation (truck, rail, ocean, air)

**Motor Carrier** - Company operating trucks for hire

### N

**NOA** - Notice of Assignment; document directing payment to factoring company

**NMFC** - National Motor Freight Classification; freight class system

### O

**O/O** - Owner-Operator; independent contractor who owns and operates their truck

**OTR** - Over The Road; long-haul trucking

**Out-of-Service (OOS)** - Status preventing operation due to safety violation

### P

**POD** - Proof of Delivery; signed document confirming delivery

**Power Unit** - Truck tractor

**Primary Pickup/Delivery** - Main pickup or delivery point on a shipment

### Q

**Quick Pay** - Accelerated payment to carrier in exchange for fee (typically 2-5%)

### R

**Rate Confirmation** - Document confirming agreed rate between broker and carrier

**Reefer** - Refrigerated trailer

**RPM** - Revenue Per Mile; total revenue divided by miles

### S

**SAFER** - Safety and Fitness Electronic Records System; FMCSA carrier data system

**Shipper** - Party who sends freight; may or may not be the customer

**Split** - Division of commission or revenue between parties

**Spot Market** - One-time loads priced at current market rates

**Step Deck** - Flatbed trailer with lowered rear deck for taller freight

**Surety Bond** - Financial guarantee required of brokers ($75,000)

### T

**Tariff** - Published rate schedule

**Team Drivers** - Two drivers sharing a truck to maximize driving time

**TL/FTL** - Truckload/Full Truckload; shipment using entire truck capacity

**TMS** - Transportation Management System

**Tracking** - Monitoring load location and status throughout transit

**Trailer Pool** - Trailers staged at shipper/receiver for drop and hook operations

**Transit Time** - Days/hours for freight to travel origin to destination

### U

**UCR** - Unified Carrier Registration; annual registration for interstate carriers

### V

**VMT** - Vehicle Miles Traveled

### W

**Waybill** - Document with freight details traveling with the shipment

---

## Frequently Asked Questions

### General

**Q: What is the difference between a broker and a carrier?**
A: A broker arranges transportation but doesn't own trucks. A carrier owns equipment and physically moves freight. Our platform supports both.

**Q: Can we use this system if we're both a broker and carrier?**
A: Yes, the platform supports mixed operations with proper authority separation.

**Q: Is the platform multi-tenant?**
A: Yes, each company has isolated data with its own configuration, users, and customizations.

### Technical

**Q: What tech stack is used?**
A: NestJS (Node.js) backend, React frontend, PostgreSQL database, Redis caching, deployed on AWS.

**Q: Is there an API available?**
A: Yes, full REST API with OpenAPI documentation. GraphQL planned for Phase B.

**Q: How is data backup handled?**
A: Continuous backup via Aurora, daily snapshots, cross-region replication, 35-day retention.

**Q: What's the expected uptime?**
A: 99.9% availability SLA with less than 45 minutes monthly downtime.

### Migration

**Q: Can we migrate from McLeod/TMW/etc?**
A: Yes, we have pre-built connectors for major TMS platforms. See [Migrations](../07-migrations/README.md).

**Q: Will we lose historical data during migration?**
A: No, all historical records are preserved with source system references.

**Q: Can we run old and new systems in parallel?**
A: Yes, incremental sync supports parallel operation during transition.

### Compliance

**Q: Is the system FMCSA compliant?**
A: Yes, includes carrier verification, insurance tracking, and authority monitoring.

**Q: Do you support EDI?**
A: Yes, X12 204, 210, 214, and 990 transaction sets are supported.

**Q: Is there audit logging for SOC 2?**
A: Yes, comprehensive audit trails with 7-year retention for compliance.

### Billing

**Q: How is pricing structured?**
A: Tiered subscription based on users and volume. See [Super Admin](../02-services/34-super-admin/README.md).

**Q: Is there a free trial?**
A: Yes, 14-day trial with full functionality.

**Q: What payment methods are accepted?**
A: Credit card, ACH, and invoicing for enterprise plans.

---

## Status Codes Reference

### Order Status

| Code         | Status     | Description                     |
| ------------ | ---------- | ------------------------------- |
| `DRAFT`      | Draft      | Order created but not submitted |
| `PENDING`    | Pending    | Awaiting approval or processing |
| `APPROVED`   | Approved   | Ready for dispatch              |
| `DISPATCHED` | Dispatched | Carrier assigned and notified   |
| `IN_TRANSIT` | In Transit | Freight is moving               |
| `DELIVERED`  | Delivered  | Freight delivered to consignee  |
| `INVOICED`   | Invoiced   | Customer invoice created        |
| `PAID`       | Paid       | Payment received                |
| `CANCELLED`  | Cancelled  | Order cancelled                 |
| `ON_HOLD`    | On Hold    | Temporarily paused              |

### Load Status

| Code          | Status                 | Description                      |
| ------------- | ---------------------- | -------------------------------- |
| `AVAILABLE`   | Available              | Ready for carrier assignment     |
| `PENDING`     | Pending                | Awaiting carrier confirmation    |
| `BOOKED`      | Booked                 | Carrier confirmed                |
| `DISPATCHED`  | Dispatched             | Driver assigned and notified     |
| `AT_PICKUP`   | At Pickup              | Truck arrived at origin          |
| `LOADING`     | Loading                | Freight being loaded             |
| `IN_TRANSIT`  | In Transit             | En route to destination          |
| `AT_DELIVERY` | At Delivery            | Truck arrived at destination     |
| `UNLOADING`   | Unloading              | Freight being unloaded           |
| `DELIVERED`   | Delivered              | Delivery completed               |
| `TONU`        | Truck Ordered Not Used | Carrier cancelled after dispatch |

### Invoice Status

| Code       | Status           | Description             |
| ---------- | ---------------- | ----------------------- |
| `DRAFT`    | Draft            | Invoice being prepared  |
| `PENDING`  | Pending Approval | Awaiting approval       |
| `APPROVED` | Approved         | Ready to send           |
| `SENT`     | Sent             | Sent to customer        |
| `VIEWED`   | Viewed           | Customer viewed invoice |
| `PARTIAL`  | Partial Payment  | Partially paid          |
| `PAID`     | Paid             | Fully paid              |
| `OVERDUE`  | Overdue          | Past due date           |
| `VOID`     | Void             | Cancelled/voided        |
| `BAD_DEBT` | Bad Debt         | Written off             |

---

## Equipment Types

### Trailer Types

| Code  | Name                | Description                    |
| ----- | ------------------- | ------------------------------ |
| `V`   | Dry Van             | Standard enclosed trailer      |
| `R`   | Reefer              | Temperature-controlled trailer |
| `F`   | Flatbed             | Open deck for oversized        |
| `SD`  | Step Deck           | Lowered rear deck flatbed      |
| `RGN` | Removable Gooseneck | Heavy haul trailer             |
| `DD`  | Double Drop         | Extra low deck height          |
| `LB`  | Lowboy              | Ground-level loading           |
| `CN`  | Conestoga           | Flatbed with rolling tarp      |
| `HB`  | Hopper              | Dry bulk                       |
| `TK`  | Tank                | Liquid bulk                    |
| `AC`  | Auto Carrier        | Vehicle transport              |
| `C`   | Container           | Intermodal container           |

### Trailer Sizes

| Code | Description        |
| ---- | ------------------ |
| `48` | 48 foot            |
| `53` | 53 foot (standard) |
| `45` | 45 foot            |
| `40` | 40 foot            |
| `20` | 20 foot            |

### Temperature Requirements

| Code     | Range       | Use                   |
| -------- | ----------- | --------------------- |
| `AMB`    | Ambient     | No temp control       |
| `COOL`   | 35-50Â°F    | Produce, dairy        |
| `FROZEN` | -10 to 0Â°F | Frozen goods          |
| `HEAT`   | 50-70Â°F    | Temperature-sensitive |

---

## Accessorial Codes

### Pickup/Delivery Accessorials

| Code   | Name                 | Typical Rate |
| ------ | -------------------- | ------------ |
| `LFTP` | Liftgate at Pickup   | $75-150      |
| `LFTD` | Liftgate at Delivery | $75-150      |
| `INSP` | Inside Pickup        | $75-150      |
| `INSD` | Inside Delivery      | $75-150      |
| `RESP` | Residential Pickup   | $75-100      |
| `RESD` | Residential Delivery | $75-100      |
| `APPT` | Appointment Required | $50-75       |
| `SORT` | Sort and Segregate   | Varies       |

### Wait Time Accessorials

| Code     | Name                   | Typical Rate     |
| -------- | ---------------------- | ---------------- |
| `DET`    | Detention              | $75/hr after 2hr |
| `LAYD`   | Layover                | $350-500/day     |
| `TONU`   | Truck Ordered Not Used | $250-500         |
| `DRYRUN` | Dry Run                | $250-500         |

### Special Handling

| Code     | Name                | Description             |
| -------- | ------------------- | ----------------------- |
| `HAZ`    | Hazmat              | Hazardous materials     |
| `TEAM`   | Team Required       | Two drivers             |
| `TARP`   | Tarping             | Flatbed cover           |
| `OVER`   | Oversize/Overweight | Permits required        |
| `ESCORT` | Pilot Car           | Escort vehicle required |

### Additional Services

| Code    | Name               | Typical Rate      |
| ------- | ------------------ | ----------------- |
| `LUMP`  | Lumper             | Actual cost + 10% |
| `SCALE` | Scale Ticket       | $15-25            |
| `SEAL`  | High Security Seal | $25-50            |
| `BOND`  | In-Bond            | $50-150           |
| `STOP`  | Additional Stop    | $100-200          |

---

## EDI Transaction Reference

### Transaction Sets

| Set | Name                                      | Direction | Description              |
| --- | ----------------------------------------- | --------- | ------------------------ |
| 204 | Motor Carrier Load Tender                 | Inbound   | Load tender from shipper |
| 990 | Response to Load Tender                   | Outbound  | Accept/decline tender    |
| 214 | Transportation Carrier Shipment Status    | Outbound  | Status updates           |
| 210 | Motor Carrier Freight Details and Invoice | Outbound  | Freight invoice          |
| 997 | Functional Acknowledgment                 | Both      | Confirm receipt          |
| 824 | Application Advice                        | Both      | Error notification       |

### Common Status Codes (214)

| Code | Description                    |
| ---- | ------------------------------ |
| X1   | Arrived at pickup              |
| X3   | Departed pickup                |
| X6   | En route                       |
| D1   | Completed delivery             |
| AG   | Carrier departed with shipment |
| AF   | Carrier arrived at pickup      |

---

## API Error Codes

### HTTP Status Codes

| Code | Status            | Description               |
| ---- | ----------------- | ------------------------- |
| 200  | OK                | Request successful        |
| 201  | Created           | Resource created          |
| 204  | No Content        | Success, no response body |
| 400  | Bad Request       | Invalid request data      |
| 401  | Unauthorized      | Authentication required   |
| 403  | Forbidden         | Permission denied         |
| 404  | Not Found         | Resource not found        |
| 409  | Conflict          | Resource conflict         |
| 422  | Unprocessable     | Validation failed         |
| 429  | Too Many Requests | Rate limit exceeded       |
| 500  | Server Error      | Internal error            |

### Application Error Codes

| Code      | Message                  | Description                 |
| --------- | ------------------------ | --------------------------- |
| `AUTH001` | Invalid credentials      | Login failed                |
| `AUTH002` | Token expired            | Refresh required            |
| `AUTH003` | Insufficient permissions | Access denied               |
| `VAL001`  | Validation failed        | Field validation error      |
| `VAL002`  | Required field missing   | Required field not provided |
| `ENT001`  | Entity not found         | Record doesn't exist        |
| `ENT002`  | Entity already exists    | Duplicate record            |
| `BUS001`  | Business rule violation  | Rule not satisfied          |
| `INT001`  | Integration error        | External service failed     |
| `INT002`  | Rate limit exceeded      | API limit reached           |

---

## Additional Resources

### Industry Standards

- **FMCSA Regulations**: [fmcsa.dot.gov](https://www.fmcsa.dot.gov)
- **EDI Standards**: [x12.org](https://www.x12.org)
- **NMFC Classifications**: [nmfta.org](https://www.nmfta.org)

### Professional Organizations

- **TIA**: Transportation Intermediaries Association
- **TCA**: Truckload Carriers Association
- **ATA**: American Trucking Associations

### Rate Sources

- **DAT**: [dat.com](https://www.dat.com)
- **Truckstop**: [truckstop.com](https://www.truckstop.com)
- **SONAR**: [freightwaves.com/sonar](https://www.freightwaves.com/sonar)

---

## Navigation

- **Previous:** [Verticals](../09-verticals/README.md)
- **Index:** [Home](../README.md)
