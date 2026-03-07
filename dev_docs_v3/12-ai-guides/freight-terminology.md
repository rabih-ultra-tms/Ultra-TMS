# Freight & 3PL Terminology

> AI Dev Guide | Essential glossary for understanding the TMS domain

---

## Core Parties

| Term | Definition |
|------|-----------|
| **Shipper** | The company sending freight (the customer in this TMS). Also called "consignor." |
| **Consignee** | The company receiving freight at the delivery destination. |
| **Carrier** | Trucking company or owner-operator that physically moves the freight. |
| **Broker / 3PL** | The intermediary (Ultra TMS user) that arranges transportation between shipper and carrier. Makes money on the spread between shipper rate and carrier rate. |
| **Driver** | The individual operating the truck. Works for a carrier. |
| **Dispatcher** | The person at the broker who assigns loads to carriers and tracks shipments. |
| **Factor / Factoring Company** | A financial institution that buys carrier invoices at a discount for immediate payment. |

## Shipment Terms

| Term | Definition |
|------|-----------|
| **Load** | A single shipment of freight from origin to destination. The core operational unit in a TMS. |
| **Order** | A customer request for transportation. Can spawn one or more loads. |
| **Lane** | A specific origin-destination route (e.g., "Dallas TX to Chicago IL"). |
| **Line Haul** | The base transportation charge for moving freight from A to B, excluding accessorials. |
| **Accessorial** | Any charge beyond basic transportation: detention, liftgate, fuel surcharge, etc. |
| **Fuel Surcharge (FSC)** | A variable charge added to line haul to account for fuel price fluctuations. Usually a % of line haul. |
| **Detention** | Charge for holding a truck at a facility beyond the allotted free time (usually 2 hours). Typically $75/hr. |
| **Layover** | Charge when a driver must wait overnight at a location. Typically $350/day. |
| **TONU** | Truck Ordered Not Used. Fee charged when a carrier is dispatched but the load is cancelled. Typically $250-500. |
| **Deadhead** | Miles driven empty (no freight). Carriers try to minimize this. |

## Documents

| Term | Definition |
|------|-----------|
| **BOL (Bill of Lading)** | Legal shipping document listing freight details, origin, destination, and terms. Created at pickup. |
| **POD (Proof of Delivery)** | Signed document confirming freight was delivered. Required before invoicing in many operations. |
| **Rate Confirmation (Rate Con)** | Agreement between broker and carrier specifying rate, pickup/delivery details, and terms. |
| **PRO Number** | Progressive number assigned by the carrier to track a shipment. |
| **MC Number** | Motor Carrier number issued by FMCSA. Required to operate as a freight carrier in the US. |
| **DOT Number** | Department of Transportation number. Required for all commercial motor vehicles. |
| **W-9** | IRS tax form from carrier. Required before payment. |

## Equipment

| Term | Abbreviation | Description |
|------|-------------|-------------|
| **Dry Van** | DV | Enclosed 53-foot trailer. Most common (~70% of loads). |
| **Reefer** | RF | Refrigerated trailer with temperature control. For perishables. |
| **Flatbed** | FB | Open platform trailer. For oversized, heavy, or construction materials. |
| **Step Deck** | SD | Flatbed with a lower rear deck. For taller freight. |
| **Lowboy** | LB | Very low trailer for heavy equipment (excavators, etc.). |
| **Conestoga** | CN | Curtain-side flatbed. Combination of flatbed flexibility and enclosed protection. |
| **Power Only** | PO | Tractor only (no trailer). Customer provides the trailer. |
| **Sprinter** | SP | Cargo van. For small, expedited loads. |
| **Hotshot** | HS | Expedited flatbed using medium-duty truck. For time-sensitive freight. |
| **Tanker** | TK | Liquid cargo tank trailer. |

## Compliance & Regulatory

| Term | Definition |
|------|-----------|
| **FMCSA** | Federal Motor Carrier Safety Administration. Regulates trucking companies. |
| **SAFER** | Safety and Fitness Electronic Records. FMCSA database for carrier information. |
| **CSA** | Compliance, Safety, Accountability. FMCSA scoring system for carrier safety. |
| **Authority** | Legal permission to operate as a carrier or broker. Must be AUTHORIZED status in FMCSA. |
| **Hazmat** | Hazardous materials. Requires special endorsements, placarding, and routing. |
| **CDL** | Commercial Driver's License. Required to operate commercial vehicles. Classes: A, B, C. |
| **ELD** | Electronic Logging Device. Required for tracking driver Hours of Service. |
| **HOS** | Hours of Service. Federal rules limiting how long drivers can operate. |

## Financial Terms

| Term | Definition |
|------|-----------|
| **AR (Accounts Receivable)** | Money owed TO the broker by customers. |
| **AP (Accounts Payable)** | Money owed BY the broker to carriers. |
| **Margin** | Revenue minus cost. `margin = customerRate - carrierRate` |
| **Margin %** | `(margin / customerRate) * 100`. Target: 15%+ in this TMS. |
| **Quick Pay** | Paying a carrier faster than standard terms (e.g., 2 days vs 30 days) in exchange for a fee (typically 2-3%). |
| **Settlement** | Payment to a carrier for a completed load. |
| **Aging** | Categorizing receivables by how long they've been outstanding: current, 30, 60, 90, 90+ days. |
| **Factoring** | Carrier sells their invoice to a factoring company for immediate payment at a discount. |
| **Net Terms** | Payment timeline: NET15 (15 days), NET30 (30 days), NET45 (45 days). |

## Status Terms

| Term | Definition |
|------|-----------|
| **Tendered** | Load has been offered to a carrier but not yet accepted. |
| **Dispatched** | Carrier has been given pickup/delivery instructions. |
| **Check Call** | Periodic status update from/about the driver during transit. |
| **In Transit** | Freight is currently moving between pickup and delivery. |
| **Dwell Time** | Time a truck spends waiting at a facility (before detention kicks in). |
